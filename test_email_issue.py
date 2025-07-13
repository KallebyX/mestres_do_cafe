#!/usr/bin/env python3
"""
Test script to identify email-related issues in login
"""
import sqlite3
import json

# Check database emails
def test_database_emails():
    print("🔍 Checking database emails...")
    
    conn = sqlite3.connect('mestres_cafe.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, password, name, is_admin FROM users")
    users = cursor.fetchall()
    
    print(f"Found {len(users)} users:")
    for user in users:
        user_id, email, password, name, is_admin = user
        print(f"  ID: {user_id}")
        print(f"  Email: '{email}' (length: {len(email)})")
        print(f"  Password: '{password}' (length: {len(password)})")
        print(f"  Name: '{name}'")
        print(f"  Is Admin: {is_admin}")
        print(f"  Email contains '@': {'@' in email}")
        print(f"  Email contains ':': {':' in email}")
        print("  ---")
    
    conn.close()

# Test specific email formats
def test_email_formats():
    print("\n🧪 Testing email formats...")
    
    test_emails = [
        "admin@mestres.cafe",
        "mailto:admin@mestres.cafe",
        "admin@mestres.cafe:",
        ":admin@mestres.cafe"
    ]
    
    for email in test_emails:
        print(f"Testing: '{email}'")
        print(f"  Length: {len(email)}")
        print(f"  Contains '@': {'@' in email}")
        print(f"  Contains ':': {':' in email}")
        print(f"  Starts with 'mailto:': {email.startswith('mailto:')}")
        print(f"  Ends with ':': {email.endswith(':')}")
        print("  ---")

# Test login with different email formats
def test_login_attempts():
    print("\n🔐 Testing login attempts...")
    
    conn = sqlite3.connect('mestres_cafe.db')
    cursor = conn.cursor()
    
    test_cases = [
        ("admin@mestres.cafe", "admin123"),
        ("mailto:admin@mestres.cafe", "admin123"),
        ("admin@mestres.cafe:", "admin123"),
        (":admin@mestres.cafe", "admin123")
    ]
    
    for email, password in test_cases:
        print(f"Testing login: '{email}' / '{password}'")
        
        cursor.execute("""
            SELECT id, email, name, is_admin, is_active 
            FROM users 
            WHERE email = ? AND password = ? AND is_active = 1
        """, (email, password))
        
        user = cursor.fetchone()
        
        if user:
            print(f"  ✅ SUCCESS: Found user {user[0]} - {user[1]}")
        else:
            print(f"  ❌ FAILED: No user found")
        
        print("  ---")
    
    conn.close()

if __name__ == "__main__":
    print("🚀 EMAIL ISSUE DIAGNOSIS")
    print("=" * 50)
    
    test_database_emails()
    test_email_formats()
    test_login_attempts()
    
    print("\n💡 RECOMMENDATIONS:")
    print("1. Check if frontend is sending email with 'mailto:' prefix")
    print("2. Check if there are trailing/leading spaces in email")
    print("3. Check if email validation is too strict")
    print("4. Verify API is receiving the correct email format")