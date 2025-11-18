# Testes Backend - Mestres do Café API

## Estrutura de Testes

```
tests/
├── __init__.py              # Pacote de testes
├── conftest.py             # Fixtures e configurações pytest (na raiz)
├── test_auth.py            # Testes de autenticação e JWT
├── test_products.py        # Testes de produtos e catálogo
├── test_cart.py            # Testes de carrinho de compras
└── README.md               # Esta documentação
```

## Como Executar os Testes

### Executar todos os testes
```bash
cd /home/user/mestres_do_cafe/apps/api
pytest
```

### Executar testes de um módulo específico
```bash
pytest tests/test_auth.py           # Apenas testes de autenticação
pytest tests/test_products.py       # Apenas testes de produtos
pytest tests/test_cart.py           # Apenas testes de carrinho
```

### Executar teste específico
```bash
pytest tests/test_auth.py::TestAuthLogin::test_login_success_with_valid_credentials
```

### Executar com verbose (mais detalhes)
```bash
pytest -v
pytest -vv  # Ainda mais detalhes
```

### Executar com coverage (cobertura de código)
```bash
pytest --cov=src --cov-report=html
pytest --cov=src --cov-report=term-missing
```

### Executar apenas testes que falharam
```bash
pytest --lf  # Last failed
pytest --ff  # Failed first
```

### Executar com output de print
```bash
pytest -s  # Mostra prints do código
```

### Executar em paralelo (mais rápido)
```bash
pip install pytest-xdist
pytest -n auto  # Usa todos os cores disponíveis
pytest -n 4     # Usa 4 workers
```

## Fixtures Disponíveis

### Aplicação e Cliente
- `app` - Instância da aplicação Flask para testes
- `client` - Cliente HTTP para fazer requisições
- `db_session` - Sessão do banco de dados

### Usuários de Teste
- `admin_user` - Usuário administrador (admin@test.com / admin123)
- `regular_user` - Usuário comum (user@test.com / user123)
- `inactive_user` - Usuário inativo (inactive@test.com / inactive123)

### Tokens JWT
- `admin_token` - Token JWT do administrador
- `user_token` - Token JWT do usuário comum
- `expired_token` - Token JWT expirado

### Headers HTTP
- `admin_headers` - Headers com token de admin
- `user_headers` - Headers com token de usuário
- `expired_headers` - Headers com token expirado
- `invalid_headers` - Headers com token inválido
- `no_auth_headers` - Headers sem autenticação

### Helpers
- `helpers` - Classe com métodos auxiliares para testes

### Dados de Teste
- `sample_product_data` - Dados de exemplo para produtos
- `sample_user_data` - Dados de exemplo para usuários
- `sample_invalid_user_data` - Dados inválidos para testes de validação

## Módulos de Teste

### test_auth.py
Testa funcionalidades de autenticação:
- ✅ Login com credenciais válidas/inválidas
- ✅ Registro de novos usuários
- ✅ Validação de tokens JWT
- ✅ Proteção de endpoints
- ✅ Logout
- ✅ Validação de senhas e emails

**Total: ~40 testes**

### test_products.py
Testa CRUD completo de produtos:
- ✅ Listagem com paginação, busca e filtros
- ✅ Detalhes de produto
- ✅ Criação (apenas admin)
- ✅ Atualização (apenas admin)
- ✅ Deleção (apenas admin)
- ✅ Gestão de estoque
- ✅ Categorias

**Total: ~35 testes**

### test_cart.py
Testa funcionalidades do carrinho:
- ✅ Adicionar/remover itens
- ✅ Atualizar quantidades
- ✅ Cálculo de totais
- ✅ Aplicar cupons de desconto
- ✅ Validação de estoque
- ✅ Merge de carrinho guest/autenticado

**Total: ~25 testes**

## Cobertura Esperada

Meta de cobertura: **80%** para backend crítico

Áreas cobertas:
- ✅ Autenticação e autorização
- ✅ Produtos e catálogo
- ✅ Carrinho de compras
- ⏳ Pedidos e checkout (TODO)
- ⏳ Pagamentos (TODO)
- ⏳ Integrações (MercadoPago, Melhor Envio) (TODO)

## Boas Práticas

### Nomenclatura de Testes
```python
def test_<action>_<expected_result>_<condition>():
    """Descrição clara do que o teste faz"""
    pass

# Exemplos:
def test_login_success_with_valid_credentials():
def test_login_fail_with_invalid_email():
def test_create_product_fail_as_regular_user():
```

### Estrutura de Teste (AAA Pattern)
```python
def test_example():
    # Arrange - Preparar dados
    user_data = {'email': 'test@test.com', 'password': '123456'}

    # Act - Executar ação
    response = client.post('/api/auth/login', json=user_data)

    # Assert - Verificar resultado
    assert response.status_code == 200
    assert 'token' in response.get_json()
```

### Isolamento de Testes
- Cada teste deve ser independente
- Use fixtures para dados compartilhados
- Limpe o estado após cada teste
- Não assuma ordem de execução

### Assertions Claras
```python
# ❌ Ruim
assert response.status_code == 200

# ✅ Bom
assert response.status_code == 200, f"Expected 200, got {response.status_code}"

# ✅ Melhor
data = response.get_json()
assert response.status_code == 200
assert 'token' in data
assert data['token'] is not None
```

## Configuração do Ambiente de Teste

Os testes usam:
- SQLite em memória (banco temporário)
- Variáveis de ambiente de teste (conftest.py)
- Fixtures isoladas por teste

Não afeta:
- Banco de dados de desenvolvimento
- Banco de dados de produção
- Arquivos de configuração

## Troubleshooting

### Erro: "No module named 'src'"
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
```

### Erro: "Database is locked"
- SQLite pode ter problemas com concorrência
- Execute testes sequencialmente: `pytest -n 0`

### Erro: "Fixture 'X' not found"
- Verifique se conftest.py está na raiz de apps/api
- Verifique imports no conftest.py

### Testes lentos
- Use pytest-xdist para paralelizar
- Use cache: `pytest --cache-clear`
- Considere usar mocks para APIs externas

## Próximos Passos

- [ ] Adicionar testes para módulo de pedidos
- [ ] Adicionar testes para módulo de pagamentos
- [ ] Adicionar testes para integrações (MercadoPago, Melhor Envio)
- [ ] Adicionar testes de performance
- [ ] Configurar CI/CD para executar testes automaticamente
- [ ] Atingir 80% de cobertura de código
- [ ] Adicionar testes E2E (end-to-end)

## Contribuindo

Ao adicionar novos testes:
1. Siga a estrutura de nomenclatura
2. Adicione docstring explicativa
3. Use fixtures quando apropriado
4. Mantenha testes independentes
5. Atualize esta documentação
