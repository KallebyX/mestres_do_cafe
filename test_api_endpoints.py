#!/usr/bin/env python3
"""
Script de teste para todos os endpoints da API Mestres do Café
"""

import json
import requests
import time
import sys
import os
import sqlite3
from datetime import datetime
from threading import Thread

# Configurações
API_BASE_URL = "http://localhost:5001"
API_ENDPOINTS = {
    "health": "/api/health",
    "info": "/api/info",
    "testimonials": "/api/testimonials",
    
    # Auth endpoints
    "auth_register": "/api/auth/register",
    "auth_login": "/api/auth/login",
    "auth_logout": "/api/auth/logout",
    "auth_verify": "/api/auth/verify",
    "auth_reset_password": "/api/auth/reset-password",
    
    # Products endpoints
    "products_list": "/api/products",
    "products_search": "/api/products/search",
    "products_categories": "/api/products/categories",
    "products_featured": "/api/products/featured",
    
    # Cart endpoints
    "cart_get": "/api/cart",
    "cart_add": "/api/cart/add",
    "cart_update": "/api/cart/update",
    "cart_remove": "/api/cart/remove",
    "cart_clear": "/api/cart/clear",
    
    # Wishlist endpoints
    "wishlist_get": "/api/wishlist",
    "wishlist_add": "/api/wishlist/add",
    "wishlist_remove": "/api/wishlist/remove",
    
    # Reviews endpoints
    "reviews_list": "/api/reviews",
    "reviews_add": "/api/reviews/add",
    "reviews_product": "/api/reviews/product",
    
    # Shipping endpoints
    "shipping_calculate": "/api/shipping/calculate",
    "shipping_options": "/api/shipping/options",
    
    # Checkout endpoints
    "checkout_start": "/api/checkout/start",
    "checkout_payment": "/api/checkout/payment",
    "checkout_complete": "/api/checkout/complete",
}

# Cores para output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_colored(message, color=Colors.WHITE):
    print(f"{color}{message}{Colors.ENDC}")

def print_header(title):
    print_colored(f"\n{'='*60}", Colors.CYAN)
    print_colored(f"🧪 {title}", Colors.CYAN)
    print_colored(f"{'='*60}", Colors.CYAN)

def print_endpoint_test(endpoint, method="GET", status="TESTING"):
    emoji = "🔄" if status == "TESTING" else "✅" if status == "PASS" else "❌"
    color = Colors.YELLOW if status == "TESTING" else Colors.GREEN if status == "PASS" else Colors.RED
    print_colored(f"{emoji} {method:6} {endpoint:30} [{status}]", color)

def test_endpoint(endpoint, method="GET", data=None, headers=None, expected_status=200):
    """
    Testa um endpoint específico
    """
    url = f"{API_BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        
        success = response.status_code == expected_status
        
        return {
            "success": success,
            "status_code": response.status_code,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            "error": None
        }
        
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "status_code": 0,
            "response": None,
            "error": "Connection refused - API server not running"
        }
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status_code": 0,
            "response": None,
            "error": "Request timeout"
        }
    except Exception as e:
        return {
            "success": False,
            "status_code": 0,
            "response": None,
            "error": str(e)
        }

def test_database_connection():
    """
    Testa conexão com banco de dados
    """
    print_header("DATABASE CONNECTION TEST")
    
    db_path = "mestres_cafe.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar tabelas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print_colored(f"✅ Database connected successfully", Colors.GREEN)
        print_colored(f"📊 Found {len(tables)} tables:", Colors.BLUE)
        
        # Mostrar algumas tabelas principais
        important_tables = ['users', 'products', 'orders', 'cart_items', 'reviews']
        for table in important_tables:
            if any(table in t[0] for t in tables):
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print_colored(f"   📋 {table}: {count} records", Colors.WHITE)
        
        conn.close()
        return True
        
    except Exception as e:
        print_colored(f"❌ Database connection failed: {e}", Colors.RED)
        return False

