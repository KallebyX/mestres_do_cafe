#!/usr/bin/env python3
"""
Complete System Test
Tests all aspects of the Mestres Cafe Enterprise system
"""

import requests
import json
import sys
import time
from datetime import datetime

class SystemTester:
    def __init__(self):
        self.api_base = "http://localhost:5001"
        self.frontend_base = "http://localhost:3000"
        self.admin_token = None
        self.user_token = None
        self.test_product_id = "e2d1d1e9-eec7-4db4-a3c9-348d1c4be9b1"
        self.results = {
            "api": {},
            "frontend": {},
            "auth": {},
            "reviews": {},
            "admin": {},
            "errors": []
        }
    
    def log_result(self, category, test_name, status, details=""):
        """Log test result"""
        self.results[category][test_name] = {
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        status_icon = "✅" if status == "pass" else "❌" if status == "fail" else "⚠️"
        print(f"{status_icon} {category.upper()}: {test_name} - {details}")
    
    def test_api_health(self):
        """Test API server health and basic endpoints"""
        print("\n🔍 Testing API Health...")
        
        try:
            # Health check
            response = requests.get(f"{self.api_base}/api/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                self.log_result("api", "health_check", "pass", 
                               f"Service: {health_data.get('service', 'unknown')}")
            else:
                self.log_result("api", "health_check", "fail", 
                               f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("api", "health_check", "fail", str(e))
            return False
        
        # Test basic endpoints
        endpoints = [
            ("/api/reviews/test", "reviews_test"),
        ]
        
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code == 200:
                    self.log_result("api", name, "pass", f"Status: {response.status_code}")
                else:
                    self.log_result("api", name, "fail", f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("api", name, "fail", str(e))
        
        return True
    
    def test_frontend_connectivity(self):
        """Test frontend server connectivity"""
        print("\n🌐 Testing Frontend Connectivity...")
        
        try:
            response = requests.get(self.frontend_base, timeout=10)
            if response.status_code == 200:
                self.log_result("frontend", "homepage", "pass", "Frontend server responding")
            else:
                self.log_result("frontend", "homepage", "fail", f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("frontend", "homepage", "fail", str(e))
            return False
        
        return True
    
    def test_authentication(self):
        """Test authentication system"""
        print("\n🔐 Testing Authentication System...")
        
        # Test admin login
        admin_credentials = {
            "email": "admin@mestres.cafe",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_base}/api/auth/login", 
                                   json=admin_credentials, timeout=5)
            if response.status_code == 200:
                login_data = response.json()
                if login_data.get('success'):
                    self.admin_token = login_data.get('access_token')
                    user_info = login_data.get('user', {})
                    self.log_result("auth", "admin_login", "pass", 
                                   f"Admin: {user_info.get('is_admin')}")
                else:
                    self.log_result("auth", "admin_login", "fail", 
                                   login_data.get('error', 'Unknown error'))
            else:
                self.log_result("auth", "admin_login", "fail", 
                               f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("auth", "admin_login", "fail", str(e))
        
        return bool(self.admin_token)
    
    def test_review_system(self):
        """Test complete review system"""
        print("\n📝 Testing Review System...")
        
        # Test product stats
        try:
            response = requests.get(f"{self.api_base}/api/reviews/product/{self.test_product_id}/stats")
            if response.status_code == 200:
                stats_data = response.json()
                if stats_data.get('success'):
                    stats = stats_data.get('stats', {})
                    self.log_result("reviews", "product_stats", "pass", 
                                   f"Reviews: {stats.get('total_reviews')}, Avg: {stats.get('average_rating')}")
                else:
                    self.log_result("reviews", "product_stats", "fail", "No success in response")
            else:
                self.log_result("reviews", "product_stats", "fail", f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("reviews", "product_stats", "fail", str(e))
        
        # Test all review endpoints
        review_endpoints = [
            ("rating-distribution", "rating_distribution"),
            ("engagement", "engagement_metrics"),
            ("featured", "featured_reviews"),
            ("recent", "recent_reviews")
        ]
        
        for endpoint, test_name in review_endpoints:
            try:
                response = requests.get(f"{self.api_base}/api/reviews/product/{self.test_product_id}/{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_result("reviews", test_name, "pass", f"Endpoint: {endpoint}")
                    else:
                        self.log_result("reviews", test_name, "fail", "No success in response")
                else:
                    self.log_result("reviews", test_name, "fail", f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("reviews", test_name, "fail", str(e))
    
    def test_admin_functions(self):
        """Test admin-specific functions"""
        print("\n👑 Testing Admin Functions...")
        
        if not self.admin_token:
            self.log_result("admin", "no_token", "fail", "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test authenticated review access
        try:
            response = requests.get(f"{self.api_base}/api/reviews/product/{self.test_product_id}", 
                                   headers=headers)
            if response.status_code == 200:
                review_data = response.json()
                if review_data.get('success'):
                    reviews = review_data.get('reviews', [])
                    pagination = review_data.get('pagination', {})
                    self.log_result("admin", "authenticated_reviews", "pass", 
                                   f"Reviews: {len(reviews)}, Total: {pagination.get('total')}")
                else:
                    self.log_result("admin", "authenticated_reviews", "fail", "No success in response")
            else:
                self.log_result("admin", "authenticated_reviews", "fail", f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("admin", "authenticated_reviews", "fail", str(e))
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "="*60)
        print("🏆 COMPLETE SYSTEM TEST SUMMARY")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category, tests in self.results.items():
            if category == "errors":
                continue
                
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
        
        print(f"\n🎯 OVERALL RESULTS:")
        print(f"   • Total Tests: {total_tests}")
        print(f"   • Passed: {passed_tests}")
        print(f"   • Failed: {failed_tests}")
        print(f"   • Success Rate: {overall_success_rate:.1f}%")
        
        if overall_success_rate >= 90:
            print(f"\n🌟 EXCELLENT! System is performing very well!")
        elif overall_success_rate >= 75:
            print(f"\n👍 GOOD! System is mostly functional with minor issues.")
        else:
            print(f"\n⚠️  NEEDS ATTENTION! System has significant issues.")
        
        print(f"\n🔗 Access URLs:")
        print(f"   • Frontend: {self.frontend_base}")
        print(f"   • API: {self.api_base}")
        print(f"   • Product Page: {self.frontend_base}/produto/{self.test_product_id}")
        print(f"   • Admin Login: admin@mestres.cafe / admin123")
        
        return overall_success_rate >= 75
    
    def run_all_tests(self):
        """Run all system tests"""
        print("🚀 Starting Complete System Test")
        print("Testing API, Frontend, Authentication, Reviews, and Admin Functions")
        print("="*60)
        
        start_time = time.time()
        
        # Run all test categories
        self.test_api_health()
        self.test_frontend_connectivity()
        self.test_authentication()
        self.test_review_system()
        self.test_admin_functions()
        
        end_time = time.time()
        test_duration = end_time - start_time
        
        print(f"\n⏱️  Test Duration: {test_duration:.2f} seconds")
        
        return self.print_summary()

def main():
    """Main test execution"""
    tester = SystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()