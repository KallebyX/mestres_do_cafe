from flask import Blueprint, request, jsonify
from src.models.database import db, BlogPost, User

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        
        query = BlogPost.query.filter_by(is_published=True)
        
        if category:
            query = query.filter_by(category=category)
        
        posts = query.order_by(BlogPost.published_at.desc())\
                    .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'posts': [{
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt,
                'image_url': post.image_url,
                'author_name': post.author.name,
                'category': post.category,
                'tags': post.tags.split(',') if post.tags else [],
                'published_at': post.published_at.isoformat() if post.published_at else None
            } for post in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'total': posts.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/posts/<slug>', methods=['GET'])
def get_post_by_slug(slug):
    try:
        post = BlogPost.query.filter_by(slug=slug, is_published=True).first()
        
        if not post:
            return jsonify({'error': 'Post não encontrado'}), 404
        
        return jsonify({
            'post': {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'content': post.content,
                'excerpt': post.excerpt,
                'image_url': post.image_url,
                'author_name': post.author.name,
                'category': post.category,
                'tags': post.tags.split(',') if post.tags else [],
                'published_at': post.published_at.isoformat() if post.published_at else None,
                'created_at': post.created_at.isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/posts/featured', methods=['GET'])
def get_featured_posts():
    try:
        # Posts em destaque (mais recentes)
        posts = BlogPost.query.filter_by(is_published=True)\
                             .order_by(BlogPost.published_at.desc())\
                             .limit(3).all()
        
        return jsonify({
            'posts': [{
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt,
                'image_url': post.image_url,
                'author_name': post.author.name,
                'category': post.category,
                'published_at': post.published_at.isoformat() if post.published_at else None
            } for post in posts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/categories', methods=['GET'])
def get_blog_categories():
    try:
        # Buscar categorias únicas dos posts publicados
        categories = db.session.query(BlogPost.category)\
                              .filter(BlogPost.is_published == True)\
                              .filter(BlogPost.category.isnot(None))\
                              .distinct().all()
        
        return jsonify({
            'categories': [category[0] for category in categories if category[0]]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blog_bp.route('/search', methods=['GET'])
def search_posts():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'posts': []})
        
        posts = BlogPost.query.filter_by(is_published=True)\
                             .filter(BlogPost.title.ilike(f'%{query}%'))\
                             .order_by(BlogPost.published_at.desc())\
                             .limit(10).all()
        
        return jsonify({
            'posts': [{
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt,
                'category': post.category,
                'published_at': post.published_at.isoformat() if post.published_at else None
            } for post in posts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

