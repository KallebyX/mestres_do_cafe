from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import asc, desc, func, or_

from ..models.base import db
from ..models.products import Product, Review, ReviewHelpful, ReviewResponse
from ..models.user import User

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    """Obter todas as avaliações de um produto com filtros avançados"""
    try:
        print(f"🔍 Iniciando get_product_reviews para produto {product_id}")
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        print(f"📄 Paginação: page={page}, per_page={per_page}")
        
        # Filtros avançados
        rating_filter = request.args.get('rating', type=int)
        verified_only = request.args.get('verified_only', 'false').lower() == 'true'
        featured_only = request.args.get('featured_only', 'false').lower() == 'true'
        approved_only = request.args.get('approved_only', 'true').lower() == 'true'
        sort_by = request.args.get('sort_by', 'newest')  # newest, oldest, highest_rated, lowest_rated, most_helpful
        
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        print(f"✅ Produto encontrado: {product.name}")
        
        # Construir query com filtros
        query = Review.query.filter_by(product_id=product_id)
        print(f"🗃️ Query base construída")
        
        # Aplicar filtros
        if rating_filter:
            query = query.filter(Review.rating == rating_filter)
        
        if verified_only:
            query = query.filter(Review.is_verified == True)
        
        if featured_only:
            query = query.filter(Review.is_featured == True)
        
        if approved_only:
            query = query.filter(Review.is_approved == True)
        
        # Aplicar ordenação
        if sort_by == 'newest':
            query = query.order_by(desc(Review.created_at))
        elif sort_by == 'oldest':
            query = query.order_by(asc(Review.created_at))
        elif sort_by == 'highest_rated':
            query = query.order_by(desc(Review.rating))
        elif sort_by == 'lowest_rated':
            query = query.order_by(asc(Review.rating))
        elif sort_by == 'most_helpful':
            query = query.order_by(desc(Review.helpful_count))
        
        print(f"📊 Filtros e ordenação aplicados: sort_by={sort_by}")
        
        # Paginação
        reviews = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        print(f"🔢 Reviews encontrados: {len(reviews.items)}")
        
        reviews_data = []
        for i, review in enumerate(reviews.items):
            try:
                print(f"🔄 Processando review {i+1}/{len(reviews.items)} - ID: {review.id}")
                
                # Usar dados básicos sem relacionamentos automáticos
                review_data = {
                    'id': review.id,
                    'product_id': review.product_id,
                    'user_id': review.user_id,
                    'rating': review.rating,
                    'title': review.title,
                    'comment': review.comment,
                    'is_verified': review.is_verified,
                    'is_approved': review.is_approved,
                    'is_featured': review.is_featured,
                    'helpful_count': review.helpful_count,
                    'not_helpful_count': review.not_helpful_count,
                    'images': review.images or [],
                    'pros': review.pros or [],
                    'cons': review.cons or [],
                    'recommend': review.recommend,
                    'created_at': review.created_at.isoformat() if review.created_at is not None else None,
                    'updated_at': review.updated_at.isoformat() if review.updated_at is not None else None,
                    'user': None,
                    'responses': []
                }
                print(f"✅ Dados básicos do review {review.id} criados")
                
                # Tentar carregar dados do usuário se disponível
                try:
                    if review.user:
                        review_data['user'] = {
                            'id': review.user.id,
                            'name': review.user.name,
                            'email': review.user.email[:3] + "***" + review.user.email[-10:] if review.user.email else None
                        }
                        print(f"👤 Dados do usuário carregados para review {review.id}")
                except Exception as user_error:
                    print(f"⚠️ Erro ao carregar usuário para review {review.id}: {user_error}")
                    pass
                
                reviews_data.append(review_data)
                print(f"✅ Review {review.id} adicionado à lista")
                
            except Exception as review_error:
                print(f"❌ Erro ao processar review {review.id}: {review_error}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"📋 Total de reviews processados: {len(reviews_data)}")
        
        response_data = {
            'success': True,
            'reviews': reviews_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews.total,
                'pages': reviews.pages,
                'has_next': reviews.has_next,
                'has_prev': reviews.has_prev
            }
        }
        print(f"🎯 Resposta final construída com sucesso")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"💥 Erro geral em get_product_reviews: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/stats', methods=['GET'])
