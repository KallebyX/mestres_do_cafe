#!/usr/bin/env python3
"""
Script para testar fluxo completo do admin e identificar problemas
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001/api"

def test_admin_flow():
    """Testa o fluxo completo do admin"""
    print("🔍 Testando fluxo completo do admin...")
    
    # Headers com CORS
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000"
    }
    
    # 1. Testar login admin
    print("\n1. 🔐 Testando login admin...")
    login_data = {
        "email": "admin@mestrescafe.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            login_result = response.json()
            print(f"   Login: ✅ Sucesso")
            token = login_result.get('access_token')
            print(f"   Token: {token[:50]}...")
        else:
            print(f"   Login: ❌ Falhou - {response.text}")
            return False
            
    except Exception as e:
        print(f"   Login: ❌ Erro - {e}")
        return False
    
    # 2. Testar dashboard admin
    print("\n2. 📊 Testando dashboard admin...")
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/admin/dashboard", headers=auth_headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            dashboard_data = response.json()
            print(f"   Dashboard: ✅ Sucesso")
            print(f"   Dados: {list(dashboard_data.get('data', {}).keys())}")
        else:
            print(f"   Dashboard: ❌ Falhou - {response.text}")
            return False
            
    except Exception as e:
        print(f"   Dashboard: ❌ Erro - {e}")
        return False
    
    # 3. Testar outros endpoints admin
    admin_endpoints = [
        "/admin/orders",
        "/admin/customers", 
        "/admin/stats"
    ]
    
    print("\n3. 🔗 Testando endpoints admin...")
    for endpoint in admin_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=auth_headers)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"   {endpoint}: {status} ({response.status_code})")
            
            if response.status_code != 200:
                print(f"      Erro: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   {endpoint}: ❌ Erro - {e}")
    
    print("\n🎉 Teste completo do admin finalizado!")
    return True

if __name__ == "__main__":
    success = test_admin_flow()
    sys.exit(0 if success else 1)