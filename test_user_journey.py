#!/usr/bin/env python3
"""
Test script to demonstrate complete user journey from registration to purchase
"""
import requests
import json
import time

API_BASE = "http://localhost:5001"
FRONTEND_BASE = "http://localhost:3000"

def test_api_endpoint(endpoint, method="GET", data=None):
    """Helper function to test API endpoints"""
    url = f"{API_BASE}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"HTTP {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": str(e)}

def test_user_registration():
    """Test user registration flow"""
    print("🔐 Testing User Registration...")
    
    # Test user registration
    new_user = {
        "email": "novo.usuario@mestres.cafe",
        "password": "senha123",
        "name": "Novo Usuário"
    }
    
    result = test_api_endpoint("/api/auth/register", "POST", new_user)
    if result.get("success"):
        print(f"✅ User registered: {result['user']['email']}")
        return result
    else:
        print(f"❌ Registration failed: {result.get('error', 'Unknown error')}")
        return None

def test_user_login():
    """Test user login flow"""
    print("\n🔑 Testing User Login...")
    
    # Test admin login
    admin_credentials = {
        "email": "admin@mestres.cafe",
        "password": "admin123"
    }
    
    result = test_api_endpoint("/api/auth/login", "POST", admin_credentials)
    if result.get("success"):
        print(f"✅ Admin login successful: {result['user']['email']}")
        print(f"   Is Admin: {result['user']['is_admin']}")
        return result
    else:
        print(f"❌ Login failed: {result.get('error', 'Unknown error')}")
        return None

def test_product_browsing():
    """Test product browsing"""
    print("\n🛒 Testing Product Browsing...")
    
    # Get all products
    products = test_api_endpoint("/api/products")
    if isinstance(products, list) and len(products) > 0:
        print(f"✅ Found {len(products)} products:")
        for product in products[:3]:  # Show first 3
            print(f"   - {product['name']}: R$ {product['price']}")
        
        # Test individual product
        if products:
            product_id = products[0]['id']
            product_detail = test_api_endpoint(f"/api/products/{product_id}")
            if not product_detail.get("error"):
                print(f"✅ Product detail loaded: {product_detail['name']}")
            else:
                print(f"❌ Product detail failed: {product_detail.get('error')}")
        
        return products
    else:
        print(f"❌ Product browsing failed: {products.get('error', 'No products found')}")
        return None

def test_shopping_cart():
    """Test shopping cart functionality"""
    print("\n🛍️ Testing Shopping Cart...")
    
    # Get empty cart
    cart = test_api_endpoint("/api/cart")
    if not cart.get("error"):
        print(f"✅ Empty cart retrieved: {len(cart['items'])} items")
        
        # Add item to cart
        cart_item = {
            "product_id": 1,
            "quantity": 2
        }
        
        add_result = test_api_endpoint("/api/cart/items", "POST", cart_item)
        if add_result.get("success"):
            print(f"✅ Item added to cart: Product {cart_item['product_id']} x{cart_item['quantity']}")
            return True
        else:
            print(f"❌ Add to cart failed: {add_result.get('error')}")
            return False
    else:
        print(f"❌ Cart access failed: {cart.get('error')}")
        return False

def test_admin_dashboard():
    """Test admin dashboard functionality"""
    print("\n👨‍💼 Testing Admin Dashboard...")
    
    # Get analytics stats
    stats = test_api_endpoint("/api/admin/analytics/stats")
    if not stats.get("error"):
        print("✅ Admin analytics loaded:")
        print(f"   - Products: {stats['products']}")
        print(f"   - Users: {stats['users']}")
        print(f"   - Categories: {stats['categories']}")
        
        # Get stock information
        stock = test_api_endpoint("/api/admin/stock")
        if isinstance(stock, list):
            print(f"✅ Stock information loaded: {len(stock)} items")
            low_stock = [item for item in stock if item['stock_quantity'] < 30]
            if low_stock:
                print(f"   ⚠️  Low stock items: {len(low_stock)}")
        else:
            print(f"❌ Stock loading failed: {stock.get('error', 'Unknown error')}")
        
        return True
    else:
        print(f"❌ Admin dashboard failed: {stats.get('error')}")
        return False

def test_additional_endpoints():
    """Test additional API endpoints"""
    print("\n📝 Testing Additional Endpoints...")
    
    # Test categories
    categories = test_api_endpoint("/api/categories")
    if isinstance(categories, list):
        print(f"✅ Categories loaded: {len(categories)} categories")
    else:
        print(f"❌ Categories failed: {categories.get('error', 'Unknown error')}")
    
    # Test blog
    blog = test_api_endpoint("/api/blog")
    if isinstance(blog, list):
        print(f"✅ Blog posts loaded: {len(blog)} posts")
    else:
        print(f"❌ Blog failed: {blog.get('error', 'Unknown error')}")
    
    # Test orders
    orders = test_api_endpoint("/api/orders")
    if isinstance(orders, list):
        print(f"✅ Orders loaded: {len(orders)} orders")
    else:
        print(f"❌ Orders failed: {orders.get('error', 'Unknown error')}")

def test_frontend_connectivity():
    """Test frontend server connectivity"""
    print("\n🌐 Testing Frontend Connectivity...")
    
    try:
        response = requests.get(FRONTEND_BASE, timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend accessible at {FRONTEND_BASE}")
            return True
        else:
            print(f"❌ Frontend returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend connection failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 MESTRES DO CAFÉ - COMPLETE SYSTEM TEST")
    print("=" * 60)
    
    # Test backend API
    print("\n🔧 BACKEND API TESTS")
    print("-" * 30)
    
    registration_result = test_user_registration()
    login_result = test_user_login()
    products_result = test_product_browsing()
    cart_result = test_shopping_cart()
    admin_result = test_admin_dashboard()
    test_additional_endpoints()
    
    # Test frontend connectivity
    print("\n🌐 FRONTEND TESTS")
    print("-" * 30)
    
    frontend_result = test_frontend_connectivity()
    
    # Summary
    print("\n📊 TEST SUMMARY")
    print("=" * 60)
    
    tests = [
        ("User Registration", registration_result is not None),
        ("User Login", login_result is not None),
        ("Product Browsing", products_result is not None),
        ("Shopping Cart", cart_result),
        ("Admin Dashboard", admin_result),
        ("Frontend Access", frontend_result)
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    print(f"✅ Passed: {passed}/{total} tests")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! System is ready for integration testing.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    print("\n🔗 SYSTEM LINKS:")
    print(f"   Frontend: {FRONTEND_BASE}")
    print(f"   API: {API_BASE}")
    print(f"   API Health: {API_BASE}/health")
    
    print("\n🔐 TEST CREDENTIALS:")
    print("   Admin: admin@mestres.cafe / admin123")
    print("   Client: cliente@mestres.cafe / cliente123")
    print("   New User: novo.usuario@mestres.cafe / senha123")

if __name__ == "__main__":
    main()