#!/usr/bin/env python3
"""
Mestres do Café - Minimal API Server
Using Python's built-in HTTP server to avoid dependency issues
"""

import json
import os
import sys
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import uuid

# Add CORS headers
def add_cors_headers(handler):
    """Add CORS headers to response"""
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

class APIHandler(BaseHTTPRequestHandler):
    """Basic API handler for Mestres do Café"""
    
    def log_message(self, format, *args):
        """Override to add timestamp to logs"""
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          datetime.now().strftime('%d/%b/%Y %H:%M:%S'),
                          format%args))

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        add_cors_headers(self)
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            if path == '/api/health':
                self.send_health()
            elif path == '/api/info':
                self.send_api_info()
            elif path == '/api/testimonials':
                self.send_testimonials()
            elif path == '/api/courses':
                self.send_courses()
            elif path.startswith('/api/products'):
                self.handle_products(path)
            elif path == '/api/cart':
                self.send_cart()
            else:
                self.send_404()
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            if path == '/api/auth/login':
                self.handle_login(post_data)
            elif path == '/api/cart/items':
                self.handle_add_to_cart(post_data)
            else:
                self.send_404()
        except Exception as e:
            self.send_error_response(500, str(e))

    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        add_cors_headers(self)
        self.end_headers()
        
        json_data = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(json_data.encode('utf-8'))

    def send_error_response(self, status_code, message):
        """Send error response"""
        self.send_json_response({
            'success': False,
            'error': message,
            'status_code': status_code
        }, status_code)

    def send_404(self):
        """Send 404 response"""
        self.send_error_response(404, 'Endpoint not found')

    def send_health(self):
        """Send health check response"""
        self.send_json_response({
            'status': 'healthy',
            'service': 'Mestres do Café API',
            'version': '1.0.0',
            'environment': os.environ.get('FLASK_ENV', 'development'),
            'database': 'Mock SQLite',
            'timestamp': datetime.now().isoformat()
        })

    def send_api_info(self):
        """Send API info"""
        self.send_json_response({
            'name': 'Mestres do Café Enterprise API',
            'version': '1.0.0',
            'description': 'Sistema de e-commerce e ERP para torrefação artesanal',
            'endpoints': {
                'auth': '/api/auth',
                'products': '/api/products',
                'cart': '/api/cart',
                'testimonials': '/api/testimonials',
                'courses': '/api/courses',
                'health': '/api/health',
            }
        })

    def send_testimonials(self):
        """Send mock testimonials"""
        testimonials = [
            {
                'id': 1,
                'name': 'Maria Silva',
                'rating': 5,
                'comment': 'Café excepcional! O melhor que já experimentei.',
                'image_url': None,
                'created_at': '2024-01-15T10:30:00Z',
            },
            {
                'id': 2,
                'name': 'João Santos',
                'rating': 5,
                'comment': 'Qualidade impressionante e entrega rápida. Recomendo!',
                'image_url': None,
                'created_at': '2024-01-10T14:20:00Z',
            },
            {
                'id': 3,
                'name': 'Ana Costa',
                'rating': 4,
                'comment': 'Sabor único e aroma incrível. Voltarei a comprar!',
                'image_url': None,
                'created_at': '2024-01-05T09:15:00Z',
            }
        ]
        self.send_json_response(testimonials)

    def send_courses(self):
        """Send mock courses"""
        courses = [
            {
                'id': 1,
                'title': 'Introdução ao Café Especial',
                'description': 'Aprenda os fundamentos do café especial',
                'instructor': 'João Especialista',
                'duration': '2 horas',
                'price': 99.90,
                'image_url': None,
                'is_active': True,
                'created_at': '2024-01-01T10:00:00Z',
            },
            {
                'id': 2,
                'title': 'Técnicas de Torra Avançadas',
                'description': 'Domine as técnicas de torra profissionais',
                'instructor': 'Maria Torra',
                'duration': '3 horas',
                'price': 149.90,
                'image_url': None,
                'is_active': True,
                'created_at': '2024-01-05T14:00:00Z',
            }
        ]
        self.send_json_response(courses)

    def handle_products(self, path):
        """Handle products endpoints"""
        mock_products = [
            {
                'id': 1,
                'name': 'Café Premium Arábica',
                'description': 'Café especial com notas frutadas e chocolate',
                'price': 45.90,
                'category': 'premium',
                'images': ['/images/cafe-premium.jpg'],
                'weight': '250g',
                'in_stock': True
            },
            {
                'id': 2,
                'name': 'Blend Especial',
                'description': 'Mistura única de grãos selecionados',
                'price': 35.90,
                'category': 'blend',
                'images': ['/images/blend-especial.jpg'],
                'weight': '500g',
                'in_stock': True
            }
        ]
        
        if path == '/api/products':
            self.send_json_response({
                'success': True,
                'data': mock_products,
                'total': len(mock_products)
            })
        else:
            # Handle product by ID
            self.send_json_response({
                'success': True,
                'data': mock_products[0] if mock_products else None
            })

    def send_cart(self):
        """Send mock cart data"""
        self.send_json_response({
            'success': True,
            'data': {
                'items': [],
                'total': 0.0
            }
        })

    def handle_login(self, post_data):
        """Handle login request"""
        try:
            data = json.loads(post_data)
            email = data.get('email', '')
            password = data.get('password', '')
            
            # Mock authentication
            if email and password:
                self.send_json_response({
                    'success': True,
                    'data': {
                        'user': {
                            'id': str(uuid.uuid4()),
                            'email': email,
                            'name': 'Usuário Teste'
                        },
                        'token': 'mock-jwt-token',
                        'expires_in': 3600
                    }
                })
            else:
                self.send_error_response(400, 'Email e senha são obrigatórios')
        except json.JSONDecodeError:
            self.send_error_response(400, 'JSON inválido')

    def handle_add_to_cart(self, post_data):
        """Handle add to cart request"""
        try:
            data = json.loads(post_data)
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            
            if product_id:
                self.send_json_response({
                    'success': True,
                    'data': {
                        'message': 'Produto adicionado ao carrinho',
                        'product_id': product_id,
                        'quantity': quantity
                    }
                })
            else:
                self.send_error_response(400, 'product_id é obrigatório')
        except json.JSONDecodeError:
            self.send_error_response(400, 'JSON inválido')

def main():
    """Main function to start the server"""
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '0.0.0.0')
    
    server = HTTPServer((host, port), APIHandler)
    
    print(f"""
🚀 Mestres do Café Enterprise API (Minimal)
📍 Rodando em: http://{host}:{port}
🔧 Health Check: http://{host}:{port}/api/health
📊 API Info: http://{host}:{port}/api/info
🌟 Testimonials: http://{host}:{port}/api/testimonials
🎓 Courses: http://{host}:{port}/api/courses
☕ Products: http://{host}:{port}/api/products
""")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Servidor finalizado')
        server.shutdown()

if __name__ == '__main__':
    main()