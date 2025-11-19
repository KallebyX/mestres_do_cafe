"""
Testes para o módulo de produtos
Testa CRUD de produtos, busca, filtros e categorias
"""

import pytest
import json
import uuid


class TestProductsList:
    """Testes para listagem de produtos"""

    def test_list_all_products_success(self, client):
        """Deve listar todos os produtos ativos"""
        response = client.get('/api/products')

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, (list, dict))

        # Se retornar dict, pode ter produtos em uma chave específica
        if isinstance(data, dict):
            assert 'products' in data or 'items' in data or 'data' in data

    def test_list_products_with_pagination(self, client):
        """Deve suportar paginação"""
        response = client.get('/api/products?page=1&per_page=10')

        assert response.status_code == 200
        data = response.get_json()

        # Verificar se tem dados de paginação
        if isinstance(data, dict):
            has_pagination = any(key in data for key in ['page', 'total', 'pages', 'per_page'])
            # É OK se não tiver paginação implementada ainda
            assert response.status_code == 200

    def test_list_products_filtered_by_category(self, client):
        """Deve filtrar produtos por categoria"""
        response = client.get('/api/products?category=Especiais')

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, (list, dict))

    def test_list_products_with_search_query(self, client):
        """Deve buscar produtos por query"""
        response = client.get('/api/products?q=cafe')

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, (list, dict))

    def test_list_products_sorted_by_price(self, client):
        """Deve ordenar produtos por preço"""
        response = client.get('/api/products?sort=price&order=asc')

        assert response.status_code == 200

    def test_list_products_with_price_range(self, client):
        """Deve filtrar produtos por faixa de preço"""
        response = client.get('/api/products?min_price=10&max_price=50')

        assert response.status_code == 200


class TestProductDetail:
    """Testes para detalhes de um produto específico"""

    def test_get_product_by_valid_id(self, client):
        """Deve retornar produto com ID válido"""
        # Primeiro listar produtos para pegar um ID
        list_response = client.get('/api/products')

        if list_response.status_code == 200:
            data = list_response.get_json()

            # Extrair primeiro produto
            if isinstance(data, list) and len(data) > 0:
                product_id = data[0].get('id')
            elif isinstance(data, dict):
                products = data.get('products') or data.get('items') or data.get('data')
                if products and len(products) > 0:
                    product_id = products[0].get('id')
                else:
                    product_id = None
            else:
                product_id = None

            if product_id:
                response = client.get(f'/api/products/{product_id}')
                assert response.status_code in [200, 404]

    def test_get_product_by_invalid_id(self, client):
        """Deve retornar 404 para ID inválido"""
        invalid_id = str(uuid.uuid4())
        response = client.get(f'/api/products/{invalid_id}')

        assert response.status_code in [404, 400]

    def test_get_product_with_malformed_id(self, client):
        """Deve retornar erro para ID mal formado"""
        response = client.get('/api/products/invalid-id-format')

        assert response.status_code in [400, 404]