def get_product_review_stats(product_id):
    """Obter estatísticas de avaliações de um produto"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        # Buscar todas as reviews do produto
        reviews = Review.query.filter_by(product_id=product_id).all()
        
        if not reviews:
            return jsonify({
                'success': True,
                'stats': {
                    'total_reviews': 0,
                    'average_rating': 0.0,
                    'rating_distribution': {
                        '5': 0,
                        '4': 0,
                        '3': 0,
                        '2': 0,
                        '1': 0
                    }
                }
            })
        
        # Calcular estatísticas
        total_reviews = len(reviews)
        total_rating = sum(review.rating for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)
        
        # Distribuição de ratings
        rating_distribution = {'5': 0, '4': 0, '3': 0, '2': 0, '1': 0}
        for review in reviews:
            rating_distribution[str(review.rating)] += 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_reviews': total_reviews,
                'average_rating': average_rating,
                'rating_distribution': rating_distribution
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>', methods=['POST'])
@jwt_required()
def create_review(product_id):
    """Criar nova avaliação para um produto"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        # Validações
        if not data or 'rating' not in data:
            return jsonify({
                'success': False,
                'error': 'Rating é obrigatório'
            }), 400
        
        rating = data.get('rating')
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({
                'success': False,
                'error': 'Rating deve ser um número entre 1 e 5'
            }), 400
        
        # Verificar se usuário já avaliou este produto
        existing_review = Review.query.filter_by(
            product_id=product_id,
            user_id=user_id
        ).first()
        
        if existing_review:
            return jsonify({
                'success': False,
                'error': 'Você já avaliou este produto'
            }), 400
        
        # Criar nova avaliação (usando setattr para contornar problemas de tipos)
        review = Review()
        setattr(review, 'product_id', product_id)
        setattr(review, 'user_id', user_id)
        setattr(review, 'rating', rating)
        setattr(review, 'title', data.get('title', ''))
        setattr(review, 'comment', data.get('comment', ''))
        setattr(review, 'is_verified', False)  # Pode ser definido como True se o usuário comprou o produto
        setattr(review, 'is_approved', True)   # Por padrão aprovada, pode ser alterado para moderação
        setattr(review, 'is_featured', False)
        setattr(review, 'helpful_count', 0)
        setattr(review, 'not_helpful_count', 0)
        setattr(review, 'images', data.get('images', []))
        setattr(review, 'pros', data.get('pros', []))
        setattr(review, 'cons', data.get('cons', []))
        setattr(review, 'recommend', data.get('recommend', True))
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avaliação criada com sucesso!',
            'review': {
                'id': review.id,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'created_at': review.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Atualizar uma avaliação existente"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Buscar review
        review = Review.query.get_or_404(review_id)
        
        # Verificar se o usuário é dono da review
        if review.user_id != user_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para editar esta avaliação'
            }), 403
        
        # Atualizar campos
        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return jsonify({
                    'success': False,
                    'error': 'Rating deve ser um número entre 1 e 5'
                }), 400
            review.rating = rating
        
        if 'title' in data:
            review.title = data['title']
        
        if 'comment' in data:
            review.comment = data['comment']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avaliação atualizada com sucesso!',
            'review': {
                'id': review.id,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'created_at': review.created_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Deletar uma avaliação"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar review
        review = Review.query.get_or_404(review_id)
        
        # Verificar se o usuário é dono da review
        if review.user_id != user_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para deletar esta avaliação'
            }), 403
        
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avaliação deletada com sucesso!'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
# ===== ENDPOINTS PREMIUM =====

