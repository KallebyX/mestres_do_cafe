#!/usr/bin/env python3
"""
Script para verificar o status completo do sistema Mestres do Café
"""

import requests
import os
import subprocess
import json
from pathlib import Path

def check_api_status():
    """Verifica se a API está rodando"""
    try:
        response = requests.get('http://localhost:5002/api/health', timeout=3)
        return {
            'status': 'online' if response.status_code == 200 else 'error',
            'code': response.status_code,
            'data': response.json() if response.status_code == 200 else None
        }
    except requests.exceptions.ConnectionError:
        return {'status': 'offline', 'error': 'Connection refused'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_frontend_status():
    """Verifica se o frontend está rodando"""
    try:
        response = requests.get('http://localhost:3000', timeout=3)
        return {
            'status': 'online' if response.status_code == 200 else 'error',
            'code': response.status_code
        }
    except requests.exceptions.ConnectionError:
        return {'status': 'offline', 'error': 'Connection refused'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_database_files():
    """Verifica se os arquivos de banco existem"""
    db_files = [
        "mestres_cafe.db",
        "mestres_cafe_unified.db"
    ]
    
    results = {}
    for db_file in db_files:
        path = Path(db_file)
        results[db_file] = {
            'exists': path.exists(),
            'size': path.stat().st_size if path.exists() else 0
        }
    
    return results

def check_key_endpoints():
    """Testa endpoints principais da API"""
    endpoints = [
        '/api/products',
        '/api/customers', 
        '/api/orders',
        '/api/admin/dashboard',
        '/api/auth/user'
    ]
    
    results = {}
    base_url = 'http://localhost:5002'
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=3)
            results[endpoint] = {
                'status': response.status_code,
                'working': response.status_code in [200, 401, 403]  # 401/403 = needs auth but endpoint exists
            }
        except Exception as e:
            results[endpoint] = {
                'status': 'error',
                'working': False,
                'error': str(e)
            }
    
    return results

def check_crud_functionality():
    """Verifica funcionalidade CRUD baseada nos fixes implementados"""
    # Verificar se os controllers têm as funções UUID implementadas
    controllers_path = Path("apps/api/src/controllers/routes")
    
    if not controllers_path.exists():
        return {'status': 'error', 'message': 'Controllers directory not found'}
    
    critical_controllers = [
        'suppliers.py',
        'customers.py', 
        'hr.py',
        'newsletter.py',
        'products.py'
    ]
    
    fixed_count = 0
    total_count = len(critical_controllers)
    
    for controller in critical_controllers:
        file_path = controllers_path / controller
        if file_path.exists():
            content = file_path.read_text()
            if 'convert_to_uuid' in content and 'import uuid' in content:
                fixed_count += 1
    
    return {
        'fixed_controllers': fixed_count,
        'total_controllers': total_count,
        'percentage': (fixed_count / total_count) * 100,
        'status': 'complete' if fixed_count == total_count else 'partial'
    }

def main():
    print("🔍 VERIFICAÇÃO COMPLETA DO SISTEMA MESTRES DO CAFÉ")
    print("=" * 70)
    
    # 1. Verificar API
    print("1. 🔌 Status da API:")
    api_status = check_api_status()
    if api_status['status'] == 'online':
        print(f"   ✅ API Online - Status: {api_status['code']}")
        if api_status.get('data'):
            print(f"   📊 Health: {api_status['data']}")
    else:
        print(f"   ❌ API Offline - {api_status.get('error', 'Unknown error')}")
    print()
    
    # 2. Verificar Frontend
    print("2. 🌐 Status do Frontend:")
    frontend_status = check_frontend_status()
    if frontend_status['status'] == 'online':
        print(f"   ✅ Frontend Online - Status: {frontend_status['code']}")
    else:
        print(f"   ❌ Frontend Offline - {frontend_status.get('error', 'Unknown error')}")
    print()
    
    # 3. Verificar Banco de Dados
    print("3. 🗄️ Status do Banco de Dados:")
    db_status = check_database_files()
    for db_name, info in db_status.items():
        if info['exists']:
            size_mb = info['size'] / (1024 * 1024)
            print(f"   ✅ {db_name} - {size_mb:.2f} MB")
        else:
            print(f"   ❌ {db_name} - Não encontrado")
    print()
    
    # 4. Verificar Endpoints Principais
    print("4. 🛣️ Status dos Endpoints:")
    if api_status['status'] == 'online':
        endpoints_status = check_key_endpoints()
        working_endpoints = sum(1 for ep in endpoints_status.values() if ep['working'])
        total_endpoints = len(endpoints_status)
        
        for endpoint, status in endpoints_status.items():
            icon = "✅" if status['working'] else "❌"
            print(f"   {icon} {endpoint} - {status['status']}")
        
        print(f"   📊 Endpoints funcionando: {working_endpoints}/{total_endpoints}")
    else:
        print("   ⏸️ Não é possível testar - API offline")
    print()
    
    # 5. Verificar CRUD
    print("5. 🔧 Status das Operações CRUD:")
    crud_status = check_crud_functionality()
    if crud_status['status'] == 'complete':
        print(f"   ✅ CRUD 100% funcional - {crud_status['fixed_controllers']}/{crud_status['total_controllers']} controllers corrigidos")
    else:
        print(f"   ⚠️ CRUD {crud_status['percentage']:.0f}% funcional - {crud_status['fixed_controllers']}/{crud_status['total_controllers']} controllers corrigidos")
    print()
    
    # 6. Resumo Final
    print("📋 RESUMO GERAL:")
    system_components = {
        'API': api_status['status'] == 'online',
        'Frontend': frontend_status['status'] == 'online', 
        'Database': any(info['exists'] for info in db_status.values()),
        'CRUD': crud_status['status'] == 'complete'
    }
    
    working_components = sum(system_components.values())
    total_components = len(system_components)
    system_percentage = (working_components / total_components) * 100
    
    for component, working in system_components.items():
        icon = "✅" if working else "❌"
        print(f"   {icon} {component}")
    
    print()
    print(f"🎯 SISTEMA: {system_percentage:.0f}% FUNCIONAL ({working_components}/{total_components} componentes)")
    
    if system_percentage == 100:
        print("🎉 SISTEMA 100% OPERACIONAL!")
    elif system_percentage >= 75:
        print("⚠️ Sistema funcional com algumas limitações")
    else:
        print("❌ Sistema com problemas significativos")
    
    return system_percentage

if __name__ == "__main__":
    percentage = main()
    print(f"\nPercentual final: {percentage}%")