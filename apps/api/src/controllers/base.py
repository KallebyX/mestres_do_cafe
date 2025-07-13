"""
Base controller class to eliminate duplication in route handlers
"""
from flask import request, jsonify
from functools import wraps
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class BaseController:
    """
    Base controller class with common CRUD operations and utilities
    """
    
    def __init__(self, model, db_session):
        self.model = model
        self.db = db_session
        self.per_page = 20
        
    def _get_request_data(self) -> Dict[str, Any]:
        """Get request data from JSON or form"""
        try:
            if request.is_json:
                return request.get_json() or {}
            return request.form.to_dict()
        except Exception as e:
            logger.error(f"Error getting request data: {e}")
            return {}
    
    def _get_query_params(self) -> Dict[str, Any]:
        """Get query parameters from request"""
        return request.args.to_dict()
    
    def _success_response(self, data: Any = None, message: str = "Success", code: int = 200):
        """Standard success response format"""
        response = {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        return jsonify(response), code
    
    def _error_response(self, message: str = "Error", code: int = 400, details: Any = None):
        """Standard error response format"""
        response = {
            "success": False,
            "message": message,
            "error": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        return jsonify(response), code
    
    def _validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> Optional[str]:
        """Validate required fields in request data"""
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return f"Missing required fields: {', '.join(missing_fields)}"
        return None
    
    def _apply_filters(self, query, filters: Dict[str, Any]):
        """Apply filters to query"""
        for key, value in filters.items():
            if value is not None and value != '':
                if hasattr(self.model, key):
                    column = getattr(self.model, key)
                    if isinstance(value, str) and '%' in value:
                        query = query.filter(column.like(value))
                    else:
                        query = query.filter(column == value)
        return query
    
    def _apply_sorting(self, query, sort_by: str = None, sort_order: str = 'asc'):
        """Apply sorting to query"""
        if sort_by and hasattr(self.model, sort_by):
            column = getattr(self.model, sort_by)
            if sort_order.lower() == 'desc':
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
        return query
    
    def _paginate_query(self, query, page: int = 1, per_page: int = None):
        """Apply pagination to query"""
        per_page = per_page or self.per_page
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    def _serialize_model(self, model_instance):
        """Serialize model instance to dictionary"""
        if hasattr(model_instance, 'to_dict'):
            return model_instance.to_dict()
        
        # Fallback serialization
        result = {}
        for column in model_instance.__table__.columns:
            value = getattr(model_instance, column.name)
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            else:
                result[column.name] = value
        return result
    
    def get_all(self):
        """Get all records with optional filtering, sorting, and pagination"""
        try:
            query_params = self._get_query_params()
            
            # Start with base query
            query = self.db.query(self.model)
            
            # Apply filters
            filters = {k: v for k, v in query_params.items() 
                      if k not in ['page', 'per_page', 'sort_by', 'sort_order']}
            query = self._apply_filters(query, filters)
            
            # Apply sorting
            sort_by = query_params.get('sort_by')
            sort_order = query_params.get('sort_order', 'asc')
            query = self._apply_sorting(query, sort_by, sort_order)
            
            # Apply pagination
            page = int(query_params.get('page', 1))
            per_page = int(query_params.get('per_page', self.per_page))
            paginated = self._paginate_query(query, page, per_page)
            
            # Serialize results
            items = [self._serialize_model(item) for item in paginated.items]
            
            result = {
                'items': items,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                }
            }
            
            return self._success_response(result, "Records retrieved successfully")
            
        except Exception as e:
            logger.error(f"Error retrieving records: {e}")
            return self._error_response("Error retrieving records", 500, str(e))
    
    def get_by_id(self, record_id):
        """Get single record by ID"""
        try:
            record = self.db.query(self.model).filter(self.model.id == record_id).first()
            
            if not record:
                return self._error_response("Record not found", 404)
            
            return self._success_response(
                self._serialize_model(record),
                "Record retrieved successfully"
            )
            
        except Exception as e:
            logger.error(f"Error retrieving record {record_id}: {e}")
            return self._error_response("Error retrieving record", 500, str(e))
    
    def create(self, required_fields: List[str] = None):
        """Create new record"""
        try:
            data = self._get_request_data()
            
            # Validate required fields
            if required_fields:
                validation_error = self._validate_required_fields(data, required_fields)
                if validation_error:
                    return self._error_response(validation_error, 400)
            
            # Create new record
            record = self.model(**data)
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)
            
            return self._success_response(
                self._serialize_model(record),
                "Record created successfully",
                201
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating record: {e}")
            return self._error_response("Error creating record", 500, str(e))
    
    def update(self, record_id, allowed_fields: List[str] = None):
        """Update existing record"""
        try:
            record = self.db.query(self.model).filter(self.model.id == record_id).first()
            
            if not record:
                return self._error_response("Record not found", 404)
            
            data = self._get_request_data()
            
            # Filter allowed fields
            if allowed_fields:
                data = {k: v for k, v in data.items() if k in allowed_fields}
            
            # Update record
            for key, value in data.items():
                if hasattr(record, key):
                    setattr(record, key, value)
            
            record.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(record)
            
            return self._success_response(
                self._serialize_model(record),
                "Record updated successfully"
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating record {record_id}: {e}")
            return self._error_response("Error updating record", 500, str(e))
    
    def delete(self, record_id):
        """Delete record by ID"""
        try:
            record = self.db.query(self.model).filter(self.model.id == record_id).first()
            
            if not record:
                return self._error_response("Record not found", 404)
            
            self.db.delete(record)
            self.db.commit()
            
            return self._success_response(
                None,
                "Record deleted successfully"
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting record {record_id}: {e}")
            return self._error_response("Error deleting record", 500, str(e))
    
    def bulk_create(self, data_list: List[Dict[str, Any]], required_fields: List[str] = None):
        """Create multiple records"""
        try:
            if not data_list:
                return self._error_response("No data provided", 400)
            
            # Validate each record
            if required_fields:
                for i, data in enumerate(data_list):
                    validation_error = self._validate_required_fields(data, required_fields)
                    if validation_error:
                        return self._error_response(f"Record {i+1}: {validation_error}", 400)
            
            # Create records
            records = []
            for data in data_list:
                record = self.model(**data)
                records.append(record)
                self.db.add(record)
            
            self.db.commit()
            
            # Refresh and serialize
            for record in records:
                self.db.refresh(record)
            
            result = [self._serialize_model(record) for record in records]
            
            return self._success_response(
                result,
                f"{len(records)} records created successfully",
                201
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating bulk records: {e}")
            return self._error_response("Error creating records", 500, str(e))
    
    def bulk_update(self, updates: List[Dict[str, Any]], allowed_fields: List[str] = None):
        """Update multiple records"""
        try:
            if not updates:
                return self._error_response("No data provided", 400)
            
            updated_records = []
            
            for update_data in updates:
                record_id = update_data.get('id')
                if not record_id:
                    continue
                
                record = self.db.query(self.model).filter(self.model.id == record_id).first()
                if not record:
                    continue
                
                # Filter allowed fields
                if allowed_fields:
                    update_data = {k: v for k, v in update_data.items() if k in allowed_fields}
                
                # Update record
                for key, value in update_data.items():
                    if hasattr(record, key) and key != 'id':
                        setattr(record, key, value)
                
                record.updated_at = datetime.utcnow()
                updated_records.append(record)
            
            self.db.commit()
            
            # Refresh and serialize
            for record in updated_records:
                self.db.refresh(record)
            
            result = [self._serialize_model(record) for record in updated_records]
            
            return self._success_response(
                result,
                f"{len(updated_records)} records updated successfully"
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating bulk records: {e}")
            return self._error_response("Error updating records", 500, str(e))
    
    def bulk_delete(self, record_ids: List[int]):
        """Delete multiple records"""
        try:
            if not record_ids:
                return self._error_response("No IDs provided", 400)
            
            deleted_count = self.db.query(self.model).filter(
                self.model.id.in_(record_ids)
            ).delete(synchronize_session=False)
            
            self.db.commit()
            
            return self._success_response(
                {'deleted_count': deleted_count},
                f"{deleted_count} records deleted successfully"
            )
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting bulk records: {e}")
            return self._error_response("Error deleting records", 500, str(e))
    
    def search(self, search_fields: List[str], query_param: str = 'q'):
        """Search records by text in specified fields"""
        try:
            query_params = self._get_query_params()
            search_term = query_params.get(query_param, '').strip()
            
            if not search_term:
                return self._error_response("Search term is required", 400)
            
            # Build search query
            query = self.db.query(self.model)
            
            search_conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    column = getattr(self.model, field)
                    search_conditions.append(column.ilike(f'%{search_term}%'))
            
            if search_conditions:
                from sqlalchemy import or_
                query = query.filter(or_(*search_conditions))
            
            # Apply pagination
            page = int(query_params.get('page', 1))
            per_page = int(query_params.get('per_page', self.per_page))
            paginated = self._paginate_query(query, page, per_page)
            
            # Serialize results
            items = [self._serialize_model(item) for item in paginated.items]
            
            result = {
                'items': items,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                },
                'search_term': search_term
            }
            
            return self._success_response(result, "Search completed successfully")
            
        except Exception as e:
            logger.error(f"Error searching records: {e}")
            return self._error_response("Error searching records", 500, str(e))


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask_jwt_extended import verify_jwt_in_request
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({"success": False, "message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function


def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            if not current_user.get('is_admin'):
                return jsonify({"success": False, "message": "Admin access required"}), 403
        except Exception:
            return jsonify({"success": False, "message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function


def handle_exceptions(f):
    """Decorator to handle common exceptions"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({"success": False, "message": "Invalid data", "error": str(e)}), 400
        except Exception as e:
            logger.error(f"Unhandled exception in {f.__name__}: {e}")
            return jsonify({"success": False, "message": "Internal server error"}), 500
    return decorated_function