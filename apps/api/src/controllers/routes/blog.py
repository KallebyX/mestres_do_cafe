"""
Rotas para o sistema de Blog
"""

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc, or_
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import BlogPost, BlogComment, User
from utils.validators import validate_required_fields

blog_bp = Blueprint('blog', __name__)


# ============================================
# BLOG POSTS
# ============================================

@blog_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """
    Listar posts do blog (público)
    Query params: status, category, search, page, per_page, featured
    """
    try:
        # Parâmetros
        status = request.args.get('status', 'published')
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        featured = request.args.get('featured', 'false').lower() == 'true'
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        # Query base
        query = BlogPost.query

        # Filtros
        if status:
            query = query.filter(BlogPost.status == status)

        if category:
            query = query.filter(BlogPost.category == category)

        if featured:
            query = query.filter(BlogPost.is_featured == True)

        if search:
            search_term = f'%{search}%'
            query = query.filter(
                or_(
                    BlogPost.title.ilike(search_term),
                    BlogPost.content.ilike(search_term),
                    BlogPost.excerpt.ilike(search_term)
                )
            )

        # Ordenação
        query = query.filter(BlogPost.published_at.isnot(None))
        query = query.order_by(desc(BlogPost.is_pinned), desc(BlogPost.published_at))

        # Paginação
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/<post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """Obter detalhes de um post"""
    try:
        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        # Incrementar visualizações
        post.views_count = (post.views_count or 0) + 1
        db.session.commit()

        return jsonify({
            'success': True,
            'post': post.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/slug/<slug>', methods=['GET'])
@jwt_required()
def get_post_by_slug(slug):
    """Obter post por slug"""
    try:
        post = BlogPost.query.filter_by(slug=slug).first()
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        # Incrementar visualizações
        post.views_count = (post.views_count or 0) + 1
        db.session.commit()

        return jsonify({
            'success': True,
            'post': post.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Criar novo post (apenas admin)"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        # Verificar se é admin
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        # Validações
        validation = validate_required_fields(data, ['title', 'content'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Gerar slug se não fornecido
        slug = data.get('slug')
        if not slug:
            # Gerar slug a partir do título
            slug = data['title'].lower()
            slug = slug.replace(' ', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-')

            # Verificar unicidade
            count = 1
            original_slug = slug
            while BlogPost.query.filter_by(slug=slug).first():
                slug = f"{original_slug}-{count}"
                count += 1

        # Criar post
        post = BlogPost(
            title=data['title'],
            slug=slug,
            excerpt=data.get('excerpt'),
            content=data['content'],
            author_id=current_user_id,
            category=data.get('category'),
            tags=data.get('tags', ''),
            status=data.get('status', 'draft'),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
            meta_keywords=data.get('meta_keywords'),
            featured_image=data.get('featured_image'),
            featured_image_alt=data.get('featured_image_alt'),
            allow_comments=data.get('allow_comments', True),
            is_featured=data.get('is_featured', False),
            is_pinned=data.get('is_pinned', False)
        )

        # Se status for published, definir data de publicação
        if post.status == 'published' and not post.published_at:
            post.published_at = datetime.utcnow()

        db.session.add(post)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Post criado com sucesso',
            'post': post.to_dict()
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Erro de banco de dados: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Atualizar post (apenas autor ou admin)"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        # Verificar permissão
        if str(post.author_id) != current_user_id and not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        # Atualizar campos
        if 'title' in data:
            post.title = data['title']
        if 'slug' in data:
            post.slug = data['slug']
        if 'excerpt' in data:
            post.excerpt = data['excerpt']
        if 'content' in data:
            post.content = data['content']
        if 'category' in data:
            post.category = data['category']
        if 'tags' in data:
            post.tags = data['tags']
        if 'status' in data:
            post.status = data['status']
            # Se mudou para published, definir data
            if data['status'] == 'published' and not post.published_at:
                post.published_at = datetime.utcnow()
        if 'meta_title' in data:
            post.meta_title = data['meta_title']
        if 'meta_description' in data:
            post.meta_description = data['meta_description']
        if 'meta_keywords' in data:
            post.meta_keywords = data['meta_keywords']
        if 'featured_image' in data:
            post.featured_image = data['featured_image']
        if 'featured_image_alt' in data:
            post.featured_image_alt = data['featured_image_alt']
        if 'allow_comments' in data:
            post.allow_comments = data['allow_comments']
        if 'is_featured' in data:
            post.is_featured = data['is_featured']
        if 'is_pinned' in data:
            post.is_pinned = data['is_pinned']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Post atualizado com sucesso',
            'post': post.to_dict()
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Erro de banco de dados: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Deletar post (apenas autor ou admin)"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        # Verificar permissão
        if str(post.author_id) != current_user_id and not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        db.session.delete(post)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Post deletado com sucesso'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Erro de banco de dados: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """Curtir post"""
    try:
        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        post.likes_count = (post.likes_count or 0) + 1
        db.session.commit()

        return jsonify({
            'success': True,
            'likes_count': post.likes_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# COMENTÁRIOS
# ============================================

@blog_bp.route('/posts/<post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    """Listar comentários de um post"""
    try:
        status = request.args.get('status', 'approved')

        query = BlogComment.query.filter_by(post_id=post_id, status=status)
        query = query.filter(BlogComment.parent_id.is_(None))  # Apenas comentários principais
        query = query.order_by(desc(BlogComment.created_at))

        comments = query.all()

        return jsonify({
            'success': True,
            'comments': [comment.to_dict() for comment in comments]
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    """Criar comentário em um post"""
    try:
        current_user_id = get_jwt_identity()

        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post não encontrado'}), 404

        if not post.allow_comments:
            return jsonify({'success': False, 'error': 'Comentários desabilitados neste post'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['content'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        comment = BlogComment(
            post_id=post_id,
            user_id=current_user_id,
            parent_id=data.get('parent_id'),
            content=data['content'],
            status='pending'  # Requer moderação
        )

        db.session.add(comment)

        # Atualizar contador de comentários
        post.comments_count = (post.comments_count or 0) + 1

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Comentário enviado para moderação',
            'comment': comment.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/comments/<comment_id>/approve', methods=['POST'])
@jwt_required()
def approve_comment(comment_id):
    """Aprovar comentário (apenas admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        comment = BlogComment.query.get(comment_id)
        if not comment:
            return jsonify({'success': False, 'error': 'Comentário não encontrado'}), 404

        comment.status = 'approved'
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Comentário aprovado'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Deletar comentário (autor ou admin)"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        comment = BlogComment.query.get(comment_id)
        if not comment:
            return jsonify({'success': False, 'error': 'Comentário não encontrado'}), 404

        # Verificar permissão
        if str(comment.user_id) != current_user_id and not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        # Atualizar contador do post
        post = BlogPost.query.get(comment.post_id)
        if post:
            post.comments_count = max(0, (post.comments_count or 1) - 1)

        db.session.delete(comment)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Comentário deletado'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# CATEGORIAS E TAGS
# ============================================

@blog_bp.route('/categories', methods=['GET'])
def get_categories():
    """Listar categorias disponíveis"""
    try:
        # Buscar categorias únicas de posts publicados
        categories = db.session.query(BlogPost.category).filter(
            BlogPost.status == 'published',
            BlogPost.category.isnot(None)
        ).distinct().all()

        categories_list = [cat[0] for cat in categories if cat[0]]

        return jsonify({
            'success': True,
            'categories': categories_list
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@blog_bp.route('/tags', methods=['GET'])
@jwt_required()
def get_tags():
    """Listar tags disponíveis"""
    try:
        # Buscar todas as tags de posts publicados
        posts = BlogPost.query.filter_by(status='published').all()

        tags_set = set()
        for post in posts:
            if post.tags:
                tags_list = [tag.strip() for tag in post.tags.split(',')]
                tags_set.update(tags_list)

        return jsonify({
            'success': True,
            'tags': sorted(list(tags_set))
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
