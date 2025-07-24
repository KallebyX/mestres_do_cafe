#!/usr/bin/env python3
"""
Backend Health Tests for Mestres do Café API
Tests all endpoints of minimal_server.py to ensure system health
"""

import json
import sys
import subprocess
import time
import requests
from threading import Thread
from http.server import HTTPServer
import signal
import os

def start_test_server():
    """Start the minimal server for testing"""
    # Set environment variables for testing
    os.environ['PORT'] = '5002'  # Use different port for testing
    os.environ['HOST'] = '127.0.0.1'
    
    # Import and start the server in a separate thread
    try:
        from minimal_server import HTTPServer, APIHandler
        server = HTTPServer(('127.0.0.1', 5002), APIHandler)
        
        def run_server():
            server.serve_forever()
        
        thread = Thread(target=run_server, daemon=True)
        thread.start()
        
        # Give server time to start
        time.sleep(2)
        return server
    except Exception as e:
        print(f"❌ Failed to start test server: {e}")
        return None

def test_endpoint(url, method='GET', data=None, expected_status=200):
    """Test a single endpoint"""
    try:
        headers = {'Content-Type': 'application/json'} if data else {}
        
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=5)
        else:
            return False, f"Unsupported method: {method}"
        
        if response.status_code == expected_status:
            try:
                json_data = response.json()
                return True, json_data
            except:
                return True, response.text
        else:
            return False, f"Expected {expected_status}, got {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {e}"

def run_health_tests():
    """Run comprehensive health tests"""
    base_url = 'http://127.0.0.1:5002'
    
    print("🧪 Mestres do Café - Backend Health Tests")
    print("=" * 50)
    
    tests = [
        {
            'name': 'Health Check',
            'url': f'{base_url}/api/health',
            'method': 'GET',
            'expected_keys': ['status', 'service', 'version']
        },
        {
            'name': 'API Info',
            'url': f'{base_url}/api/info',
            'method': 'GET', 
            'expected_keys': ['name', 'version', 'endpoints']
        },
        {
            'name': 'Products List',
            'url': f'{base_url}/api/products',
            'method': 'GET',
            'expected_keys': ['success', 'data', 'total']
        },
        {
            'name': 'Testimonials',
            'url': f'{base_url}/api/testimonials',
            'method': 'GET',
            'expected_status': 200
        },
        {
            'name': 'Courses',
            'url': f'{base_url}/api/courses',
            'method': 'GET',
            'expected_status': 200
        },
        {
            'name': 'Cart',
            'url': f'{base_url}/api/cart',
            'method': 'GET',
            'expected_keys': ['success', 'data']
        },
        {
            'name': 'Auth Login',
            'url': f'{base_url}/api/auth/login',
            'method': 'POST',
            'data': {'email': 'test@test.com', 'password': 'test123'},
            'expected_keys': ['success', 'data']
        },
        {
            'name': 'Invalid Endpoint (404)',
            'url': f'{base_url}/api/nonexistent',
            'method': 'GET',
            'expected_status': 404
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        print(f"🔍 Testing: {test['name']}")
        
        expected_status = test.get('expected_status', 200)
        success, result = test_endpoint(
            test['url'], 
            test['method'], 
            test.get('data'),
            expected_status
        )
        
        if success:
            # Additional validation for expected keys
            if 'expected_keys' in test and isinstance(result, dict):
                missing_keys = [key for key in test['expected_keys'] if key not in result]
                if missing_keys:
                    print(f"  ❌ Missing keys: {missing_keys}")
                    failed += 1
                    continue
                    
            print(f"  ✅ PASS - {test['name']}")
            passed += 1
        else:
            print(f"  ❌ FAIL - {test['name']}: {result}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results:")
    print(f"  ✅ Passed: {passed}")
    print(f"  ❌ Failed: {failed}")
    print(f"  📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 All tests passed! Backend is healthy.")
        return True
    else:
        print(f"\n⚠️  {failed} tests failed. Check backend configuration.")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Mestres do Café Backend Health Tests")
    
    # Try to start server or connect to existing one
    server = start_test_server()
    
    # Wait a bit more for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(3)
    
    try:
        # Run the tests
        success = run_health_tests()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n👋 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {e}")
        sys.exit(1)
    finally:
        # Clean up server if we started it
        if server:
            try:
                server.shutdown()
            except:
                pass

if __name__ == '__main__':
    main()