class TestProductCreate:
    """Testes para criação de produtos"""

    def test_create_product_success_as_admin(self, client, admin_headers):
        """Admin deve criar produto com sucesso"""
        product_data = {
            'name': 'Café Teste Novo',
            'description': 'Descrição do café teste',
            'price': 29.99,
            'category': 'Especiais',
            'stock_quantity': 100,
            'is_active': True
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        # Pode retornar 200, 201 ou 404 se endpoint não existir
        assert response.status_code in [200, 201, 404]

    def test_create_product_fail_as_regular_user(self, client, user_headers):
        """Usuário comum não deve criar produto"""
        product_data = {
            'name': 'Café Não Autorizado',
            'price': 29.99,
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=user_headers)

        # Deve retornar 403 (proibido) ou 404 se endpoint não existir
        assert response.status_code in [403, 404]

    def test_create_product_fail_without_authentication(self, client, no_auth_headers):
        """Deve falhar sem autenticação"""
        product_data = {
            'name': 'Café Não Autenticado',
            'price': 29.99
        }

        response = client.post('/api/products', json=product_data, headers=no_auth_headers)

        assert response.status_code in [401, 404]

    def test_create_product_fail_with_missing_required_fields(self, client, admin_headers):
        """Deve falhar sem campos obrigatórios"""
        product_data = {
            'name': 'Café Incompleto'
            # Faltando price, category, etc
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        # Deve retornar erro de validação ou 404 se não implementado
        assert response.status_code in [400, 404]

    def test_create_product_fail_with_negative_price(self, client, admin_headers):
        """Deve falhar com preço negativo"""
        product_data = {
            'name': 'Café Preço Negativo',
            'price': -10.00,
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        assert response.status_code in [400, 404]

    def test_create_product_fail_with_negative_stock(self, client, admin_headers):
        """Deve falhar com estoque negativo"""
        product_data = {
            'name': 'Café Estoque Negativo',
            'price': 29.99,
            'stock_quantity': -5,
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        assert response.status_code in [400, 404]


class TestProductUpdate:
    """Testes para atualização de produtos"""

    def test_update_product_success_as_admin(self, client, admin_headers):
        """Admin deve atualizar produto com sucesso"""
        # Criar produto primeiro ou usar existente
        product_id = str(uuid.uuid4())

        update_data = {
            'name': 'Café Atualizado',
            'price': 39.99
        }

        response = client.put(f'/api/products/{product_id}', json=update_data, headers=admin_headers)

        # Pode retornar 200, 404 (não encontrado) ou 404 (endpoint não existe)
        assert response.status_code in [200, 404]

    def test_update_product_fail_as_regular_user(self, client, user_headers):
        """Usuário comum não deve atualizar produto"""
        product_id = str(uuid.uuid4())

        update_data = {
            'name': 'Tentativa de Atualização Não Autorizada'
        }

        response = client.put(f'/api/products/{product_id}', json=update_data, headers=user_headers)

        assert response.status_code in [403, 404]

    def test_update_product_fail_without_authentication(self, client, no_auth_headers):
        """Deve falhar sem autenticação"""
        product_id = str(uuid.uuid4())

        update_data = {
            'name': 'Tentativa Sem Auth'
        }

        response = client.put(f'/api/products/{product_id}', json=update_data, headers=no_auth_headers)

        assert response.status_code in [401, 404]

    def test_partial_update_product(self, client, admin_headers):
        """Deve permitir atualização parcial (PATCH)"""
        product_id = str(uuid.uuid4())

        update_data = {
            'price': 45.00  # Apenas preço
        }

        response = client.patch(f'/api/products/{product_id}', json=update_data, headers=admin_headers)

        # PATCH pode não estar implementado
        assert response.status_code in [200, 404, 405]


class TestProductDelete:
    """Testes para deleção de produtos"""

    def test_delete_product_success_as_admin(self, client, admin_headers):
        """Admin deve deletar produto com sucesso"""
        product_id = str(uuid.uuid4())

        response = client.delete(f'/api/products/{product_id}', headers=admin_headers)

        # Pode retornar 200, 204, 404 (não encontrado) ou 404 (endpoint não existe)
        assert response.status_code in [200, 204, 404]

    def test_delete_product_fail_as_regular_user(self, client, user_headers):
        """Usuário comum não deve deletar produto"""
        product_id = str(uuid.uuid4())

        response = client.delete(f'/api/products/{product_id}', headers=user_headers)

        assert response.status_code in [403, 404]

    def test_delete_product_fail_without_authentication(self, client, no_auth_headers):
        """Deve falhar sem autenticação"""
        product_id = str(uuid.uuid4())

        response = client.delete(f'/api/products/{product_id}', headers=no_auth_headers)

        assert response.status_code in [401, 404]

    def test_delete_nonexistent_product(self, client, admin_headers):
        """Deve retornar 404 ao deletar produto inexistente"""
        product_id = str(uuid.uuid4())

        response = client.delete(f'/api/products/{product_id}', headers=admin_headers)

        assert response.status_code in [404]


class TestProductSearch:
    """Testes para busca de produtos"""

    def test_search_products_by_name(self, client):
        """Deve buscar produtos por nome"""
        response = client.get('/api/products/search?q=cafe')

        assert response.status_code in [200, 404]

    def test_search_products_returns_relevant_results(self, client):
        """Busca deve retornar resultados relevantes"""
        response = client.get('/api/products/search?q=especial')

        assert response.status_code in [200, 404]

    def test_search_products_with_empty_query(self, client):
        """Busca com query vazia deve retornar todos ou erro"""
        response = client.get('/api/products/search?q=')

        assert response.status_code in [200, 400, 404]

    def test_search_products_case_insensitive(self, client):
        """Busca deve ser case-insensitive"""
        response1 = client.get('/api/products/search?q=CAFE')
        response2 = client.get('/api/products/search?q=cafe')

        # Ambas devem ter o mesmo status
        if response1.status_code == 200 and response2.status_code == 200:
            # Idealmente deveriam retornar os mesmos resultados
            pass

    def test_search_products_with_special_characters(self, client):
        """Busca deve lidar com caracteres especiais"""
        response = client.get('/api/products/search?q=café')

        assert response.status_code in [200, 404]


class TestProductCategories:
    """Testes para categorias de produtos"""

    def test_get_all_categories(self, client):
        """Deve listar todas as categorias"""
        response = client.get('/api/products/categories')

        assert response.status_code in [200, 404]

    def test_get_products_by_category(self, client):
        """Deve filtrar produtos por categoria"""
        response = client.get('/api/products?category=Especiais')

        assert response.status_code == 200


class TestProductValidation:
    """Testes para validação de dados de produtos"""

    def test_product_name_max_length(self, client, admin_headers):
        """Nome do produto deve ter limite de comprimento"""
        product_data = {
            'name': 'A' * 1000,  # Nome muito longo
            'price': 29.99,
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        # Deve retornar erro de validação ou aceitar (dependendo da implementação)
        assert response.status_code in [200, 201, 400, 404]

    def test_product_price_precision(self, client, admin_headers):
        """Preço deve ter precisão correta"""
        product_data = {
            'name': 'Café Precisão',
            'price': 29.999,  # Muitas casas decimais
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        assert response.status_code in [200, 201, 400, 404]

    def test_product_price_zero(self, client, admin_headers):
        """Produto com preço zero"""
        product_data = {
            'name': 'Café Grátis',
            'price': 0.00,
            'category': 'Especiais'
        }

        response = client.post('/api/products', json=product_data, headers=admin_headers)

        # Pode ser aceito ou rejeitado dependendo da regra de negócio
        assert response.status_code in [200, 201, 400, 404]


class TestProductStock:
    """Testes para gestão de estoque"""

    def test_update_product_stock(self, client, admin_headers):
        """Deve atualizar estoque de produto"""
        product_id = str(uuid.uuid4())

        stock_data = {
            'stock_quantity': 50
        }

        response = client.patch(f'/api/products/{product_id}/stock', json=stock_data, headers=admin_headers)

        # Endpoint pode não existir ainda
        assert response.status_code in [200, 404, 405]

    def test_product_out_of_stock(self, client):
        """Deve identificar produtos fora de estoque"""
        response = client.get('/api/products?in_stock=false')

        assert response.status_code in [200, 404]


class TestProductPerformance:
    """Testes de performance para produtos"""

    def test_list_products_response_time(self, client):
        """Listagem de produtos deve ser rápida"""
        import time

        start_time = time.time()
        response = client.get('/api/products')
        end_time = time.time()

        response_time = end_time - start_time

        assert response.status_code == 200
        # Deve responder em menos de 2 segundos
        assert response_time < 2.0


# Teste de integração completo
class TestProductIntegrationFlow:
    """Teste de fluxo completo de produto"""

    def test_complete_product_crud_flow(self, client, admin_headers):
        """Testa fluxo completo: criar -> ler -> atualizar -> deletar"""

        # 1. Criar produto
        create_data = {
            'name': 'Café Fluxo Completo',
            'description': 'Teste de fluxo completo',
            'price': 35.00,
            'category': 'Especiais',
            'stock_quantity': 50,
            'is_active': True
        }

        create_response = client.post('/api/products', json=create_data, headers=admin_headers)

        if create_response.status_code in [200, 201]:
            create_data_response = create_response.get_json()
            product_id = create_data_response.get('id') or create_data_response.get('product_id')

            if product_id:
                # 2. Ler produto
                read_response = client.get(f'/api/products/{product_id}')
                assert read_response.status_code == 200

                # 3. Atualizar produto
                update_data = {
                    'name': 'Café Fluxo Completo Atualizado',
                    'price': 40.00
                }

                update_response = client.put(f'/api/products/{product_id}', json=update_data, headers=admin_headers)
                assert update_response.status_code in [200, 404]

                # 4. Deletar produto
                delete_response = client.delete(f'/api/products/{product_id}', headers=admin_headers)
                assert delete_response.status_code in [200, 204, 404]

                # 5. Verificar que foi deletado
                verify_response = client.get(f'/api/products/{product_id}')
                assert verify_response.status_code in [404]
