"""
Endpoints para criação, atualização e remoção de produtos
"""

from flask import Blueprint, jsonify, request
from database import db
from models import Product


def add_product_crud_routes(products_bp):
    """Adiciona rotas CRUD para produtos"""
    
    @products_bp.route("/", methods=["POST"])
    def create_product():
        """Criar novo produto"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Dados do produto são obrigatórios"}), 400
            
            # Validar campos obrigatórios
            required_fields = ['name', 'price']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Campo '{field}' é obrigatório"}), 400
            
            # Criar novo produto
            new_product = Product(
                name=data['name'],
                description=data.get('description', ''),
                price=float(data['price']),
                category=data.get('category', ''),
                origin=data.get('origin', ''),
                roast_level=data.get('roast_level', 'medium'),
                sca_score=data.get('sca_score', 80),
                stock_quantity=data.get('stock', 0),
                is_active=data.get('is_active', True),
                is_featured=data.get('is_featured', False),
                process=data.get('processing_method', ''),
                flavor_notes=', '.join(data.get('flavor_notes', [])),
                weight=data.get('weight', 250),
                image_url=data.get('images', [{}])[0].get('url', '') if data.get('images') else '',
                gallery_images=data.get('images', []),
                meta_title=data.get('name', ''),
                meta_description=data.get('description', '')
            )
            
            # Salvar no banco
            db.session.add(new_product)
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Produto criado com sucesso",
                "data": {
                    "id": str(new_product.id),
                    "name": new_product.name,
                    "price": float(new_product.price),
                    "is_active": new_product.is_active
                }
            }), 201
            
        except ValueError as e:
            return jsonify({"error": f"Erro de validação: {str(e)}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao criar produto: {str(e)}"}), 500

    @products_bp.route("/<product_id>", methods=["PUT"])
    def update_product(product_id):
        """Atualizar produto existente"""
        try:
            # Buscar produto existente
            product = None
            for p in Product.query.filter_by(is_active=True).all():
                if str(p.id) == product_id:
                    product = p
                    break
            
            if not product:
                return jsonify({"error": "Produto não encontrado"}), 404
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "Dados para atualização são obrigatórios"}), 400
            
            # Atualizar campos
            if 'name' in data:
                product.name = data['name']
            if 'description' in data:
                product.description = data['description']
            if 'price' in data:
                product.price = float(data['price'])
            if 'category' in data:
                product.category = data['category']
            if 'origin' in data:
                product.origin = data['origin']
            if 'roast_level' in data:
                product.roast_level = data['roast_level']
            if 'sca_score' in data:
                product.sca_score = data['sca_score']
            if 'stock' in data:
                product.stock_quantity = data['stock']
            if 'is_active' in data:
                product.is_active = data['is_active']
            if 'is_featured' in data:
                product.is_featured = data['is_featured']
            if 'processing_method' in data:
                product.process = data['processing_method']
            if 'flavor_notes' in data:
                product.flavor_notes = ', '.join(data['flavor_notes'])
            if 'weight' in data:
                product.weight = data['weight']
            if 'images' in data and data['images']:
                product.image_url = data['images'][0].get('url', '')
                product.gallery_images = data['images']
            
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Produto atualizado com sucesso",
                "data": {
                    "id": str(product.id),
                    "name": product.name,
                    "price": float(product.price),
                    "is_active": product.is_active
                }
            })
            
        except ValueError as e:
            return jsonify({"error": f"Erro de validação: {str(e)}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao atualizar produto: {str(e)}"}), 500

    @products_bp.route("/<product_id>", methods=["DELETE"])
    def delete_product(product_id):
        """Deletar produto (soft delete)"""
        try:
            # Buscar produto existente
            product = None
            for p in Product.query.all():
                if str(p.id) == product_id:
                    product = p
                    break
            
            if not product:
                return jsonify({"error": "Produto não encontrado"}), 404
            
            # Soft delete - marcar como inativo
            product.is_active = False
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Produto removido com sucesso"
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao remover produto: {str(e)}"}), 500

    return products_bp