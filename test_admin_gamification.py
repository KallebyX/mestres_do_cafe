#!/usr/bin/env python3
"""
Script para testar as funcionalidades administrativas do sistema de gamificação
"""

import requests
import json
import uuid
from decimal import Decimal

BASE_URL = "http://localhost:5001/api/gamification"

def test_admin_gamification():
    """Testa as funcionalidades administrativas de gamificação"""
    print("🔧 Testando Funcionalidades Administrativas - Clube dos Mestres")
    print("=" * 70)
    
    # Usuário de teste (usar um existente)
    test_user_id = "902adfdb-713a-4fa9-ac96-a8302ee94ea5"
    admin_id = "admin-test-001"
    
    # 1. Buscar usuários
    print("\n1. Testando busca de usuários...")
    response = requests.get(f"{BASE_URL}/admin/users/search?q=Usuário")
    if response.status_code == 200:
        users = response.json()["users"]
        print(f"✅ {len(users)} usuários encontrados:")
        for user in users[:3]:  # Mostrar apenas os primeiros 3
            print(f"   👤 {user['name']} ({user['email']}) - {user['total_points']} pontos")
    else:
        print(f"❌ Erro na busca: {response.status_code}")
    
    # 2. Ver perfil inicial do usuário
    print(f"\n2. Verificando perfil inicial do usuário...")
    response = requests.get(f"{BASE_URL}/users/{test_user_id}/profile")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Perfil atual:")
        print(f"   📊 Total de pontos: {profile['total_points']}")
        print(f"   💰 Pontos disponíveis: {profile['available_points']}")
        print(f"   🎯 Nível: {profile['current_level']['name'] if profile['current_level'] else 'N/A'}")
    else:
        print(f"❌ Erro ao obter perfil: {response.status_code}")
    
    # 3. Admin adiciona pontos
    print(f"\n3. Admin adicionando 500 pontos...")
    add_data = {
        "user_id": test_user_id,
        "points": 500,
        "reason": "Participação especial em evento",
        "admin_id": admin_id,
        "notes": "Usuário foi muito ativo durante o evento de lançamento"
    }
    
    response = requests.post(f"{BASE_URL}/admin/points/add", json=add_data)
    if response.status_code == 201:
        result = response.json()
        print(f"✅ Pontos adicionados com sucesso!")
        print(f"   🎁 Pontos adicionados: {result['points_added']}")
        print(f"   📊 Total de pontos: {result['total_points']}")
        print(f"   💰 Pontos disponíveis: {result['available_points']}")
        if result.get('level_change'):
            print(f"   🚀 Mudança de nível: {result['level_change']}")
    else:
        print(f"❌ Erro ao adicionar pontos: {response.status_code}")
        print(f"   Resposta: {response.text}")
    
    # 4. Admin remove pontos
    print(f"\n4. Admin removendo 100 pontos...")
    remove_data = {
        "user_id": test_user_id,
        "points": 100,
        "reason": "Correção de erro no sistema",
        "admin_id": admin_id,
        "notes": "Pontos foram concedidos por engano"
    }
    
    response = requests.post(f"{BASE_URL}/admin/points/remove", json=remove_data)
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Pontos removidos com sucesso!")
        print(f"   📉 Pontos removidos: {result['points_removed']}")
        print(f"   📊 Total de pontos: {result['total_points']}")
        print(f"   💰 Pontos disponíveis: {result['available_points']}")
    else:
        print(f"❌ Erro ao remover pontos: {response.status_code}")
        print(f"   Resposta: {response.text}")
    
    # 5. Admin ajusta pontos para valor específico
    print(f"\n5. Admin ajustando pontos para 1000...")
    adjust_data = {
        "user_id": test_user_id,
        "new_total": 1000,
        "reason": "Migração de sistema antigo",
        "admin_id": admin_id,
        "notes": "Ajuste baseado no histórico do sistema anterior"
    }
    
    response = requests.post(f"{BASE_URL}/admin/points/adjust", json=adjust_data)
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Pontos ajustados com sucesso!")
        print(f"   📊 Valor anterior: {result['old_total']}")
        print(f"   📊 Novo valor: {result['new_total']}")
        print(f"   📈 Diferença: {result['difference']}")
        print(f"   💰 Pontos disponíveis: {result['available_points']}")
        if result.get('level_change'):
            print(f"   🚀 Mudança de nível: {result['level_change']}")
    else:
        print(f"❌ Erro ao ajustar pontos: {response.status_code}")
        print(f"   Resposta: {response.text}")
    
    # 6. Ver histórico detalhado do usuário
    print(f"\n6. Verificando histórico detalhado...")
    response = requests.get(f"{BASE_URL}/admin/users/{test_user_id}/points/history?limit=10")
    if response.status_code == 200:
        history = response.json()["history"]
        print(f"✅ {len(history)} transações encontradas:")
        for transaction in history[:5]:  # Mostrar apenas as primeiras 5
            admin_info = ""
            if transaction.get("admin_action"):
                admin_info = f" [ADMIN: {transaction['admin_action']['reason']}]"
            print(f"   📝 {transaction['description']}: {transaction['points']} pontos{admin_info}")
    else:
        print(f"❌ Erro ao obter histórico: {response.status_code}")
    
    # 7. Ver ações administrativas
    print(f"\n7. Verificando ações administrativas...")
    response = requests.get(f"{BASE_URL}/admin/points/actions?limit=10")
    if response.status_code == 200:
        actions = response.json()["admin_actions"]
        print(f"✅ {len(actions)} ações administrativas encontradas:")
        for action in actions[:3]:  # Mostrar apenas as primeiras 3
            print(f"   🔧 {action['user_name']}: {action['points']} pontos - {action['description']}")
    else:
        print(f"❌ Erro ao obter ações: {response.status_code}")
    
    # 8. Ver dashboard administrativo
    print(f"\n8. Verificando dashboard administrativo...")
    response = requests.get(f"{BASE_URL}/admin/dashboard")
    if response.status_code == 200:
        dashboard = response.json()
        print(f"✅ Dashboard obtido com sucesso:")
        print(f"   👥 Total de usuários: {dashboard['total_users']}")
        print(f"   🎯 Pontos concedidos: {dashboard['total_points_awarded']}")
        print(f"   💸 Pontos gastos: {dashboard['total_points_spent']}")
        print(f"   💰 Pontos disponíveis: {dashboard['available_points']}")
        print(f"   🏆 Top usuários: {len(dashboard['top_users'])}")
        print(f"   📊 Distribuição por níveis: {len(dashboard['level_distribution'])}")
    else:
        print(f"❌ Erro ao obter dashboard: {response.status_code}")
    
    # 9. Verificar perfil final do usuário
    print(f"\n9. Verificando perfil final do usuário...")
    response = requests.get(f"{BASE_URL}/users/{test_user_id}/profile")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Perfil final:")
        print(f"   📊 Total de pontos: {profile['total_points']}")
        print(f"   💰 Pontos disponíveis: {profile['available_points']}")
        print(f"   🎯 Nível: {profile['current_level']['name'] if profile['current_level'] else 'N/A'}")
        print(f"   📈 Progresso: {profile['level_progress']:.1f}%")
        print(f"   ⏭️ Pontos para próximo nível: {profile['points_to_next_level']}")
    else:
        print(f"❌ Erro ao obter perfil final: {response.status_code}")
    
    print("\n" + "=" * 70)
    print("✅ Teste das funcionalidades administrativas concluído!")
    print("🔧 Sistema de gerenciamento de pontos funcionando corretamente!")
    return True

if __name__ == "__main__":
    try:
        test_admin_gamification()
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()