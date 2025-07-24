# 🧪 Lista de Testes E2E - Mestres do Café

## 📋 Todo List de Testes Completos

### 1. Testes de Cadastro e Autenticação
- [ ] Testar cadastro de Pessoa Física
  - [ ] Acessar página de cadastro
  - [ ] Preencher dados pessoais (nome, CPF, email, senha)
  - [ ] Validar CPF
  - [ ] Confirmar criação da conta
- [ ] Testar cadastro de Pessoa Jurídica  
  - [ ] Acessar página de cadastro
  - [ ] Selecionar tipo "Empresa"
  - [ ] Preencher dados empresariais (razão social, CNPJ, email, senha)
  - [ ] Validar CNPJ
  - [ ] Confirmar criação da conta
- [ ] Testar login com conta PF
- [ ] Testar login com conta PJ
- [ ] Testar logout
- [ ] Testar recuperação de senha

### 2. Testes de Navegação e Catálogo
- [ ] Navegar pela home sem estar logado
- [ ] Visualizar lista de produtos
- [ ] Usar filtros de categoria
- [ ] Usar busca de produtos
- [ ] Visualizar detalhes de um produto
- [ ] Verificar avaliações do produto

### 3. Testes de Carrinho
- [ ] Adicionar produto ao carrinho (logado)
- [ ] Adicionar produto ao carrinho (não logado)
- [ ] Alterar quantidade no carrinho
- [ ] Remover item do carrinho
- [ ] Aplicar cupom de desconto
- [ ] Calcular frete

### 4. Testes de Checkout
- [ ] Preencher endereço de entrega
- [ ] Selecionar método de envio
- [ ] Preencher dados de pagamento
- [ ] Revisar pedido antes de confirmar
- [ ] Confirmar pedido

### 5. Testes de Pagamento
- [ ] Testar pagamento com cartão de crédito (sandbox)
- [ ] Testar pagamento com PIX (sandbox)
- [ ] Testar pagamento com boleto (sandbox)
- [ ] Verificar webhook de confirmação
- [ ] Verificar email de confirmação

### 6. Testes Pós-Venda
- [ ] Verificar pedido no painel do usuário
- [ ] Acompanhar status do pedido
- [ ] Verificar histórico de pedidos
- [ ] Avaliar produto comprado
- [ ] Solicitar suporte

### 7. Testes do Painel Admin
- [ ] Login como administrador
- [ ] Visualizar dashboard com métricas
- [ ] Listar pedidos recentes
- [ ] Atualizar status de pedido
- [ ] Gerenciar estoque de produtos
- [ ] Adicionar novo produto
- [ ] Editar produto existente
- [ ] Gerenciar clientes
- [ ] Visualizar relatórios

### 8. Validações Técnicas
- [ ] Verificar atualização de estoque após venda
- [ ] Validar cálculo de impostos
- [ ] Confirmar integração com Mercado Pago
- [ ] Testar responsividade mobile
- [ ] Verificar performance de carregamento

---

## 🚀 Prompt para Nova Tarefa

```
Preciso testar o fluxo completo do e-commerce Mestres do Café seguindo a lista de testes em test_todo_list.md. 

Começar pelos testes de cadastro:
1. Primeiro testar cadastro de Pessoa Física com CPF válido
2. Depois testar cadastro de Pessoa Jurídica com CNPJ válido
3. Fazer login com ambas as contas criadas
4. Continuar com os demais testes da lista

O sistema está rodando em:
- Frontend: http://localhost:3000
- API: http://localhost:5001

Executar cada teste de forma sistemática, reportando sucesso ou falha, e documentando qualquer problema encontrado.