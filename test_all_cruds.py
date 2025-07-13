#!/usr/bin/env python3
"""
Complete CRUD Operations Test
Tests all Create, Read, Update, Delete operations across the system
"""

import requests
import json
import sys
import time
from datetime import datetime

class CRUDTester:
    def __init__(self):
        self.api_base = "http://localhost:5001"
        self.admin_token = None
        self.admin_user_id = None
        self.crud_results = {}
        
    def authenticate_admin(self):
        """Get admin token for authenticated requests"""
        print("🔑 Authenticating admin...")
        
        try:
            response = requests.post(f"{self.api_base}/api/auth/login", 
                                   json={"email": "admin@mestres.cafe", "password": "admin123"})
            
            if response.status_code == 200:
                login_data = response.json()
                if login_data.get('success'):
                    self.admin_token = login_data.get('access_token')
                    self.admin_user_id = login_data.get('user', {}).get('id')
                    print(f"✅ Admin authenticated successfully")
                    return True
        except Exception as e:
            print(f"❌ Admin authentication failed: {e}")
        
        return False
    
    def test_crud_operation(self, entity_name, endpoints, test_data, auth_required=True):
        """Test CRUD operations for a specific entity"""
        print(f"\n📋 Testing {entity_name} CRUD Operations...")
        
        headers = {}
        if auth_required and self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        results = {"create": False, "read": False, "update": False, "delete": False}
        created_id = None
        
        # TEST CREATE
        if endpoints.get('create'):
            try:
                print(f"  ➕ Testing CREATE {entity_name}...")
                response = requests.post(f"{self.api_base}{endpoints['create']}", 
                                       json=test_data['create'], 
                                       headers=headers)
                
                if response.status_code in [200, 201]:
                    response_data = response.json()
                    
                    # Different APIs return created entity differently
                    if response_data.get('success'):
                        if entity_name.lower() in response_data:
                            created_item = response_data[entity_name.lower()]
                            created_id = created_item.get('id')
                        elif 'category' in response_data:
                            created_id = response_data['category'].get('id')
                        elif 'data' in response_data:
                            created_id = response_data['data'].get('id')
                        elif 'id' in response_data:
                            created_id = response_data['id']
                    else:
                        # Some APIs return data directly
                        created_id = response_data.get('id')
                    
                    results["create"] = True
                    print(f"    ✅ CREATE: Success (ID: {created_id})")
                else:
                    print(f"    ❌ CREATE: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ CREATE: Error - {str(e)[:50]}...")
        
        # TEST READ (List)
        if endpoints.get('read'):
            try:
                print(f"  📖 Testing READ {entity_name}...")
                response = requests.get(f"{self.api_base}{endpoints['read']}", 
                                      headers=headers)
                
                if response.status_code == 200:
                    response_data = response.json()
                    
                    # Count items in different response formats
                    item_count = 0
                    if isinstance(response_data, dict):
                        if response_data.get('success') and entity_name.lower() + 's' in response_data:
                            item_count = len(response_data[entity_name.lower() + 's'])
                        elif entity_name.lower() + 's' in response_data:
                            item_count = len(response_data[entity_name.lower() + 's'])
                        elif 'categories' in response_data:
                            item_count = len(response_data['categories'])
                        elif 'employees' in response_data:
                            item_count = len(response_data['employees'])
                        elif 'subscribers' in response_data:
                            item_count = len(response_data['subscribers'])
                        elif 'suppliers' in response_data:
                            item_count = len(response_data['suppliers'])
                        elif 'files' in response_data:
                            item_count = len(response_data['files'])
                        elif 'stock' in response_data:
                            item_count = len(response_data['stock'])
                    elif isinstance(response_data, list):
                        item_count = len(response_data)
                    
                    results["read"] = True
                    print(f"    ✅ READ: Success ({item_count} items)")
                else:
                    print(f"    ❌ READ: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ READ: Error - {str(e)[:50]}...")
        
        # TEST UPDATE (if we have created_id)
        if endpoints.get('update') and created_id and test_data.get('update'):
            try:
                print(f"  ✏️ Testing UPDATE {entity_name}...")
                update_endpoint = endpoints['update'].replace('{id}', str(created_id))
                response = requests.put(f"{self.api_base}{update_endpoint}", 
                                      json=test_data['update'], 
                                      headers=headers)
                
                if response.status_code in [200, 204]:
                    results["update"] = True
                    print(f"    ✅ UPDATE: Success")
                else:
                    print(f"    ❌ UPDATE: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ UPDATE: Error - {str(e)[:50]}...")
        
        # TEST DELETE (if we have created_id)
        if endpoints.get('delete') and created_id:
            try:
                print(f"  🗑️ Testing DELETE {entity_name}...")
                delete_endpoint = endpoints['delete'].replace('{id}', str(created_id))
                response = requests.delete(f"{self.api_base}{delete_endpoint}", 
                                         headers=headers)
                
                if response.status_code in [200, 204]:
                    results["delete"] = True
                    print(f"    ✅ DELETE: Success")
                else:
                    print(f"    ❌ DELETE: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ DELETE: Error - {str(e)[:50]}...")
        
        # Calculate success rate
        available_operations = len([op for op in endpoints.values() if op])
        successful_operations = sum(results.values())
        success_rate = (successful_operations / available_operations * 100) if available_operations > 0 else 0
        
        print(f"  📊 {entity_name} CRUD Success: {success_rate:.1f}% ({successful_operations}/{available_operations})")
        
        self.crud_results[entity_name] = {
            "results": results,
            "success_rate": success_rate,
            "created_id": created_id
        }
        
        return results
    
    def test_all_cruds(self):
        """Test CRUD operations for all major entities"""
        print("🧪 TESTING ALL CRUD OPERATIONS")
        print("="*60)
        
        if not self.authenticate_admin():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Define CRUD tests for different entities
        crud_tests = [
            {
                "name": "Blog Category",
                "endpoints": {
                    "create": "/api/blog/categories",
                    "read": "/api/blog/categories",
                    "update": "/api/blog/categories/{id}",
                    "delete": "/api/blog/categories/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "CRUD Test Category",
                        "description": "Category created for CRUD testing"
                    },
                    "update": {
                        "name": "Updated CRUD Category",
                        "description": "Updated description for CRUD test"
                    }
                }
            },
            {
                "name": "Newsletter Template",
                "endpoints": {
                    "create": "/api/newsletter/templates",
                    "read": "/api/newsletter/templates",
                    "update": "/api/newsletter/templates/{id}",
                    "delete": "/api/newsletter/templates/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "CRUD Test Template",
                        "subject": "Test Newsletter",
                        "content": "This is a test newsletter template"
                    },
                    "update": {
                        "name": "Updated Test Template",
                        "subject": "Updated Newsletter",
                        "content": "This is an updated test template"
                    }
                }
            },
            {
                "name": "HR Employee",
                "endpoints": {
                    "create": "/api/hr/employees",
                    "read": "/api/hr/employees",
                    "update": "/api/hr/employees/{id}",
                    "delete": "/api/hr/employees/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "Test Employee",
                        "email": "test.employee@mestres.cafe",
                        "department": "Technology",
                        "position": "Developer"
                    },
                    "update": {
                        "name": "Updated Test Employee",
                        "department": "IT",
                        "position": "Senior Developer"
                    }
                }
            },
            {
                "name": "Supplier",
                "endpoints": {
                    "create": "/api/suppliers",
                    "read": "/api/suppliers",
                    "update": "/api/suppliers/{id}",
                    "delete": "/api/suppliers/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "Test Supplier",
                        "email": "test@supplier.com",
                        "phone": "+55 11 99999-9999",
                        "address": "Test Address 123"
                    },
                    "update": {
                        "name": "Updated Test Supplier",
                        "phone": "+55 11 88888-8888",
                        "address": "Updated Address 456"
                    }
                }
            },
            {
                "name": "Customer",
                "endpoints": {
                    "create": "/api/customers",
                    "read": "/api/customers",
                    "update": "/api/customers/{id}",
                    "delete": "/api/customers/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "Test Customer",
                        "email": "test.customer@example.com",
                        "phone": "+55 11 77777-7777",
                        "customer_type": "PF"
                    },
                    "update": {
                        "name": "Updated Test Customer",
                        "phone": "+55 11 66666-6666"
                    }
                }
            },
            {
                "name": "Lead",
                "endpoints": {
                    "create": "/api/leads",
                    "read": "/api/leads",
                    "update": "/api/leads/{id}",
                    "delete": "/api/leads/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "Test Lead",
                        "email": "test.lead@example.com",
                        "phone": "+55 11 55555-5555",
                        "source": "Website"
                    },
                    "update": {
                        "name": "Updated Test Lead",
                        "status": "qualified"
                    }
                }
            },
            {
                "name": "Financial Account",
                "endpoints": {
                    "create": "/api/financial/accounts",
                    "read": "/api/financial/accounts",
                    "update": "/api/financial/accounts/{id}",
                    "delete": "/api/financial/accounts/{id}"
                },
                "test_data": {
                    "create": {
                        "name": "Test Account",
                        "account_type": "checking",
                        "balance": 1000.00,
                        "currency": "BRL"
                    },
                    "update": {
                        "name": "Updated Test Account",
                        "balance": 1500.00
                    }
                }
            },
            {
                "name": "Review",
                "endpoints": {
                    "create": "/api/reviews/add",
                    "read": "/api/reviews",
                    "update": None,  # Reviews typically don't have update
                    "delete": None   # Reviews typically don't have delete for users
                },
                "test_data": {
                    "create": {
                        "product_id": "e2d1d1e9-eec7-4db4-a3c9-348d1c4be9b1",
                        "rating": 5,
                        "title": "CRUD Test Review",
                        "comment": "This is a test review for CRUD testing",
                        "user_name": "Test User"
                    }
                }
            }
        ]
        
        # Test each entity's CRUD operations
        for test_config in crud_tests:
            self.test_crud_operation(
                test_config["name"],
                test_config["endpoints"],
                test_config["test_data"]
            )
            time.sleep(0.5)  # Small delay between tests
        
        # Print summary
        self.print_crud_summary()
        
        return True
    
    def print_crud_summary(self):
        """Print comprehensive CRUD summary"""
        print("\n" + "="*60)
        print("📋 CRUD OPERATIONS SUMMARY")
        print("="*60)
        
        total_entities = len(self.crud_results)
        total_success = 0
        
        for entity_name, results in self.crud_results.items():
            success_rate = results["success_rate"]
            crud_results = results["results"]
            
            print(f"\n{entity_name}:")
            for operation, success in crud_results.items():
                icon = "✅" if success else "❌"
                print(f"  {icon} {operation.upper()}")
            
            print(f"  📊 Success Rate: {success_rate:.1f}%")
            total_success += success_rate
        
        overall_success = total_success / total_entities if total_entities > 0 else 0
        
        print(f"\n🎯 OVERALL CRUD RESULTS:")
        print(f"   • Entities Tested: {total_entities}")
        print(f"   • Average Success Rate: {overall_success:.1f}%")
        
        if overall_success >= 90:
            status = "🌟 EXCELLENT"
            message = "All CRUD operations are working excellently!"
        elif overall_success >= 75:
            status = "✅ GOOD"
            message = "Most CRUD operations are functional."
        elif overall_success >= 50:
            status = "⚠️ PARTIAL"
            message = "Some CRUD operations need attention."
        else:
            status = "❌ NEEDS WORK"
            message = "CRUD operations have significant issues."
        
        print(f"\n{status}: {message}")
        
        # Detailed operation breakdown
        operations_summary = {"create": 0, "read": 0, "update": 0, "delete": 0}
        operations_total = {"create": 0, "read": 0, "update": 0, "delete": 0}
        
        for entity_name, results in self.crud_results.items():
            crud_results = results["results"]
            for operation, success in crud_results.items():
                operations_total[operation] += 1
                if success:
                    operations_summary[operation] += 1
        
        print(f"\n📊 Operations Breakdown:")
        for operation, success_count in operations_summary.items():
            total_count = operations_total[operation]
            if total_count > 0:
                percentage = (success_count / total_count) * 100
                print(f"   • {operation.upper()}: {percentage:.1f}% ({success_count}/{total_count})")
        
        return overall_success >= 75

def main():
    """Main test execution"""
    tester = CRUDTester()
    success = tester.test_all_cruds()
    
    print(f"\n{'🎉 CRUD TESTS COMPLETED!' if success else '⚠️ CRUD TESTS NEED REVIEW'}")
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()