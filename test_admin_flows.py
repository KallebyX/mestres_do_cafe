#!/usr/bin/env python3
"""
Admin Flows Test
Comprehensive test of all admin functionality and workflows
"""

import requests
import json
import sys
import time
from datetime import datetime

class AdminFlowTester:
    def __init__(self):
        self.api_base = "http://localhost:5001"
        self.frontend_base = "http://localhost:3000"
        self.admin_token = None
        self.admin_user_id = None
        self.test_results = {
            "auth": {},
            "dashboard": {},
            "management": {},
            "analytics": {},
            "gamification": {},
            "content": {},
            "system": {}
        }
    
    def log_result(self, category, test_name, status, details=""):
        """Log test result"""
        self.test_results[category][test_name] = {
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        status_icon = "✅" if status == "pass" else "❌" if status == "fail" else "⚠️"
        print(f"{status_icon} {category.upper()}: {test_name} - {details}")
    
    def authenticate_admin(self):
        """Authenticate as admin and get token"""
        print("🔑 Testing Admin Authentication...")
        
        admin_credentials = {
            "email": "admin@mestres.cafe",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_base}/api/auth/login", 
                                   json=admin_credentials, timeout=10)
            
            if response.status_code == 200:
                login_data = response.json()
                if login_data.get('success'):
                    self.admin_token = login_data.get('access_token')
                    user_info = login_data.get('user', {})
                    self.admin_user_id = user_info.get('id')
                    
                    self.log_result("auth", "admin_login", "pass", 
                                   f"Admin: {user_info.get('is_admin')}, ID: {self.admin_user_id}")
                    return True
                else:
                    self.log_result("auth", "admin_login", "fail", 
                                   login_data.get('error', 'Unknown error'))
            else:
                self.log_result("auth", "admin_login", "fail", 
                               f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("auth", "admin_login", "fail", str(e))
        
        return False
    
    def test_admin_dashboard(self):
        """Test admin dashboard functionality"""
        print("\n📊 Testing Admin Dashboard...")
        
        if not self.admin_token:
            self.log_result("dashboard", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test dashboard endpoint
        try:
            response = requests.get(f"{self.api_base}/api/admin/dashboard", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                dashboard_data = response.json()
                if dashboard_data.get('success'):
                    data = dashboard_data.get('data', {})
                    
                    # Check key metrics
                    sales = data.get('sales', {})
                    users = data.get('users', {})
                    products = data.get('products', {})
                    
                    self.log_result("dashboard", "main_dashboard", "pass", 
                                   f"Sales: {sales.get('total_revenue', 0)}, Users: {users.get('total_users', 0)}, Products: {products.get('total_products', 0)}")
                else:
                    self.log_result("dashboard", "main_dashboard", "fail", "No success in response")
            else:
                self.log_result("dashboard", "main_dashboard", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("dashboard", "main_dashboard", "fail", str(e))
        
        # Test admin stats
        try:
            response = requests.get(f"{self.api_base}/api/admin/stats", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                stats_data = response.json()
                if stats_data.get('success'):
                    self.log_result("dashboard", "admin_stats", "pass", 
                                   "Admin statistics loaded")
                else:
                    self.log_result("dashboard", "admin_stats", "fail", "No success in response")
            else:
                self.log_result("dashboard", "admin_stats", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("dashboard", "admin_stats", "fail", str(e))
    
    def test_admin_management(self):
        """Test admin management functions"""
        print("\n👥 Testing Admin Management...")
        
        if not self.admin_token:
            self.log_result("management", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test user management
        try:
            response = requests.get(f"{self.api_base}/api/admin/users", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                users_data = response.json()
                if users_data.get('success'):
                    users = users_data.get('users', [])
                    self.log_result("management", "user_management", "pass", 
                                   f"Users loaded: {len(users)}")
                else:
                    self.log_result("management", "user_management", "fail", "No success in response")
            else:
                self.log_result("management", "user_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("management", "user_management", "fail", str(e))
        
        # Test product management
        try:
            response = requests.get(f"{self.api_base}/api/admin/products", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                products_data = response.json()
                if products_data.get('success'):
                    products = products_data.get('products', [])
                    self.log_result("management", "product_management", "pass", 
                                   f"Products loaded: {len(products)}")
                else:
                    self.log_result("management", "product_management", "fail", "No success in response")
            else:
                self.log_result("management", "product_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("management", "product_management", "fail", str(e))
        
        # Test order management
        try:
            response = requests.get(f"{self.api_base}/api/admin/orders", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                orders_data = response.json()
                if orders_data.get('success'):
                    orders = orders_data.get('orders', [])
                    self.log_result("management", "order_management", "pass", 
                                   f"Orders loaded: {len(orders)}")
                else:
                    self.log_result("management", "order_management", "fail", "No success in response")
            else:
                self.log_result("management", "order_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("management", "order_management", "fail", str(e))
        
        # Test customer management
        try:
            response = requests.get(f"{self.api_base}/api/admin/customers", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                customers_data = response.json()
                if customers_data.get('success'):
                    customers = customers_data.get('customers', [])
                    self.log_result("management", "customer_management", "pass", 
                                   f"Customers loaded: {len(customers)}")
                else:
                    self.log_result("management", "customer_management", "fail", "No success in response")
            else:
                self.log_result("management", "customer_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("management", "customer_management", "fail", str(e))
    
    def test_admin_analytics(self):
        """Test admin analytics and reporting"""
        print("\n📈 Testing Admin Analytics...")
        
        if not self.admin_token:
            self.log_result("analytics", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test top products analytics
        try:
            response = requests.get(f"{self.api_base}/api/admin/analytics/top-products-revenue", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                analytics_data = response.json()
                if analytics_data.get('success'):
                    products = analytics_data.get('products', [])
                    self.log_result("analytics", "top_products", "pass", 
                                   f"Top products: {len(products)}")
                else:
                    self.log_result("analytics", "top_products", "fail", "No success in response")
            else:
                self.log_result("analytics", "top_products", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("analytics", "top_products", "fail", str(e))
        
        # Test financial reports
        try:
            response = requests.get(f"{self.api_base}/api/financial/reports/monthly", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                report_data = response.json()
                self.log_result("analytics", "financial_reports", "pass", 
                               "Financial reports accessible")
            else:
                self.log_result("analytics", "financial_reports", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("analytics", "financial_reports", "fail", str(e))
    
    def test_admin_gamification(self):
        """Test admin gamification management"""
        print("\n🎮 Testing Admin Gamification...")
        
        if not self.admin_token:
            self.log_result("gamification", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test gamification dashboard
        try:
            response = requests.get(f"{self.api_base}/api/gamification/admin/dashboard", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                dashboard_data = response.json()
                if dashboard_data.get('success'):
                    self.log_result("gamification", "admin_dashboard", "pass", 
                                   "Gamification dashboard loaded")
                else:
                    self.log_result("gamification", "admin_dashboard", "fail", "No success in response")
            else:
                self.log_result("gamification", "admin_dashboard", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("gamification", "admin_dashboard", "fail", str(e))
        
        # Test points management
        try:
            response = requests.get(f"{self.api_base}/api/gamification/admin/points/actions", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                actions_data = response.json()
                if actions_data.get('success'):
                    actions = actions_data.get('actions', [])
                    self.log_result("gamification", "points_actions", "pass", 
                                   f"Point actions: {len(actions)}")
                else:
                    self.log_result("gamification", "points_actions", "fail", "No success in response")
            else:
                self.log_result("gamification", "points_actions", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("gamification", "points_actions", "fail", str(e))
        
        # Test user search
        try:
            response = requests.get(f"{self.api_base}/api/gamification/admin/users/search?q=admin", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                search_data = response.json()
                if search_data.get('success'):
                    users = search_data.get('users', [])
                    self.log_result("gamification", "user_search", "pass", 
                                   f"Users found: {len(users)}")
                else:
                    self.log_result("gamification", "user_search", "fail", "No success in response")
            else:
                self.log_result("gamification", "user_search", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("gamification", "user_search", "fail", str(e))
    
    def test_admin_content_management(self):
        """Test admin content management"""
        print("\n📝 Testing Admin Content Management...")
        
        if not self.admin_token:
            self.log_result("content", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test blog management
        try:
            response = requests.get(f"{self.api_base}/api/admin/blog/posts", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                blog_data = response.json()
                if blog_data.get('success'):
                    posts = blog_data.get('posts', [])
                    self.log_result("content", "blog_management", "pass", 
                                   f"Blog posts: {len(posts)}")
                else:
                    self.log_result("content", "blog_management", "fail", "No success in response")
            else:
                self.log_result("content", "blog_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("content", "blog_management", "fail", str(e))
        
        # Test blog categories
        try:
            response = requests.get(f"{self.api_base}/api/admin/blog/categories", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                categories_data = response.json()
                if categories_data.get('success'):
                    categories = categories_data.get('categories', [])
                    self.log_result("content", "blog_categories", "pass", 
                                   f"Blog categories: {len(categories)}")
                else:
                    self.log_result("content", "blog_categories", "fail", "No success in response")
            else:
                self.log_result("content", "blog_categories", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("content", "blog_categories", "fail", str(e))
        
        # Test newsletter management
        try:
            response = requests.get(f"{self.api_base}/api/newsletter/subscribers", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                newsletter_data = response.json()
                if newsletter_data.get('success'):
                    subscribers = newsletter_data.get('subscribers', [])
                    self.log_result("content", "newsletter_management", "pass", 
                                   f"Newsletter subscribers: {len(subscribers)}")
                else:
                    self.log_result("content", "newsletter_management", "fail", "No success in response")
            else:
                self.log_result("content", "newsletter_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("content", "newsletter_management", "fail", str(e))
    
    def test_admin_system_management(self):
        """Test admin system management functions"""
        print("\n⚙️ Testing Admin System Management...")
        
        if not self.admin_token:
            self.log_result("system", "no_token", "fail", "No admin token")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test HR management
        try:
            response = requests.get(f"{self.api_base}/api/hr/employees", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                hr_data = response.json()
                if hr_data.get('success'):
                    employees = hr_data.get('employees', [])
                    self.log_result("system", "hr_management", "pass", 
                                   f"Employees: {len(employees)}")
                else:
                    self.log_result("system", "hr_management", "fail", "No success in response")
            else:
                self.log_result("system", "hr_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("system", "hr_management", "fail", str(e))
        
        # Test supplier management
        try:
            response = requests.get(f"{self.api_base}/api/suppliers", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                suppliers_data = response.json()
                if suppliers_data.get('success'):
                    suppliers = suppliers_data.get('suppliers', [])
                    self.log_result("system", "supplier_management", "pass", 
                                   f"Suppliers: {len(suppliers)}")
                else:
                    self.log_result("system", "supplier_management", "fail", "No success in response")
            else:
                self.log_result("system", "supplier_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("system", "supplier_management", "fail", str(e))
        
        # Test stock management
        try:
            response = requests.get(f"{self.api_base}/api/stock", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                stock_data = response.json()
                if stock_data.get('success'):
                    stock_items = stock_data.get('stock', [])
                    self.log_result("system", "stock_management", "pass", 
                                   f"Stock items: {len(stock_items)}")
                else:
                    self.log_result("system", "stock_management", "fail", "No success in response")
            else:
                self.log_result("system", "stock_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("system", "stock_management", "fail", str(e))
        
        # Test media management
        try:
            response = requests.get(f"{self.api_base}/api/media/", 
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                media_data = response.json()
                if media_data.get('success'):
                    media_files = media_data.get('files', [])
                    self.log_result("system", "media_management", "pass", 
                                   f"Media files: {len(media_files)}")
                else:
                    self.log_result("system", "media_management", "fail", "No success in response")
            else:
                self.log_result("system", "media_management", "fail", f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("system", "media_management", "fail", str(e))
    
    def print_summary(self):
        """Print comprehensive admin flows summary"""
        print("\n" + "="*70)
        print("👑 ADMIN FLOWS TEST SUMMARY")
        print("="*70)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category, tests in self.test_results.items():
            if tests:
                print(f"\n📋 {category.upper()} TESTS:")
                category_passed = 0
                category_total = 0
                
                for test_name, result in tests.items():
                    status_icon = "✅" if result["status"] == "pass" else "❌" if result["status"] == "fail" else "⚠️"
                    print(f"   {status_icon} {test_name}: {result['details']}")
                    
                    category_total += 1
                    total_tests += 1
                    
                    if result["status"] == "pass":
                        category_passed += 1
                        passed_tests += 1
                    else:
                        failed_tests += 1
                
                success_rate = (category_passed / category_total * 100) if category_total > 0 else 0
                print(f"   📊 {category.upper()} Success Rate: {success_rate:.1f}% ({category_passed}/{category_total})")
        
        overall_success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL ADMIN FLOWS RESULTS:")
        print(f"   • Total Tests: {total_tests}")
        print(f"   • Passed: {passed_tests}")
        print(f"   • Failed: {failed_tests}")
        print(f"   • Success Rate: {overall_success_rate:.1f}%")
        
        if overall_success_rate >= 90:
            status = "🌟 EXCELLENT"
            message = "All admin flows are working excellently!"
        elif overall_success_rate >= 80:
            status = "👍 VERY GOOD"
            message = "Admin flows are working well with minor issues."
        elif overall_success_rate >= 70:
            status = "✅ GOOD"
            message = "Admin flows are mostly functional."
        else:
            status = "⚠️  NEEDS ATTENTION"
            message = "Admin flows have significant issues."
        
        print(f"\n{status}: {message}")
        
        print(f"\n🔗 Admin Access:")
        print(f"   • Frontend Admin Panel: {self.frontend_base}/admin")
        print(f"   • Admin Credentials: admin@mestres.cafe / admin123")
        print(f"   • Admin Token: {'Available' if self.admin_token else 'Not Available'}")
        print(f"   • Admin User ID: {self.admin_user_id or 'Not Available'}")
        
        return overall_success_rate >= 75
    
    def run_all_admin_tests(self):
        """Run all admin flow tests"""
        print("👑 STARTING COMPREHENSIVE ADMIN FLOWS TEST")
        print("Testing Authentication, Dashboard, Management, Analytics, and System Functions")
        print("="*70)
        
        start_time = time.time()
        
        # Run all test categories
        if self.authenticate_admin():
            self.test_admin_dashboard()
            self.test_admin_management()
            self.test_admin_analytics()
            self.test_admin_gamification()
            self.test_admin_content_management()
            self.test_admin_system_management()
        else:
            print("❌ Cannot proceed without admin authentication")
        
        end_time = time.time()
        test_duration = end_time - start_time
        
        print(f"\n⏱️  Test Duration: {test_duration:.2f} seconds")
        
        return self.print_summary()

def main():
    """Main test execution"""
    tester = AdminFlowTester()
    success = tester.run_all_admin_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()