def test_basic_endpoints():
    """
    Testa endpoints básicos
    """
    print_header("BASIC ENDPOINTS TEST")
    
    results = []
    
    # Health check
    print_endpoint_test("/api/health", "GET", "TESTING")
    result = test_endpoint("/api/health")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/health", "GET", status)
    results.append(("Health Check", result))
    
    # API Info
    print_endpoint_test("/api/info", "GET", "TESTING")
    result = test_endpoint("/api/info")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/info", "GET", status)
    results.append(("API Info", result))
    
    # Testimonials
    print_endpoint_test("/api/testimonials", "GET", "TESTING")
    result = test_endpoint("/api/testimonials")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/testimonials", "GET", status)
    results.append(("Testimonials", result))
    
    return results

def test_auth_endpoints():
    """
    Testa endpoints de autenticação
    """
    print_header("AUTHENTICATION ENDPOINTS TEST")
    
    results = []
    
    # Register
    print_endpoint_test("/api/auth/register", "POST", "TESTING")
    test_user = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    result = test_endpoint("/api/auth/register", "POST", test_user, expected_status=201)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/auth/register", "POST", status)
    results.append(("Auth Register", result))
    
    # Login
    print_endpoint_test("/api/auth/login", "POST", "TESTING")
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    result = test_endpoint("/api/auth/login", "POST", login_data)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/auth/login", "POST", status)
    results.append(("Auth Login", result))
    
    # Get auth token for subsequent requests
    auth_token = None
    if result["success"] and result["response"]:
        auth_token = result["response"].get("token")
    
    return results, auth_token

def test_products_endpoints():
    """
    Testa endpoints de produtos
    """
    print_header("PRODUCTS ENDPOINTS TEST")
    
    results = []
    
    # Get products
    print_endpoint_test("/api/products", "GET", "TESTING")
    result = test_endpoint("/api/products")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/products", "GET", status)
    results.append(("Products List", result))
    
    # Search products
    print_endpoint_test("/api/products/search?q=café", "GET", "TESTING")
    result = test_endpoint("/api/products/search?q=café")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/products/search?q=café", "GET", status)
    results.append(("Products Search", result))
    
    # Get categories
    print_endpoint_test("/api/products/categories", "GET", "TESTING")
    result = test_endpoint("/api/products/categories")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/products/categories", "GET", status)
    results.append(("Products Categories", result))
    
    # Get featured products
    print_endpoint_test("/api/products/featured", "GET", "TESTING")
    result = test_endpoint("/api/products/featured")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/products/featured", "GET", status)
    results.append(("Featured Products", result))
    
    return results

def test_cart_endpoints(auth_token=None):
    """
    Testa endpoints de carrinho
    """
    print_header("CART ENDPOINTS TEST")
    
    results = []
    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else None
    
    # Get cart
    print_endpoint_test("/api/cart", "GET", "TESTING")
    result = test_endpoint("/api/cart", headers=headers)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/cart", "GET", status)
    results.append(("Cart Get", result))
    
    # Add to cart
    print_endpoint_test("/api/cart/add", "POST", "TESTING")
    cart_item = {
        "product_id": 1,
        "quantity": 2
    }
    result = test_endpoint("/api/cart/add", "POST", cart_item, headers=headers)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/cart/add", "POST", status)
    results.append(("Cart Add", result))
    
    return results

def test_wishlist_endpoints(auth_token=None):
    """
    Testa endpoints de wishlist
    """
    print_header("WISHLIST ENDPOINTS TEST")
    
    results = []
    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else None
    
    # Get wishlist
    print_endpoint_test("/api/wishlist", "GET", "TESTING")
    result = test_endpoint("/api/wishlist", headers=headers)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/wishlist", "GET", status)
    results.append(("Wishlist Get", result))
    
    # Add to wishlist
    print_endpoint_test("/api/wishlist/add", "POST", "TESTING")
    wishlist_item = {
        "product_id": 1
    }
    result = test_endpoint("/api/wishlist/add", "POST", wishlist_item, headers=headers)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/wishlist/add", "POST", status)
    results.append(("Wishlist Add", result))
    
    return results

