from datetime import datetime
import uuid

from flask import Blueprint, jsonify, request
from sqlalchemy import desc, func

from database import db
from models.blog import (
    BlogCategory,
    BlogPost,
    BlogComment,
    BlogTag,
    BlogPostTag,
    BlogPostView,
    BlogPostLike,
)
from models.auth import User

blog_bp = Blueprint("blog", __name__)


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


@blog_bp.route("/", methods=["GET"])
def blog_home():
    """Página inicial do blog com posts recentes"""
    try:
        limit = request.args.get("limit", 10, type=int)
        
        # Posts mais recentes
        recent_posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(desc(BlogPost.published_at)).limit(limit).all()
        
        # Posts em destaque
        featured_posts = BlogPost.query.filter_by(
            is_featured=True,
            is_published=True
        ).order_by(desc(BlogPost.published_at)).limit(3).all()
        
        return jsonify({
            "recent_posts": [post.to_dict() for post in recent_posts],
            "featured_posts": [post.to_dict() for post in featured_posts],
            "message": "Blog API - Mestres do Café"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/categories", methods=["GET"])
def get_categories():
    """Listar todas as categorias do blog"""
    try:
        categories = BlogCategory.query.filter_by(is_active=True).all()
        return jsonify({
            "categories": [category.to_dict() for category in categories]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/categories", methods=["POST"])
def create_category():
    """Criar nova categoria"""
    try:
        data = request.get_json()
        required_fields = ["name", "slug"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se slug já existe
        existing = BlogCategory.query.filter_by(slug=data["slug"]).first()
        if existing:
            return jsonify({"error": "Slug já existe"}), 400
        
        category = BlogCategory(
            name=data["name"],
            slug=data["slug"],
            description=data.get("description"),
            color=data.get("color"),
            is_active=True
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            "message": "Categoria criada com sucesso",
            "category": category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts", methods=["GET"])
def get_posts():
    """Listar posts do blog com paginação e filtros"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        status = request.args.get("status", "published")
        category_id = request.args.get("category_id")
        author_id = request.args.get("author_id")
        tag = request.args.get("tag")
        
        query = BlogPost.query
        
        # Filtros
        if status:
            if status == "published":
                query = query.filter(BlogPost.is_published == True)
            elif status == "draft":
                query = query.filter(BlogPost.is_published == False)
        
        if category_id:
            query = query.filter(BlogPost.category == category_id)
        
        if author_id:
            query = query.filter(BlogPost.author_id == author_id)
        
        if tag:
            query = query.join(BlogPostTag).join(BlogTag).filter(
                BlogTag.name.ilike(f"%{tag}%")
            )
        
        # Ordenar por data de publicação
        query = query.order_by(desc(BlogPost.published_at))
        
        posts = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "posts": [post.to_dict() for post in posts.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": posts.total,
                "pages": posts.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts/<post_id>", methods=["GET"])
def get_post(post_id):
    """Obter post específico"""
    try:
        post_uuid = convert_to_uuid(post_id)
        if not post_uuid:
            return jsonify({"error": "ID de post inválido"}), 400
            
        post = BlogPost.query.get_or_404(post_uuid)
        
        # Registrar visualização
        user_id = request.args.get("user_id")
        ip_address = request.remote_addr
        
        # Verificar se já visualizou hoje
        today = datetime.utcnow().date()
        existing_view = BlogPostView.query.filter_by(
            post_id=post_uuid,
            user_id=user_id,
            ip_address=ip_address if not user_id else None,
            view_date=today
        ).first()
        
        if not existing_view:
            view = BlogPostView(
                post_id=post_uuid,
                user_id=user_id,
                ip_address=ip_address,
                view_date=today
            )
            db.session.add(view)
            
            # Atualizar contador de visualizações
            post.views_count += 1
            db.session.commit()
        
        return jsonify({"post": post.to_dict()})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts", methods=["POST"])
def create_post():
    """Criar novo post"""
    try:
        data = request.get_json()
        required_fields = ["title", "content", "author_id"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se autor existe
        author = User.query.get(data["author_id"])
        if not author:
            return jsonify({"error": "Autor não encontrado"}), 404
        
        post = BlogPost(
            title=data["title"],
            slug=data.get("slug", data["title"].lower().replace(" ", "-")),
            content=data["content"],
            excerpt=data.get("excerpt"),
            author_id=data["author_id"],
            category=data.get("category", "Geral"),
            image_url=data.get("featured_image"),
            is_published=data.get("status", "draft") == "published",
            is_featured=data.get("is_featured", False),
            meta_title=data.get("meta_title"),
            meta_description=data.get("meta_description"),
            published_at=(
                datetime.utcnow()
                if data.get("status") == "published"
                else None
            )
        )
        
        db.session.add(post)
        db.session.flush()  # Para obter o ID do post
        
        # Adicionar tags se fornecidas
        if "tags" in data:
            for tag_name in data["tags"]:
                tag = BlogTag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = BlogTag(
                        name=tag_name,
                        slug=tag_name.lower().replace(" ", "-")
                    )
                    db.session.add(tag)
                    db.session.flush()
                
                post_tag = BlogPostTag(post_id=post.id, tag_id=tag.id)
                db.session.add(post_tag)
        
        db.session.commit()
        
        return jsonify({
            "message": "Post criado com sucesso",
            "post": post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts/<post_id>", methods=["PUT"])
def update_post(post_id):
    """Atualizar post"""
    try:
        post_uuid = convert_to_uuid(post_id)
        if not post_uuid:
            return jsonify({"error": "ID de post inválido"}), 400
            
        post = BlogPost.query.get_or_404(post_uuid)
        data = request.get_json()
        
        # Atualizar campos permitidos
        allowed_fields = [
            "title", "slug", "content", "excerpt", "category",
            "image_url", "is_featured", "meta_title",
            "meta_description"
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(post, field, data[field])
        
        # Se publicando, definir data de publicação
        if data.get("status") == "published" and not post.published_at:
            post.published_at = datetime.utcnow()
            post.is_published = True
        elif data.get("status") == "draft":
            post.is_published = False
        
        post.updated_at = datetime.utcnow()
        
        # Atualizar tags se fornecidas
        if "tags" in data:
            # Remover tags antigas
            BlogPostTag.query.filter_by(post_id=post_uuid).delete()
            
            # Adicionar novas tags
            for tag_name in data["tags"]:
                tag = BlogTag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = BlogTag(
                        name=tag_name,
                        slug=tag_name.lower().replace(" ", "-")
                    )
                    db.session.add(tag)
                    db.session.flush()
                
                post_tag = BlogPostTag(post_id=post_uuid, tag_id=tag.id)
                db.session.add(post_tag)
        
        db.session.commit()
        
        return jsonify({
            "message": "Post atualizado com sucesso",
            "post": post.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts/<post_id>/like", methods=["POST"])
def like_post(post_id):
    """Curtir/descurtir post"""
    try:
        post_uuid = convert_to_uuid(post_id)
        if not post_uuid:
            return jsonify({"error": "ID de post inválido"}), 400
            
        data = request.get_json()
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"error": "user_id obrigatório"}), 400
        
        post = BlogPost.query.get_or_404(post_uuid)
        
        # Verificar se já curtiu
        existing_like = BlogPostLike.query.filter_by(
            post_id=post_uuid,
            user_id=user_id
        ).first()
        
        if existing_like:
            # Remover curtida
            db.session.delete(existing_like)
            post.likes_count -= 1
            action = "unliked"
        else:
            # Adicionar curtida
            like = BlogPostLike(
                post_id=post_uuid,
                user_id=user_id
            )
            db.session.add(like)
            post.likes_count += 1
            action = "liked"
        
        db.session.commit()
        
        return jsonify({
            "message": f"Post {action}",
            "likes_count": post.likes_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts/<post_id>/comments", methods=["GET"])
def get_comments(post_id):
    """Listar comentários de um post"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        comments = BlogComment.query.filter_by(
            post_id=post_id,
            is_approved=True
        ).order_by(desc(BlogComment.created_at)).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "comments": [comment.to_dict() for comment in comments.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": comments.total,
                "pages": comments.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/posts/<post_id>/comments", methods=["POST"])
def create_comment():
    """Criar comentário em um post"""
    try:
        data = request.get_json()
        required_fields = ["post_id", "content"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        BlogPost.query.get_or_404(data["post_id"])  # Validar que post existe
        
        comment = BlogComment(
            post_id=data["post_id"],
            user_id=data.get("user_id"),
            author_name=data.get("author_name"),
            author_email=data.get("author_email"),
            content=data["content"],
            parent_id=data.get("parent_id"),
            is_approved=False  # Comentários precisam ser aprovados
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            "message": "Comentário criado com sucesso",
            "comment": comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/tags", methods=["GET"])
def get_tags():
    """Listar todas as tags"""
    try:
        tags = BlogTag.query.order_by(BlogTag.name).all()
        return jsonify({
            "tags": [tag.to_dict() for tag in tags]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/featured", methods=["GET"])
def get_featured_posts():
    """Listar posts em destaque"""
    try:
        limit = request.args.get("limit", 5, type=int)
        
        posts = BlogPost.query.filter_by(
            is_featured=True,
            is_published=True
        ).order_by(desc(BlogPost.published_at)).limit(limit).all()
        
        return jsonify({
            "featured_posts": [post.to_dict() for post in posts]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/popular", methods=["GET"])
def get_popular_posts():
    """Listar posts populares (mais visualizados)"""
    try:
        limit = request.args.get("limit", 10, type=int)
        
        posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(desc(BlogPost.published_at)).limit(limit).all()
        
        return jsonify({
            "popular_posts": [post.to_dict() for post in posts]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/search", methods=["GET"])
def search_posts():
    """Buscar posts por termo"""
    try:
        query = request.args.get("q", "")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        if not query:
            return jsonify({"error": "Termo de busca obrigatório"}), 400
        
        posts = BlogPost.query.filter(
            BlogPost.is_published == True,
            (BlogPost.title.ilike(f"%{query}%") |
             BlogPost.content.ilike(f"%{query}%") |
             BlogPost.excerpt.ilike(f"%{query}%"))
        ).order_by(desc(BlogPost.published_at)).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "posts": [post.to_dict() for post in posts.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": posts.total,
                "pages": posts.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@blog_bp.route("/stats", methods=["GET"])
def get_blog_stats():
    """Estatísticas do blog"""
    try:
        total_posts = BlogPost.query.count()
        published_posts = BlogPost.query.filter_by(is_published=True).count()
        total_categories = BlogCategory.query.count()
        total_tags = BlogTag.query.count()
        total_comments = BlogComment.query.filter_by(is_approved=True).count()
        total_views = db.session.query(
            func.sum(BlogPost.views_count)
        ).scalar() or 0
        
        return jsonify({
            "stats": {
                "total_posts": total_posts,
                "published_posts": published_posts,
                "total_categories": total_categories,
                "total_tags": total_tags,
                "total_comments": total_comments,
                "total_views": total_views
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
