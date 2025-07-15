"""
Rotas para Sistema de Recomendações
Endpoints para recomendações personalizadas e analytics
"""

from flask import Blueprint, jsonify, request, g
from ...services.recommendation_service import (
    recommendation_engine, 
    recommendation_analytics
)
from ...middleware.security import rate_limit, validate_input
from ...utils.monitoring import monitor_performance

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/user/<int:user_id>', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_user_recommendations(user_id):
    """Obtém recomendações personalizadas para um usuário"""
    try:
        num_recommendations = request.args.get('limit', 10, type=int)
        
        # Validação de parâmetros
        if num_recommendations < 1 or num_recommendations > 50:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'limit' deve estar entre 1 e 50"
            }), 400
        
        recommendations = recommendation_engine.get_user_recommendations(
            user_id, num_recommendations
        )
        
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "recommendations": recommendations,
                "total_count": len(recommendations),
                "algorithms_used": list(set(rec.get('algorithm', 'unknown') for rec in recommendations))
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/similar-products/<int:product_id>', methods=['GET'])
@rate_limit("api")
def get_similar_products(product_id):
    """Obtém produtos similares a um produto específico"""
    try:
        limit = request.args.get('limit', 8, type=int)
        
        if limit < 1 or limit > 20:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'limit' deve estar entre 1 e 20"
            }), 400
        
        # Implementação simplificada de produtos similares
        # Em produção, usar algoritmo de similaridade por conteúdo
        from ...models.products import Product
        
        target_product = Product.query.get(product_id)
        if not target_product:
            return jsonify({
                "success": False,
                "error": "Produto não encontrado"
            }), 404
        
        # Produtos da mesma categoria
        similar_products = Product.query.filter(
            Product.category_id == target_product.category_id,
            Product.id != product_id,
            Product.is_active == True
        ).limit(limit).all()
        
        results = []
        for product in similar_products:
            results.append({
                "product_id": product.id,
                "product_name": product.name,
                "price": float(product.price),
                "similarity_score": 0.8,  # Simulado
                "similarity_reason": "Mesma categoria"
            })
        
        return jsonify({
            "success": True,
            "data": {
                "target_product_id": product_id,
                "similar_products": results,
                "total_count": len(results)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/trending', methods=['GET'])
@rate_limit("api")
def get_trending_products():
    """Obtém produtos em alta"""
    try:
        limit = request.args.get('limit', 12, type=int)
        
        if limit < 1 or limit > 50:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'limit' deve estar entre 1 e 50"
            }), 400
        
        trending = recommendation_engine._trending_products(limit)
        
        return jsonify({
            "success": True,
            "data": {
                "trending_products": trending,
                "total_count": len(trending),
                "algorithm": "trending_based"
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/click-tracking', methods=['POST'])
@rate_limit("api")
@validate_input()
def track_recommendation_click():
    """Registra clique em recomendação para analytics"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        algorithm = data.get('algorithm', 'unknown')
        
        if not user_id or not product_id:
            return jsonify({
                "success": False,
                "error": "user_id e product_id são obrigatórios"
            }), 400
        
        success = recommendation_analytics.track_recommendation_click(
            user_id, product_id, algorithm
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": "Clique registrado com sucesso"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Erro ao registrar clique"
            }), 500
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/analytics/performance', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_recommendation_performance():
    """Analytics de performance das recomendações"""
    try:
        days = request.args.get('days', 30, type=int)
        
        if days < 1 or days > 365:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'days' deve estar entre 1 e 365"
            }), 400
        
        performance = recommendation_analytics.get_recommendation_performance(days)
        
        return jsonify({
            "success": True,
            "data": performance
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/personalized-homepage/<int:user_id>', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_personalized_homepage(user_id):
    """Obtém seções personalizadas para homepage do usuário"""
    try:
        # Combina diferentes tipos de recomendação para homepage
        
        # Recomendações principais
        main_recommendations = recommendation_engine.get_user_recommendations(user_id, 8)
        
        # Produtos em alta
        trending = recommendation_engine._trending_products(6)
        
        # Produtos por categoria (baseado no perfil do usuário)
        category_recs = []
        try:
            # Obtém categorias favoritas do usuário
            from ...models.orders import Order
            from ...models.products import ProductCategory
            
            user_orders = Order.query.filter_by(customer_id=user_id).all()
            if user_orders:
                # Contar categorias mais compradas
                from collections import Counter
                category_counts = Counter()
                
                for order in user_orders:
                    for item in order.items:
                        if item.product and item.product.category:
                            category_counts[item.product.category.name] += item.quantity
                
                # Pega produtos da categoria mais comprada
                if category_counts:
                    top_category = category_counts.most_common(1)[0][0]
                    category = ProductCategory.query.filter_by(name=top_category).first()
                    
                    if category:
                        from ...models.products import Product
                        category_products = Product.query.filter(
                            Product.category_id == category.id,
                            Product.is_active == True
                        ).limit(6).all()
                        
                        for product in category_products:
                            category_recs.append({
                                "product_id": product.id,
                                "product_name": product.name,
                                "price": float(product.price),
                                "category": top_category
                            })
        except:
            pass
        
        homepage_data = {
            "user_id": user_id,
            "sections": [
                {
                    "title": "Recomendado para Você",
                    "type": "personalized",
                    "products": main_recommendations[:4]
                },
                {
                    "title": "Em Alta Agora",
                    "type": "trending", 
                    "products": trending[:4]
                }
            ]
        }
        
        # Adiciona seção de categoria se disponível
        if category_recs:
            homepage_data["sections"].append({
                "title": f"Mais em {category_recs[0]['category']}",
                "type": "category_based",
                "products": category_recs[:4]
            })
        
        # Adiciona mais recomendações personalizadas
        if len(main_recommendations) > 4:
            homepage_data["sections"].append({
                "title": "Você Também Pode Gostar",
                "type": "additional_personalized",
                "products": main_recommendations[4:8]
            })
        
        return jsonify({
            "success": True,
            "data": homepage_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@recommendations_bp.route('/cross-sell/<int:product_id>', methods=['GET'])
@rate_limit("api")
def get_cross_sell_recommendations(product_id):
    """Obtém recomendações de venda cruzada para um produto"""
    try:
        limit = request.args.get('limit', 4, type=int)
        
        # Implementação simplificada de cross-sell
        # Em produção, usar análise de market basket
        
        from ...models.products import Product
        
        target_product = Product.query.get(product_id)
        if not target_product:
            return jsonify({
                "success": False,
                "error": "Produto não encontrado"
            }), 404
        
        # Produtos complementares (mesmo categoria ou categorias relacionadas)
        cross_sell_products = Product.query.filter(
            Product.category_id == target_product.category_id,
            Product.id != product_id,
            Product.is_active == True
        ).limit(limit).all()
        
        results = []
        for product in cross_sell_products:
            results.append({
                "product_id": product.id,
                "product_name": product.name,
                "price": float(product.price),
                "cross_sell_score": 0.75,  # Simulado
                "reason": "Frequentemente comprados juntos"
            })
        
        return jsonify({
            "success": True,
            "data": {
                "target_product_id": product_id,
                "cross_sell_products": results,
                "total_count": len(results)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500