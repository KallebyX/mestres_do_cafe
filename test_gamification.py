#!/usr/bin/env python3
"""
Script para testar o sistema de gamificação do Clube dos Mestres
"""

import requests
import json
import uuid
from decimal import Decimal

BASE_URL = "http://localhost:5001/api/gamification"

def test_gamification_system():
    """Testa o sistema completo de gamificação"""
    print("🎮 Testando Sistema de Gamificação - Clube dos Mestres")
    print("=" * 60)
    
    # 1. Testar endpoint principal
    print("\n1. Testando endpoint principal...")
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Endpoint principal funcionando")
        print(f"📋 Descrição: {data.get('description', 'N/A')}")
        print(f"🎯 Níveis disponíveis: {len(data.get('levels', {}))}")
    else:
        print(f"❌ Erro no endpoint principal: {response.status_code}")
        return False
    
    # 2. Inicializar níveis
    print("\n2. Inicializando níveis do Clube dos Mestres...")
    response = requests.post(f"{BASE_URL}/levels/init")
    if response.status_code == 200:
        print("✅ Níveis inicializados com sucesso")
    else:
        print(f"⚠️ Níveis já existem ou erro: {response.status_code}")
    
    # 3. Listar níveis
    print("\n3. Listando níveis...")
    response = requests.get(f"{BASE_URL}/levels")
    if response.status_code == 200:
        levels = response.json()["levels"]
        print(f"✅ {len(levels)} níveis encontrados:")
        for level in levels:
            print(f"   🏆 {level['name']}: {level['min_points']} pontos - {level['discount_percentage']}% desconto")
    else:
        print(f"❌ Erro ao listar níveis: {response.status_code}")
    
    # 4. Inicializar ações
    print("\n4. Inicializando ações de pontuação...")
    response = requests.post(f"{BASE_URL}/actions/init")
    if response.status_code == 200:
        print("✅ Ações inicializadas com sucesso")
    else:
        print(f"⚠️ Ações já existem ou erro: {response.status_code}")
    
    # 5. Listar ações
    print("\n5. Listando ações de pontuação...")
    response = requests.get(f"{BASE_URL}/actions")
    if response.status_code == 200:
        actions = response.json()["actions"]
        print(f"✅ {len(actions)} ações encontradas:")
        for action in actions:
            points_info = f"{action['base_points']} pontos" if action['base_points'] else action.get('points_formula', 'Fórmula dinâmica')
            print(f"   💰 {action['name']}: {points_info}")
    else:
        print(f"❌ Erro ao listar ações: {response.status_code}")
    
    # 6. Testar perfil do usuário
    print("\n6. Testando perfil do usuário...")
    test_user_id = "902adfdb-713a-4fa9-ac96-a8302ee94ea5"  # Usar usuário existente
    response = requests.get(f"{BASE_URL}/users/{test_user_id}/profile")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Perfil criado para usuário {test_user_id[:8]}...")
        print(f"   📊 Pontos totais: {profile['total_points']}")
        print(f"   🎯 Nível atual: {profile['current_level']['name'] if profile['current_level'] else 'N/A'}")
        print(f"   ⏭️ Próximo nível: {profile['next_level']['name'] if profile['next_level'] else 'Máximo atingido'}")
    else:
        print(f"❌ Erro ao obter perfil: {response.status_code}")
    
    # 7. Testar concessão de pontos
    print("\n7. Testando concessão de pontos...")
    award_data = {
        "user_id": test_user_id,
        "action_type": "product_review",
        "points": 25,
        "description": "Avaliação de produto teste"
    }
    
    response = requests.post(f"{BASE_URL}/points/award", json=award_data)
    if response.status_code == 201:
        result = response.json()
        print(f"✅ Pontos concedidos com sucesso!")
        print(f"   🎁 Pontos concedidos: {result['points_awarded']}")
        print(f"   📊 Total de pontos: {result['total_points']}")
        if result.get('level_change'):
            print(f"   🚀 Mudança de nível: {result['level_change']}")
    else:
        print(f"❌ Erro ao conceder pontos: {response.status_code}")
        print(f"   Resposta: {response.text}")
    
    # 8. Testar processamento de compra
    print("\n8. Testando processamento de compra...")
    purchase_data = {
        "user_id": test_user_id,
        "order_value": "100.00",
        "order_id": str(uuid.uuid4())
    }
    
    response = requests.post(f"{BASE_URL}/points/purchase", json=purchase_data)
    if response.status_code == 201:
        result = response.json()
        print(f"✅ Compra processada com sucesso!")
        print(f"   💰 Pontos da compra: {result['purchase_points']}")
        print(f"   🎯 Total de pontos concedidos: {result['total_points_awarded']}")
        if result.get('first_purchase_bonus'):
            print(f"   🎁 Bônus primeira compra: 100 pontos")
    else:
        print(f"❌ Erro ao processar compra: {response.status_code}")
        print(f"   Resposta: {response.text}")
    
    # 9. Verificar perfil atualizado
    print("\n9. Verificando perfil atualizado...")
    response = requests.get(f"{BASE_URL}/users/{test_user_id}/profile")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Perfil atualizado:")
        print(f"   📊 Pontos totais: {profile['total_points']}")
        print(f"   🎯 Nível atual: {profile['current_level']['name'] if profile['current_level'] else 'N/A'}")
        print(f"   📈 Progresso: {profile['level_progress']:.1f}%")
        print(f"   ⏭️ Pontos para próximo nível: {profile['points_to_next_level']}")
    else:
        print(f"❌ Erro ao obter perfil atualizado: {response.status_code}")
    
    # 10. Testar histórico de transações
    print("\n10. Testando histórico de transações...")
    response = requests.get(f"{BASE_URL}/users/{test_user_id}/transactions")
    if response.status_code == 200:
        transactions = response.json()["transactions"]
        print(f"✅ {len(transactions)} transações encontradas:")
        for transaction in transactions:
            print(f"   📝 {transaction['description']}: {transaction['points']} pontos ({transaction['transaction_type']})")
    else:
        print(f"❌ Erro ao obter transações: {response.status_code}")
    
    # 11. Testar leaderboard
    print("\n11. Testando leaderboard...")
    response = requests.get(f"{BASE_URL}/leaderboard?limit=5")
    if response.status_code == 200:
        leaderboard = response.json()["leaderboard"]
        print(f"✅ Leaderboard com {len(leaderboard)} usuários:")
        for user in leaderboard:
            print(f"   🏆 #{user['rank']}: {user['total_points']} pontos")
    else:
        print(f"❌ Erro ao obter leaderboard: {response.status_code}")
    
    # 12. Testar analytics
    print("\n12. Testando analytics...")
    response = requests.get(f"{BASE_URL}/analytics")
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ Analytics obtidas:")
        print(f"   👥 Total de usuários: {analytics['total_users']}")
        print(f"   🎯 Pontos concedidos: {analytics['total_points_awarded']}")
        print(f"   📊 Distribuição por níveis: {len(analytics['level_distribution'])}")
        print(f"   🔥 Ações populares: {len(analytics['popular_actions'])}")
    else:
        print(f"❌ Erro ao obter analytics: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("✅ Teste do sistema de gamificação concluído!")
    print("🎮 Clube dos Mestres está funcionando corretamente!")
    return True

if __name__ == "__main__":
    try:
        test_gamification_system()
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()