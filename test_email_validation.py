#!/usr/bin/env python3
"""
Test script to verify email validation is working correctly
"""
import requests
import json

API_BASE = "http://localhost:5001"

def test_email_validation():
    """Test different email formats to ensure validation works"""
    
    print("🧪 TESTING EMAIL VALIDATION")
    print("=" * 50)
    
    test_cases = [
        # Valid emails
        ("admin@mestres.cafe", "admin123", True, "Normal valid email"),
        ("mailto:admin@mestres.cafe", "admin123", True, "Email with mailto: prefix (should be cleaned)"),
        ("  admin@mestres.cafe  ", "admin123", True, "Email with whitespace (should be cleaned)"),
        
        # Invalid emails
        ("admin:test@mestres.cafe", "admin123", False, "Email with colon in local part"),
        ("admin@", "admin123", False, "Email missing domain"),
        ("@mestres.cafe", "admin123", False, "Email missing local part"),
        ("admin@mestres", "admin123", False, "Email missing TLD"),
        ("admin.mestres.cafe", "admin123", False, "Email missing @ symbol"),
        ("", "admin123", False, "Empty email"),
        ("admin@mestres.cafe:", "admin123", False, "Email with trailing colon"),
        ("admin:@mestres.cafe", "admin123", False, "Email with colon before @"),
    ]
    
    print(f"Testing {len(test_cases)} email formats:\n")
    
    passed = 0
    failed = 0
    
    for email, password, should_succeed, description in test_cases:
        print(f"🔍 {description}")
        print(f"   Email: '{email}'")
        
        try:
            response = requests.post(f"{API_BASE}/api/auth/login", 
                                   json={"email": email, "password": password})
            
            if should_succeed:
                if response.status_code == 200:
                    print(f"   ✅ PASS: Login succeeded as expected")
                    passed += 1
                else:
                    print(f"   ❌ FAIL: Expected success but got {response.status_code}")
                    print(f"       Error: {response.json().get('error', 'Unknown error')}")
                    failed += 1
            else:
                if response.status_code != 200:
                    print(f"   ✅ PASS: Login failed as expected ({response.status_code})")
                    error_msg = response.json().get('error', 'Unknown error')
                    print(f"       Error: {error_msg}")
                    passed += 1
                else:
                    print(f"   ❌ FAIL: Expected failure but login succeeded")
                    failed += 1
                    
        except Exception as e:
            print(f"   ❌ ERROR: Request failed - {str(e)}")
            failed += 1
        
        print()
    
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"✅ Passed: {passed}/{len(test_cases)} tests")
    print(f"❌ Failed: {failed}/{len(test_cases)} tests")
    
    if failed == 0:
        print("🎉 All email validation tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above.")
    
    return failed == 0

if __name__ == "__main__":
    test_email_validation()