#!/usr/bin/env python3
"""
Script para inserir dados de exemplo no banco Neon
"""
import os
import sys
import requests
import json

def insert_sample_data():
    """Inserir dados de exemplo via API"""
    
    # URL da API
    api_url = "https://mestres-cafe-api.onrender.com/api"
    
    # Dados de exemplo
    sample_products = [
        {
            "name": "Café Especial Bourbon",
            "price": 28.90,
            "description": "Café especial com notas de chocolate e caramelo",
            "category": "Especiais",
            "weight": "250g",
            "origin": "Minas Gerais",
            "roast_level": "Médio"
        },
        {
            "name": "Café Premium Arábica",
            "price": 32.50,
            "description": "Café premium com sabor suave e aroma intenso",
            "category": "Premium",
            "weight": "500g",
            "origin": "São Paulo",
            "roast_level": "Escuro"
        },
        {
            "name": "Café Gourmet Blend",
            "price": 24.90,
            "description": "Blend especial de cafés selecionados",
            "category": "Gourmet",
            "weight": "250g",
            "origin": "Bahia",
            "roast_level": "Claro"
        }
    ]
    
    print("🚀 Inserindo dados de exemplo...")
    
    # Tentar inserir produtos (se o endpoint existir)
    for product in sample_products:
        try:
            response = requests.post(
                f"{api_url}/products",
                json=product,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 201:
                print(f"✅ Produto '{product['name']}' inserido com sucesso")
            else:
                print(f"⚠️ Erro ao inserir '{product['name']}': {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de conexão: {e}")
    
    # Verificar se os dados foram inseridos
    try:
        response = requests.get(f"{api_url}/products", timeout=30)
        if response.status_code == 200:
            data = response.json()
            total_products = data.get('pagination', {}).get('total', 0)
            print(f"📊 Total de produtos no banco: {total_products}")
            
            if total_products > 0:
                print("✅ Dados inseridos com sucesso!")
                return True
            else:
                print("⚠️ Nenhum produto encontrado no banco")
                return False
        else:
            print(f"❌ Erro ao verificar produtos: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao verificar produtos: {e}")
        return False

if __name__ == "__main__":
    success = insert_sample_data()
    sys.exit(0 if success else 1)
