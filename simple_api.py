#!/usr/bin/env python3
"""
Simple API server for testing frontend integration
"""
import os
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, 
     origins=["http://localhost:3000", "http://localhost:3001"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

DATABASE_PATH = 'mestres_cafe.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, description, price, stock_quantity, is_active, is_featured, origin, sca_score, flavor_notes
            FROM products 
            WHERE is_active = 1
            ORDER BY id
        """)
        products = cursor.fetchall()
        conn.close()
        
        result = []
        for product in products:
            product_dict = dict(product)
            # Parse JSON flavor_notes if it exists
            if product_dict.get('flavor_notes'):
                try:
                    product_dict['flavor_notes'] = json.loads(product_dict['flavor_notes'])
                except:
                    product_dict['flavor_notes'] = []
            result.append(product_dict)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, description, price, stock_quantity, is_active, is_featured, origin, sca_score, flavor_notes
            FROM products 
            WHERE id = ? AND is_active = 1
        """, (product_id,))
        product = cursor.fetchone()
        conn.close()
        
        if product:
            product_dict = dict(product)
            if product_dict.get('flavor_notes'):
                try:
                    product_dict['flavor_notes'] = json.loads(product_dict['flavor_notes'])
                except:
                    product_dict['flavor_notes'] = []
            return jsonify(product_dict)
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    try:
        data = request.get_json()
        
        # Required fields
        name = data.get('name')
        price = data.get('price')
        
        if not name or not price:
            return jsonify({'error': 'Name and price are required'}), 400
        
        # Optional fields with defaults
        description = data.get('description', '')
        stock_quantity = data.get('stock_quantity', 0)
        is_active = data.get('is_active', True)
        is_featured = data.get('is_featured', False)
        origin = data.get('origin', '')
        sca_score = data.get('sca_score', 0)
        flavor_notes = data.get('flavor_notes', [])
        
        # Convert flavor_notes to JSON string if it's a list
        if isinstance(flavor_notes, list):
            flavor_notes = json.dumps(flavor_notes)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, description, price, stock_quantity, is_active, is_featured, origin, sca_score, flavor_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, description, price, stock_quantity, is_active, is_featured, origin, sca_score, flavor_notes))
        
        product_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'product': {
                'id': product_id,
                'name': name,
                'description': description,
                'price': price,
                'stock_quantity': stock_quantity,
                'is_active': is_active,
                'is_featured': is_featured,
                'origin': origin,
                'sca_score': sca_score,
                'flavor_notes': json.loads(flavor_notes) if flavor_notes else []
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        
        allowed_fields = ['name', 'description', 'price', 'stock_quantity', 'is_active', 'is_featured', 'origin', 'sca_score', 'flavor_notes']
        
        for field in allowed_fields:
            if field in data:
                if field == 'flavor_notes' and isinstance(data[field], list):
                    values.append(json.dumps(data[field]))
                else:
                    values.append(data[field])
                update_fields.append(f"{field} = ?")
        
        if not update_fields:
            conn.close()
            return jsonify({'error': 'No valid fields to update'}), 400
        
        values.append(product_id)
        query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Product updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Soft delete by setting is_active to False
        cursor.execute("UPDATE products SET is_active = 0 WHERE id = ?", (product_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Product deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Clean and validate email - only strip whitespace
        clean_email = email.strip()
        
        if not validate_email(clean_email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (clean_email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User already exists'}), 400
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (email, password, name, is_active)
            VALUES (?, ?, ?, 1)
        """, (clean_email, password, name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'user': {
                'id': user_id,
                'email': clean_email,
                'name': name
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def validate_email(email):
    """Validate email format - ensure no ':' anywhere in the email"""
    if not email or '@' not in email:
        return False
    
    # Check that email doesn't contain ':' anywhere
    if ':' in email:
        return False
    
    # Split email into local and domain parts
    parts = email.split('@')
    if len(parts) != 2:
        return False
    
    local_part, domain_part = parts
    
    # Basic checks
    if not local_part or not domain_part:
        return False
    
    # Basic domain validation (should contain at least one dot)
    if '.' not in domain_part:
        return False
    
    return True

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        print(f"Login attempt - Email: '{email}', Password: '{password}'")
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Clean email - only strip whitespace (no more mailto: cleaning)
        clean_email = email.strip()
        
        # Validate email format - reject any email with ':'
        if not validate_email(clean_email):
            print(f"Invalid email format: '{clean_email}'")
            return jsonify({'error': 'Invalid email format'}), 400
        
        print(f"Final email after cleaning: '{clean_email}'")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, name, is_admin, is_active 
            FROM users 
            WHERE email = ? AND password = ? AND is_active = 1
        """, (clean_email, password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            user_dict = dict(user)
            response = {
                'success': True,
                'user': user_dict,
                'token': f'token_{user_dict["id"]}',
                'access_token': f'token_{user_dict["id"]}',
                'is_admin': user_dict.get('is_admin', False)
            }
            print(f"Login success: {response}")
            return jsonify(response)
        else:
            print(f"Login failed for email: '{clean_email}'")
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart', methods=['GET'])
def get_cart():
    # Simple cart implementation
    return jsonify({'items': [], 'total': 0})

@app.route('/api/cart/items', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        # In a real app, this would be stored in database
        return jsonify({
            'success': True,
            'message': 'Item added to cart',
            'cart_item': {
                'product_id': product_id,
                'quantity': quantity
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, description FROM categories ORDER BY id")
        categories = cursor.fetchall()
        conn.close()
        
        result = [dict(cat) for cat in categories]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/analytics/stats', methods=['GET'])
def get_analytics_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get product count
        cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1")
        product_count = cursor.fetchone()[0]
        
        # Get user count
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        user_count = cursor.fetchone()[0]
        
        # Get category count
        cursor.execute("SELECT COUNT(*) FROM categories")
        category_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'products': product_count,
            'users': user_count,
            'categories': category_count,
            'orders': 0,  # Placeholder
            'revenue': 0  # Placeholder
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog', methods=['GET'])
def get_blog_posts():
    return jsonify([
        {
            'id': 1,
            'title': 'Descubra o Mundo dos Cafés Especiais',
            'slug': 'mundo-cafes-especiais',
            'excerpt': 'Explore a rica diversidade dos cafés especiais do Brasil',
            'created_at': '2025-07-09T12:00:00Z'
        },
        {
            'id': 2,
            'title': 'Como Preparar o Café Perfeito',
            'slug': 'como-preparar-cafe-perfeito',
            'excerpt': 'Dicas e técnicas para extrair o melhor sabor do seu café',
            'created_at': '2025-07-08T10:30:00Z'
        }
    ])

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify([])

@app.route('/api/admin/stock', methods=['GET'])
def get_stock():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, stock_quantity, price
            FROM products 
            WHERE is_active = 1
            ORDER BY stock_quantity ASC
        """)
        products = cursor.fetchall()
        conn.close()
        
        result = [dict(product) for product in products]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers', methods=['GET'])
def get_admin_customers():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        search = request.args.get('search', '')
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build search query
        search_condition = ""
        search_params = []
        if search:
            search_condition = "AND (email LIKE ? OR name LIKE ?)"
            search_term = f"%{search}%"
            search_params = [search_term, search_term]
        
        # Get total count
        cursor.execute(f"SELECT COUNT(*) FROM users WHERE is_active = 1 {search_condition}", search_params)
        total = cursor.fetchone()[0]
        
        # Get customers with pagination
        cursor.execute(f"""
            SELECT id, email, name, is_admin, is_active, created_at
            FROM users 
            WHERE is_active = 1 {search_condition}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        """, search_params + [limit, offset])
        
        customers = cursor.fetchall()
        conn.close()
        
        result = []
        for customer in customers:
            customer_dict = dict(customer)
            # Add some mock data for compatibility
            customer_dict.update({
                'created_at': customer_dict.get('created_at', '2025-01-01'),
                'last_login': '2025-01-01',
                'total_orders': 0,
                'total_spent': 0.0,
                'status': 'active' if customer_dict['is_active'] else 'inactive',
                'phone': '',
                'address': '',
                'notes': '',
                'source': 'manual' if customer_dict.get('is_admin') else 'registration'
            })
            result.append(customer_dict)
        
        return jsonify({
            'customers': result,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers', methods=['POST'])
def create_manual_customer():
    try:
        data = request.get_json()
        
        # Required fields
        email = data.get('email')
        name = data.get('name')
        
        if not email or not name:
            return jsonify({'error': 'Email and name are required'}), 400
        
        # Clean and validate email
        clean_email = email.strip()
        if not validate_email(clean_email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (clean_email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Customer with this email already exists'}), 400
        
        # Optional fields
        phone = data.get('phone', '')
        address = data.get('address', '')
        notes = data.get('notes', '')
        password = data.get('password', 'temp123')  # Temporary password
        
        # Insert new customer
        cursor.execute("""
            INSERT INTO users (email, password, name, is_active, is_admin)
            VALUES (?, ?, ?, 1, 0)
        """, (clean_email, password, name))
        
        customer_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer_id,
                'email': clean_email,
                'name': name,
                'phone': phone,
                'address': address,
                'notes': notes,
                'is_active': True,
                'created_at': '2025-07-09T18:45:00Z',
                'source': 'manual'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>', methods=['GET'])
def get_customer_details():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, name, is_admin, is_active, created_at
            FROM users 
            WHERE id = ?
        """, (customer_id,))
        
        customer = cursor.fetchone()
        conn.close()
        
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        customer_dict = dict(customer)
        
        # Mock additional data for detailed view
        customer_dict.update({
            'phone': '',
            'address': '',
            'notes': '',
            'total_orders': 3,
            'total_spent': 287.50,
            'last_login': '2025-07-08T15:30:00Z',
            'last_order_date': '2025-07-07T10:20:00Z',
            'preferred_payment': 'credit_card',
            'segment': 'premium' if customer_dict.get('total_spent', 0) > 200 else 'regular',
            'orders': [
                {
                    'id': 1,
                    'date': '2025-07-07T10:20:00Z',
                    'total': 127.50,
                    'status': 'delivered',
                    'items_count': 3
                },
                {
                    'id': 2,
                    'date': '2025-07-05T14:15:00Z',
                    'total': 89.90,
                    'status': 'delivered',
                    'items_count': 2
                },
                {
                    'id': 3,
                    'date': '2025-07-01T09:45:00Z',
                    'total': 70.10,
                    'status': 'delivered',
                    'items_count': 1
                }
            ],
            'interactions': [
                {
                    'id': 1,
                    'type': 'email',
                    'subject': 'Welcome to Mestres do Café',
                    'date': '2025-07-09T12:00:00Z',
                    'status': 'sent'
                },
                {
                    'id': 2,
                    'type': 'support',
                    'subject': 'Question about coffee preparation',
                    'date': '2025-07-08T16:30:00Z',
                    'status': 'resolved'
                }
            ]
        })
        
        return jsonify(customer_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>', methods=['PUT'])
def update_customer():
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if customer exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (customer_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        allowed_fields = ['name', 'email', 'is_active']
        
        for field in allowed_fields:
            if field in data:
                values.append(data[field])
                update_fields.append(f"{field} = ?")
        
        if not update_fields:
            conn.close()
            return jsonify({'error': 'No valid fields to update'}), 400
        
        values.append(customer_id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Customer updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>/status', methods=['PUT'])
def toggle_customer_status():
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['active', 'inactive']:
            return jsonify({'error': 'Invalid status. Must be "active" or "inactive"'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if customer exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (customer_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        is_active = 1 if new_status == 'active' else 0
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (is_active, customer_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': f'Customer status updated to {new_status}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>/notes', methods=['PUT'])
def update_customer_notes():
    try:
        data = request.get_json()
        note = data.get('note', '')
        
        # Mock update - in real app would update database
        return jsonify({
            'success': True,
            'message': 'Customer notes updated successfully',
            'note': note
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>/interactions', methods=['POST'])
def add_customer_interaction():
    try:
        data = request.get_json()
        
        interaction_type = data.get('type', 'note')
        subject = data.get('subject', '')
        content = data.get('content', '')
        
        new_interaction = {
            'id': 4,  # Mock ID
            'type': interaction_type,
            'subject': subject,
            'content': content,
            'date': '2025-07-09T18:45:00Z',
            'status': 'completed'
        }
        
        return jsonify({
            'success': True,
            'interaction': new_interaction
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        user_id = request.args.get('user_id')
        # Return empty notifications for now
        return jsonify({
            'notifications': [],
            'unread_count': 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/testimonials', methods=['GET'])
def get_testimonials():
    try:
        featured = request.args.get('featured', 'false').lower() == 'true'
        limit = request.args.get('limit', 10, type=int)
        
        # Return mock testimonials for now
        testimonials = [
            {
                'id': 1,
                'name': 'João Silva',
                'content': 'Excelente café! Sabor incrível e qualidade premium.',
                'rating': 5,
                'featured': True,
                'created_at': '2025-01-01'
            },
            {
                'id': 2,
                'name': 'Maria Santos',
                'content': 'O melhor café que já experimentei. Recomendo muito!',
                'rating': 5,
                'featured': True,
                'created_at': '2025-01-02'
            }
        ]
        
        if featured:
            testimonials = [t for t in testimonials if t['featured']]
        
        return jsonify(testimonials[:limit])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        active = request.args.get('active', 'false').lower() == 'true'
        
        # Return mock courses for now
        courses = [
            {
                'id': 1,
                'title': 'Barista Profissional',
                'description': 'Aprenda técnicas avançadas de preparo de café',
                'price': 299.99,
                'duration': '40 horas',
                'active': True,
                'created_at': '2025-01-01'
            },
            {
                'id': 2,
                'title': 'Coffee Cupping',
                'description': 'Curso de degustação e avaliação de cafés',
                'price': 199.99,
                'duration': '20 horas',
                'active': True,
                'created_at': '2025-01-02'
            }
        ]
        
        if active:
            courses = [c for c in courses if c['active']]
        
        return jsonify(courses)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify_auth():
    try:
        # Simple token verification - in production use proper JWT validation
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        # Extract user ID from token (assuming format "token_<user_id>")
        if token.startswith('token_'):
            user_id = token.split('_')[1]
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, is_admin FROM users WHERE id = ? AND is_active = 1", (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return jsonify({
                    'success': True,
                    'user': dict(user)
                })
        
        return jsonify({'error': 'Token inválido'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get product count
        cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1")
        product_count = cursor.fetchone()[0]
        
        # Get user count
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        user_count = cursor.fetchone()[0]
        
        # Get category count
        cursor.execute("SELECT COUNT(*) FROM categories")
        category_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'products': product_count,
            'users': user_count,
            'categories': category_count,
            'orders': 0,  # Placeholder
            'revenue': 0  # Placeholder
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, name, is_admin, is_active, created_at
            FROM users 
            WHERE is_active = 1
            ORDER BY id DESC
            LIMIT 50
        """)
        
        users = cursor.fetchall()
        conn.close()
        
        result = []
        for user in users:
            user_dict = dict(user)
            user_dict.update({
                'created_at': user_dict.get('created_at', '2025-01-01'),
                'last_login': '2025-01-01',
                'total_orders': 0,
                'total_spent': 0.0,
                'status': 'active' if user_dict['is_active'] else 'inactive'
            })
            result.append(user_dict)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/products', methods=['GET'])
def get_admin_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, description, price, stock_quantity, is_active, is_featured, origin, sca_score, flavor_notes
            FROM products 
            ORDER BY id DESC
        """)
        products = cursor.fetchall()
        conn.close()
        
        result = []
        for product in products:
            product_dict = dict(product)
            if product_dict.get('flavor_notes'):
                try:
                    product_dict['flavor_notes'] = json.loads(product_dict['flavor_notes'])
                except:
                    product_dict['flavor_notes'] = []
            result.append(product_dict)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/posts', methods=['GET'])
def get_admin_blog_posts():
    return jsonify([
        {
            'id': 1,
            'title': 'Descubra o Mundo dos Cafés Especiais',
            'slug': 'mundo-cafes-especiais',
            'excerpt': 'Explore a rica diversidade dos cafés especiais do Brasil',
            'content': 'Conteúdo completo do artigo sobre cafés especiais...',
            'created_at': '2025-07-09T12:00:00Z',
            'status': 'published',
            'author': 'Admin',
            'featured_image': '',
            'tags': ['café', 'especial', 'brasil']
        },
        {
            'id': 2,
            'title': 'Como Preparar o Café Perfeito',
            'slug': 'como-preparar-cafe-perfeito',
            'excerpt': 'Dicas e técnicas para extrair o melhor sabor do seu café',
            'content': 'Conteúdo completo sobre preparo de café...',
            'created_at': '2025-07-08T10:30:00Z',
            'status': 'published',
            'author': 'Admin',
            'featured_image': '',
            'tags': ['preparo', 'técnicas', 'café']
        }
    ])

@app.route('/api/admin/blog/posts', methods=['POST'])
def create_blog_post():
    try:
        data = request.get_json()
        
        # Required fields
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        # Generate slug from title
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s]', '', title.lower())
        slug = re.sub(r'\s+', '-', slug.strip())
        
        # Optional fields with defaults
        excerpt = data.get('excerpt', content[:200] + '...' if len(content) > 200 else content)
        status = data.get('status', 'draft')
        author = data.get('author', 'Admin')
        featured_image = data.get('featured_image', '')
        tags = data.get('tags', [])
        
        new_post = {
            'id': 3,  # Mock ID - in real app would be from database
            'title': title,
            'slug': slug,
            'content': content,
            'excerpt': excerpt,
            'status': status,
            'author': author,
            'featured_image': featured_image,
            'tags': tags,
            'created_at': '2025-07-09T18:00:00Z'
        }
        
        return jsonify({
            'success': True,
            'post': new_post
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/posts/<int:post_id>', methods=['PUT'])
def update_blog_post(post_id):
    try:
        data = request.get_json()
        
        # Mock update - in real app would update database
        updated_post = {
            'id': post_id,
            'title': data.get('title', 'Updated Title'),
            'slug': data.get('slug', 'updated-title'),
            'content': data.get('content', 'Updated content'),
            'excerpt': data.get('excerpt', 'Updated excerpt'),
            'status': data.get('status', 'draft'),
            'author': data.get('author', 'Admin'),
            'featured_image': data.get('featured_image', ''),
            'tags': data.get('tags', []),
            'created_at': '2025-07-09T18:00:00Z',
            'updated_at': '2025-07-09T18:45:00Z'
        }
        
        return jsonify({
            'success': True,
            'post': updated_post
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/posts/<int:post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    try:
        # Mock delete - in real app would delete from database
        return jsonify({
            'success': True,
            'message': f'Post {post_id} deleted successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/blog/categories', methods=['GET'])
def get_blog_categories():
    return jsonify([
        {'id': 1, 'name': 'Café Especial', 'slug': 'cafe-especial'},
        {'id': 2, 'name': 'Preparo', 'slug': 'preparo'},
        {'id': 3, 'name': 'Origem', 'slug': 'origem'},
        {'id': 4, 'name': 'Equipamentos', 'slug': 'equipamentos'},
        {'id': 5, 'name': 'Notícias', 'slug': 'noticias'}
    ])

@app.route('/api/admin/analytics/top-products-revenue', methods=['GET'])
def get_top_products_revenue():
    try:
        limit = request.args.get('limit', 5, type=int)
        
        # Mock data for now
        top_products = [
            {'id': 1, 'name': 'Café Premium Especial', 'revenue': 1500.00, 'units_sold': 50},
            {'id': 2, 'name': 'Café Orgânico Brasileiro', 'revenue': 1200.00, 'units_sold': 40},
            {'id': 3, 'name': 'Blend Tradicional', 'revenue': 900.00, 'units_sold': 30},
            {'id': 4, 'name': 'Café Gourmet', 'revenue': 800.00, 'units_sold': 25},
            {'id': 5, 'name': 'Espresso Intenso', 'revenue': 700.00, 'units_sold': 20}
        ]
        
        return jsonify(top_products[:limit])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hr/summary', methods=['GET'])
def get_hr_summary():
    return jsonify({
        'total_employees': 15,
        'departments': 5,
        'active_employees': 14,
        'recent_hires': 2,
        'upcoming_reviews': 3
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'database': 'SQLite'})

if __name__ == '__main__':
    print("🚀 Starting Simple API Server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)