def test_reviews_endpoints():
    """
    Testa endpoints de reviews
    """
    print_header("REVIEWS ENDPOINTS TEST")
    
    results = []
    
    # Get reviews
    print_endpoint_test("/api/reviews", "GET", "TESTING")
    result = test_endpoint("/api/reviews")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/reviews", "GET", status)
    results.append(("Reviews List", result))
    
    # Get product reviews
    print_endpoint_test("/api/reviews/product/1", "GET", "TESTING")
    result = test_endpoint("/api/reviews/product/1")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/reviews/product/1", "GET", status)
    results.append(("Product Reviews", result))
    
    return results

def test_shipping_endpoints():
    """
    Testa endpoints de shipping
    """
    print_header("SHIPPING ENDPOINTS TEST")
    
    results = []
    
    # Calculate shipping
    print_endpoint_test("/api/shipping/calculate", "POST", "TESTING")
    shipping_data = {
        "cep": "01234567",
        "weight": 1.0,
        "value": 100.0
    }
    result = test_endpoint("/api/shipping/calculate", "POST", shipping_data)
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/shipping/calculate", "POST", status)
    results.append(("Shipping Calculate", result))
    
    # Get shipping options
    print_endpoint_test("/api/shipping/options", "GET", "TESTING")
    result = test_endpoint("/api/shipping/options")
    status = "PASS" if result["success"] else "FAIL"
    print_endpoint_test("/api/shipping/options", "GET", status)
    results.append(("Shipping Options", result))
    
    return results

def generate_test_report(all_results):
    """
    Gera relatório de testes
    """
    print_header("TEST REPORT")
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for category, results in all_results.items():
        print_colored(f"\n📊 {category}:", Colors.BLUE)
        
        for test_name, result in results:
            total_tests += 1
            if result["success"]:
                passed_tests += 1
                print_colored(f"  ✅ {test_name}", Colors.GREEN)
            else:
                failed_tests += 1
                error_msg = result['error'] or f'Status {result["status_code"]}'
                print_colored(f"  ❌ {test_name}: {error_msg}", Colors.RED)
    
    print_colored(f"\n📈 SUMMARY:", Colors.CYAN)
    print_colored(f"  Total Tests: {total_tests}", Colors.WHITE)
    print_colored(f"  Passed: {passed_tests}", Colors.GREEN)
    print_colored(f"  Failed: {failed_tests}", Colors.RED)
    print_colored(f"  Success Rate: {(passed_tests/total_tests)*100:.1f}%", Colors.YELLOW)
    
    return {
        "total": total_tests,
        "passed": passed_tests,
        "failed": failed_tests,
        "success_rate": (passed_tests/total_tests)*100
    }

def main():
    """
    Função principal
    """
    print_colored("🚀 MESTRES DO CAFÉ API - ENDPOINT TESTING", Colors.MAGENTA)
    print_colored(f"🌐 Base URL: {API_BASE_URL}", Colors.WHITE)
    print_colored(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", Colors.WHITE)
    
    all_results = {}
    
    # Test database connection
    if not test_database_connection():
        print_colored("❌ Database connection failed. Some tests may fail.", Colors.RED)
    
    # Test basic endpoints
    all_results["Basic Endpoints"] = test_basic_endpoints()
    
    # Test auth endpoints
    auth_results, auth_token = test_auth_endpoints()
    all_results["Authentication"] = auth_results
    
    # Test products endpoints
    all_results["Products"] = test_products_endpoints()
    
    # Test cart endpoints
    all_results["Cart"] = test_cart_endpoints(auth_token)
    
    # Test wishlist endpoints
    all_results["Wishlist"] = test_wishlist_endpoints(auth_token)
    
    # Test reviews endpoints
    all_results["Reviews"] = test_reviews_endpoints()
    
    # Test shipping endpoints
    all_results["Shipping"] = test_shipping_endpoints()
    
    # Generate report
    summary = generate_test_report(all_results)
    
    # Save results to file
    test_results = {
        "timestamp": datetime.now().isoformat(),
        "summary": summary,
        "detailed_results": all_results
    }
    
    with open("api_test_results.json", "w") as f:
        json.dump(test_results, f, indent=2, default=str)
    
    print_colored(f"\n💾 Test results saved to: api_test_results.json", Colors.CYAN)
    
    return summary["success_rate"] > 70  # Return True if success rate > 70%

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)