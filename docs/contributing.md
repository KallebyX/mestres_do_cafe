# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Café Enterprise! Este guia irá ajudá-lo a começar.

## 📋 Código de Conduta

### Nosso Compromisso

Como membros, contribuidores e líderes, nos comprometemos a fazer da participação em nossa comunidade uma experiência livre de assédio para todos.

### Nossas Diretrizes

- Use linguagem acolhedora e inclusiva
- Respeite diferentes pontos de vista e experiências
- Aceite críticas construtivas graciosamente
- Foque no que é melhor para a comunidade
- Mostre empatia para com outros membros da comunidade

## 🚀 Como Contribuir

### 1. Reportar Bugs

Encontrou um bug? Ajude-nos a corrigi-lo!

1. Verifique se o bug já foi reportado nos [Issues](https://github.com/KallebyX/cafe/issues)
2. Se não encontrar, crie um novo issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, versão do Node, etc.)

### 2. Sugerir Melhorias

Tem uma ideia para melhorar o projeto?

1. Abra um issue com a tag `enhancement`
2. Descreva detalhadamente sua sugestão
3. Explique por que seria útil
4. Inclua mockups ou exemplos (se aplicável)

### 3. Contribuir com Código

#### Configuração do Ambiente

```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/SEU-USERNAME/cafe.git
cd cafe

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/KallebyX/cafe.git

# 4. Instale as dependências
make install

# 5. Configure o ambiente
cp .env.example .env
```

#### Fluxo de Trabalho

```bash
# 1. Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# 2. Faça suas alterações
# 3. Execute os testes
make test

# 4. Execute o linting
make lint

# 5. Commit suas mudanças
git commit -m "feat: adiciona nova funcionalidade"

# 6. Push para seu fork
git push origin feature/nome-da-feature

# 7. Abra um Pull Request
```

#### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Tipos:**
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: manutenção

**Exemplos:**
```bash
feat: adiciona sistema de notificações
fix: corrige bug no carrinho de compras
docs: atualiza guia de instalação
style: formata código do header
refactor: reorganiza estrutura de pastas
test: adiciona testes para API de produtos
chore: atualiza dependências
```

### 4. Melhorar Documentação

A documentação é fundamental! Você pode contribuir:

- Corrigindo erros de português
- Adicionando exemplos práticos
- Criando tutoriais
- Traduzindo para outros idiomas
- Melhorando a estrutura

## 🏗️ Estrutura do Projeto

```
cafe/
├── apps/
│   ├── web/          # Frontend React
│   └── api/          # Backend Flask
├── docs/             # Documentação
├── packages/         # Pacotes compartilhados
├── tests/            # Testes
└── tools/            # Ferramentas e scripts
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
make test

# Apenas frontend
make test-web

# Apenas backend
make test-api

# Testes específicos
cd apps/api && python -m pytest tests/test_products.py
cd apps/web && npm test -- --testNamePattern="Header"
```

### Escrever Testes

#### Backend (Python)
```python
# tests/test_products.py
import pytest
from app import create_app

def test_get_products():
    app = create_app()
    client = app.test_client()
    
    response = client.get('/api/products')
    assert response.status_code == 200
```

#### Frontend (Jest)
```javascript
// src/components/__tests__/Header.test.jsx
import { render, screen } from '@testing-library/react'
import Header from '../Header'

test('renders header with logo', () => {
  render(<Header />)
  const logo = screen.getByAltText('Café Enterprise')
  expect(logo).toBeInTheDocument()
})
```

## 📝 Padrões de Código

### Frontend (React/TypeScript)

```typescript
// ✅ Bom
interface ProductProps {
  id: string
  name: string
  price: number
}

const Product: React.FC<ProductProps> = ({ id, name, price }) => {
  return (
    <div className="product">
      <h3>{name}</h3>
      <p>R$ {price.toFixed(2)}</p>
    </div>
  )
}

export default Product
```

### Backend (Python/Flask)

```python
# ✅ Bom
from flask import Blueprint, request, jsonify
from models.product import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """Retorna lista de produtos."""
    try:
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## 🔍 Code Review

### Para Revisores

- Seja construtivo e educativo
- Foque no código, não na pessoa
- Sugira melhorias específicas
- Reconheça boas práticas

### Para Autores

- Aceite feedback positivamente
- Faça perguntas se não entender
- Implemente as sugestões
- Teste suas alterações

## 🎯 Prioridades

### Alta Prioridade
- Correções de bugs críticos
- Melhorias de segurança
- Otimizações de performance
- Documentação essencial

### Média Prioridade
- Novas funcionalidades
- Melhorias de UX
- Refatorações
- Testes adicionais

### Baixa Prioridade
- Melhorias cosméticas
- Documentação complementar
- Otimizações menores

## 📞 Contato

- **Issues**: [GitHub Issues](https://github.com/KallebyX/cafe/issues)
- **Email**: contato@exemplo.com
- **Discord**: [Servidor da Comunidade](#)

## 🎉 Reconhecimento

Todos os contribuidores são reconhecidos no [README.md](../README.md) e no [CONTRIBUTORS.md](./CONTRIBUTORS.md).

---

**Obrigado por contribuir com o Café Enterprise!** ☕🚀