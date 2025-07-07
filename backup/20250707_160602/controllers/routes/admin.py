from flask import Blueprint, request, jsonify
from src.models.database import db, User, Product, Order, BlogPost
from sqlalchemy import func
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # Estatísticas gerais
        total_users = User.query.count()
        total_products = Product.query.filter_by(is_active=True).count()
        total_orders = Order.query.count()
        total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0
        
        # Pedidos por status
        orders_by_status = db.session.query(
            Order.status, 
            func.count(Order.id)
        ).group_by(Order.status).all()
        
        # Vendas dos últimos 30 dias
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_orders = Order.query.filter(Order.created_at >= thirty_days_ago).count()
        recent_revenue = db.session.query(func.sum(Order.total_amount))\
                                  .filter(Order.created_at >= thirty_days_ago).scalar() or 0
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_products': total_products,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'recent_orders': recent_orders,
                'recent_revenue': float(recent_revenue),
                'orders_by_status': {status: count for status, count in orders_by_status}
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
def get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users = User.query.order_by(User.created_at.desc())\
                         .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'points': user.points,
                'level': user.level,
                'total_spent': float(user.total_spent),
                'account_type': user.account_type,
                'created_at': user.created_at.isoformat()
            } for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'total': users.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['GET'])
def get_admin_products():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        products = Product.query.order_by(Product.created_at.desc())\
                               .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'products': [{
                'id': product.id,
                'name': product.name,
                'price': float(product.price),
                'category': product.category,
                'stock_quantity': product.stock_quantity,
                'is_active': product.is_active,
                'created_at': product.created_at.isoformat()
            } for product in products.items],
            'pagination': {
                'page': products.page,
                'pages': products.pages,
                'total': products.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders', methods=['GET'])
def get_admin_orders():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Order.query
        if status:
            query = query.filter_by(status=status)
        
        orders = query.order_by(Order.created_at.desc())\
                     .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'orders': [{
                'id': order.id,
                'user_name': order.user.name,
                'user_email': order.user.email,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'created_at': order.created_at.isoformat(),
                'items_count': len(order.items)
            } for order in orders.items],
            'pagination': {
                'page': orders.page,
                'pages': orders.pages,
                'total': orders.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/blog/posts', methods=['GET'])
def get_admin_blog_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        posts = BlogPost.query.order_by(BlogPost.created_at.desc())\
                             .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'posts': [{
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'author_name': post.author.name,
                'category': post.category,
                'is_published': post.is_published,
                'published_at': post.published_at.isoformat() if post.published_at else None,
                'created_at': post.created_at.isoformat()
            } for post in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'total': posts.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics/sales', methods=['GET'])
def get_sales_analytics():
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Vendas por dia
        daily_sales = db.session.query(
            func.date(Order.created_at).label('date'),
            func.count(Order.id).label('orders'),
            func.sum(Order.total_amount).label('revenue')
        ).filter(Order.created_at >= start_date)\
         .group_by(func.date(Order.created_at))\
         .order_by(func.date(Order.created_at)).all()
        
        # Produtos mais vendidos
        top_products = db.session.query(
            Product.name,
            func.sum(OrderItem.quantity).label('total_sold')
        ).join(OrderItem)\
         .join(Order)\
         .filter(Order.created_at >= start_date)\
         .group_by(Product.id, Product.name)\
         .order_by(func.sum(OrderItem.quantity).desc())\
         .limit(10).all()
        
        return jsonify({
            'daily_sales': [{
                'date': sale.date.isoformat(),
                'orders': sale.orders,
                'revenue': float(sale.revenue or 0)
            } for sale in daily_sales],
            'top_products': [{
                'name': product.name,
                'total_sold': product.total_sold
            } for product in top_products]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