@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
@jwt_required()
def vote_review_helpful(review_id):
    """Votar se uma avaliação é útil ou não"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verificar se review existe
        review = Review.query.get_or_404(review_id)
        
        # Validar dados
        if not data or 'is_helpful' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo is_helpful é obrigatório'
            }), 400
        
        is_helpful = data['is_helpful']
        if not isinstance(is_helpful, bool):
            return jsonify({
                'success': False,
                'error': 'Campo is_helpful deve ser boolean'
            }), 400
        
        # Verificar se usuário já votou nesta review
        existing_vote = ReviewHelpful.query.filter_by(
            review_id=review_id,
            user_id=user_id
        ).first()
        
        if existing_vote:
            # Atualizar voto existente se for diferente
            if existing_vote.is_helpful != is_helpful:
                # Atualizar contadores
                if existing_vote.is_helpful:
                    setattr(review, 'helpful_count', review.helpful_count - 1)
                    setattr(review, 'not_helpful_count', review.not_helpful_count + 1)
                else:
                    setattr(review, 'helpful_count', review.helpful_count + 1)
                    setattr(review, 'not_helpful_count', review.not_helpful_count - 1)
                
                setattr(existing_vote, 'is_helpful', is_helpful)
            else:
                return jsonify({
                    'success': True,
                    'message': 'Voto já registrado'
                })
        else:
            # Criar novo voto
            vote = ReviewHelpful()
            setattr(vote, 'review_id', review_id)
            setattr(vote, 'user_id', user_id)
            setattr(vote, 'is_helpful', is_helpful)
            
            # Atualizar contadores
            if is_helpful:
                setattr(review, 'helpful_count', review.helpful_count + 1)
            else:
                setattr(review, 'not_helpful_count', review.not_helpful_count + 1)
            
            db.session.add(vote)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Voto registrado com sucesso!',
            'review_stats': {
                'helpful_count': review.helpful_count,
                'not_helpful_count': review.not_helpful_count
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/<int:review_id>/response', methods=['POST'])
@jwt_required()
def add_company_response(review_id):
    """Adicionar resposta da empresa a uma avaliação"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # TODO: Verificar se usuário tem permissão de empresa/admin
        # Por enquanto, qualquer usuário logado pode responder
        
        # Verificar se review existe
        review = Review.query.get_or_404(review_id)
        
        # Validar dados
        if not data or 'response' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo response é obrigatório'
            }), 400
        
        response_text = data['response'].strip()
        if not response_text:
            return jsonify({
                'success': False,
                'error': 'Resposta não pode estar vazia'
            }), 400
        
        # Verificar se já existe resposta
        existing_response = ReviewResponse.query.filter_by(review_id=review_id).first()
        if existing_response:
            return jsonify({
                'success': False,
                'error': 'Esta avaliação já possui uma resposta da empresa'
            }), 400
        
        # Criar resposta
        response = ReviewResponse()
        setattr(response, 'review_id', review_id)
        setattr(response, 'admin_user_id', user_id)
        setattr(response, 'response_text', response_text)
        
        db.session.add(response)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Resposta adicionada com sucesso!',
            'response': {
                'id': response.id,
                'response_text': response.response_text,
                'created_at': response.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/featured', methods=['GET'])
def get_product_featured_reviews(product_id):
    """Obter avaliações em destaque de um produto específico"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        limit = request.args.get('limit', 3, type=int)
        
        # Buscar reviews em destaque do produto
        reviews = Review.query.filter_by(
            product_id=product_id,
            is_featured=True,
            is_approved=True
        ).order_by(desc(Review.helpful_count), desc(Review.created_at)).limit(limit).all()
        
        reviews_data = []
        for review in reviews:
            review_data = review.to_dict()
            
            # Adicionar informações do usuário
            if review.user:
                review_data['user'] = {
                    'id': review.user.id,
                    'name': review.user.name,
                    'email': review.user.email[:3] + "***" + review.user.email[-10:] if review.user.email else None
                }
            
            reviews_data.append(review_data)
        
        return jsonify({
            'success': True,
            'reviews': reviews_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/featured', methods=['GET'])
def get_featured_reviews():
    """Obter avaliações em destaque (todas)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)
        
        # Buscar reviews em destaque
        reviews = Review.query.filter_by(
            is_featured=True,
            is_approved=True
        ).order_by(desc(Review.created_at)).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        reviews_data = []
        for review in reviews.items:
            review_data = review.to_dict()
            
            # Adicionar informações do produto
            if review.product:
                review_data['product'] = {
                    'id': review.product.id,
                    'name': review.product.name,
                    'slug': review.product.slug
                }
            
            # Adicionar informações do usuário
            if review.user:
                review_data['user'] = {
                    'id': review.user.id,
                    'name': review.user.name
                }
            
            reviews_data.append(review_data)
        
        return jsonify({
            'success': True,
            'reviews': reviews_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews.total,
                'pages': reviews.pages,
                'has_next': reviews.has_next,
                'has_prev': reviews.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/<int:review_id>/moderate', methods=['PUT'])
@jwt_required()
def moderate_review(review_id):
    """Moderar uma avaliação (aprovar/reprovar/destacar)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # TODO: Verificar se usuário tem permissão de moderador/admin
        # Por enquanto, qualquer usuário logado pode moderar
        
        # Verificar se review existe
        review = Review.query.get_or_404(review_id)
        
        # Validar dados
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados são obrigatórios'
            }), 400
        
        # Atualizar campos de moderação
        if 'is_approved' in data:
            setattr(review, 'is_approved', bool(data['is_approved']))
        
        if 'is_featured' in data:
            setattr(review, 'is_featured', bool(data['is_featured']))
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avaliação moderada com sucesso!',
            'review': {
                'id': review.id,
                'is_approved': review.is_approved,
                'is_featured': review.is_featured
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/recent', methods=['GET'])
def get_product_recent_reviews(product_id):
    """Obter avaliações recentes de um produto"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        limit = request.args.get('limit', 5, type=int)
        
        # Buscar reviews recentes aprovadas do produto
        reviews = Review.query.filter_by(
            product_id=product_id,
            is_approved=True
        ).order_by(desc(Review.created_at)).limit(limit).all()
        
        reviews_data = []
        for review in reviews:
            review_data = review.to_dict()
            
            # Adicionar informações do usuário
            if review.user:
                review_data['user'] = {
                    'id': review.user.id,
                    'name': review.user.name,
                    'email': review.user.email[:3] + "***" + review.user.email[-10:] if review.user.email else None
                }
            
            reviews_data.append(review_data)
        
        return jsonify({
            'success': True,
            'reviews': reviews_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/rating-distribution', methods=['GET'])
def get_product_rating_distribution(product_id):
    """Obter distribuição detalhada de ratings de um produto"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        # Buscar todas as reviews aprovadas do produto
        reviews = Review.query.filter_by(
            product_id=product_id,
            is_approved=True
        ).all()
        
        if not reviews:
            return jsonify({
                'success': True,
                'distribution': {str(i): {'count': 0, 'percentage': 0} for i in range(1, 6)},
                'total_reviews': 0
            })
        
        # Calcular distribuição
        total_reviews = len(reviews)
        rating_counts = {str(i): 0 for i in range(1, 6)}
        
        for review in reviews:
            rating_counts[str(review.rating)] += 1
        
        # Calcular percentuais
        distribution = {}
        for rating, count in rating_counts.items():
            distribution[rating] = {
                'count': count,
                'percentage': round((count / total_reviews) * 100, 1) if total_reviews > 0 else 0
            }
        
        return jsonify({
            'success': True,
            'distribution': distribution,
            'total_reviews': total_reviews
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/engagement', methods=['GET'])
def get_product_engagement_metrics(product_id):
    """Obter métricas de engajamento das avaliações de um produto"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        # Buscar todas as reviews aprovadas do produto
        reviews = Review.query.filter_by(
            product_id=product_id,
            is_approved=True
        ).all()
        
        if not reviews:
            return jsonify({
                'success': True,
                'metrics': {
                    'total_helpful_votes': 0,
                    'total_reviews_with_comments': 0,
                    'total_reviews_with_images': 0,
                    'average_helpful_per_review': 0.0,
                    'engagement_rate': 0.0
                }
            })
        
        # Calcular métricas
        total_helpful_votes = sum(review.helpful_count for review in reviews)
        reviews_with_comments = sum(1 for review in reviews if review.comment and review.comment.strip())
        reviews_with_images = sum(1 for review in reviews if review.images and len(review.images) > 0)
        
        total_reviews = len(reviews)
        average_helpful = round(total_helpful_votes / total_reviews, 1) if total_reviews > 0 else 0
        engagement_rate = round(((reviews_with_comments + reviews_with_images) / total_reviews) * 100, 1) if total_reviews > 0 else 0
        
        return jsonify({
            'success': True,
            'metrics': {
                'total_helpful_votes': total_helpful_votes,
                'total_reviews_with_comments': reviews_with_comments,
                'total_reviews_with_images': reviews_with_images,
                'average_helpful_per_review': average_helpful,
                'engagement_rate': engagement_rate
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reviews_bp.route('/product/<int:product_id>/enhanced-stats', methods=['GET'])
def get_enhanced_product_review_stats(product_id):
    """Obter estatísticas avançadas de avaliações de um produto"""
    try:
        # Verificar se produto existe
        product = Product.query.get_or_404(product_id)
        
        # Buscar todas as reviews aprovadas do produto
        reviews = Review.query.filter_by(
            product_id=product_id,
            is_approved=True
        ).all()
        
        if not reviews:
            return jsonify({
                'success': True,
                'stats': {
                    'total_reviews': 0,
                    'average_rating': 0.0,
                    'rating_distribution': {str(i): 0 for i in range(1, 6)},
                    'verified_reviews': 0,
                    'featured_reviews': 0,
                    'total_helpful_votes': 0,
                    'recommendation_rate': 0.0
                }
            })
        
        # Calcular estatísticas básicas
        total_reviews = len(reviews)
        total_rating = sum(review.rating for review in reviews)
        average_rating = round(total_rating / total_reviews, 1)
        
        # Distribuição de ratings
        rating_distribution = {str(i): 0 for i in range(1, 6)}
        for review in reviews:
            rating_distribution[str(review.rating)] += 1
        
        # Estatísticas avançadas
        verified_reviews = sum(1 for review in reviews if review.is_verified)
        featured_reviews = sum(1 for review in reviews if review.is_featured)
        total_helpful_votes = sum(review.helpful_count for review in reviews)
        
        # Taxa de recomendação
        recommendations = sum(1 for review in reviews if review.recommend)
        recommendation_rate = round((recommendations / total_reviews) * 100, 1)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_reviews': total_reviews,
                'average_rating': average_rating,
                'rating_distribution': rating_distribution,
                'verified_reviews': verified_reviews,
                'featured_reviews': featured_reviews,
                'total_helpful_votes': total_helpful_votes,
                'recommendation_rate': recommendation_rate
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500