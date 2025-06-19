# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Mestres do Café**! Este guia irá ajudá-lo a contribuir de forma efetiva e seguir nossas boas práticas.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

## 👥 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você deve respeitá-lo:

### Nossos Compromissos
- 🤝 Ser acolhedor para todos os colaboradores
- 🌍 Respeitar diferentes pontos de vista e experiências
- 💬 Comunicação construtiva e respeitosa
- 🎯 Foco no que é melhor para a comunidade

### Comportamentos Esperados
- ✅ Linguagem acolhedora e inclusiva
- ✅ Respeito por diferentes opiniões
- ✅ Feedback construtivo
- ✅ Foco na resolução de problemas

### Comportamentos Inaceitáveis
- ❌ Linguagem ou imagens sexualizadas
- ❌ Comentários depreciativos ou ataques pessoais
- ❌ Assédio público ou privado
- ❌ Publicação de informações privadas sem permissão

## 🛠️ Como Contribuir

### Tipos de Contribuição

#### 🐛 Reportar Bugs
- Use o template de issue para bugs
- Inclua passos para reproduzir
- Adicione screenshots se necessário
- Informe versão do navegador/sistema

#### 💡 Sugerir Features
- Use o template de feature request
- Descreva o problema que resolve
- Proponha a solução
- Considere alternativas

#### 📝 Melhorar Documentação
- Corrija typos ou informações desatualizadas
- Adicione exemplos práticos
- Traduza para outros idiomas
- Melhore a clareza das explicações

#### 🎨 Contribuir com Código
- Implemente novas features
- Corrija bugs existentes
- Otimize performance
- Melhore acessibilidade

## ⚙️ Configuração do Ambiente

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL/mestres-do-cafe-frontend.git
```

### 2. Instalação
```bash
# Instale todas as dependências
npm run setup

# Verifique se tudo está funcionando
npm run validate
```

### 3. Configuração do Editor

#### VS Code (Recomendado)
Instale as extensões:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag

#### Configuração do Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🔄 Processo de Desenvolvimento

### 1. Criação de Branch
```bash
# Sempre crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Convenção de Nomes
- `feature/` - Novas funcionalidades
- `fix/` - Correção de bugs
- `docs/` - Mudanças na documentação
- `style/` - Mudanças de estilo/formatação
- `refactor/` - Refatoração de código
- `test/` - Adição/correção de testes
- `chore/` - Mudanças de build/config

### 3. Desenvolvimento
```bash
# Inicie o ambiente de desenvolvimento
npm run full-dev

# Rode os testes continuamente
npm run test:backend:watch
npm run test:ui
```

### 4. Antes de Commitar
```bash
# Execute a validação completa
npm run validate

# Verifique se passou em todos os testes
npm run test:all

# Verifique o linting
npm run lint
```

## 📏 Padrões de Código

### Frontend (React)

#### Estrutura de Componentes
```jsx
// ✅ Bom
import React from 'react';
import { useState, useEffect } from 'react';

const MeuComponente = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initial);

  useEffect(() => {
    // effect logic
  }, [dependency]);

  const handleAction = () => {
    // handler logic
  };

  return (
    <div className="classe-tailwind">
      {/* JSX */}
    </div>
  );
};

export default MeuComponente;
```

#### Convenções de Nomenclatura
- **Componentes**: PascalCase (`UserProfile`)
- **Arquivos**: PascalCase para componentes (`UserProfile.jsx`)
- **Funções**: camelCase (`handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes**: kebab-case (`user-profile`)

#### Hooks Personalizados
```jsx
// ✅ Bom
const useAuth = () => {
  // hook logic
  return { user, login, logout };
};
```

### Backend (Node.js)

#### Estrutura de Rotas
```javascript
// ✅ Bom
const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    // logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Validações
```javascript
// ✅ Bom - Use express-validator
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha muito curta'),
];
```

### Estilo de Código

#### CSS/Tailwind
```jsx
// ✅ Bom - Classes organizadas
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white rounded-lg shadow
  hover:shadow-lg transition-shadow
">
```

#### JavaScript/TypeScript
```javascript
// ✅ Bom
const processOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Pedido não encontrado');
    }
    
    return await order.process();
  } catch (error) {
    logger.error('Erro ao processar pedido:', error);
    throw error;
  }
};
```

## 🧪 Testes

### Escrevendo Testes

#### Testes de Frontend (Vitest)
```javascript
// tests/frontend/components/Button.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../src/components/Button';

describe('Button Component', () => {
  it('deve renderizar com texto correto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Testes de Backend (Jest)
```javascript
// server/tests/users/users.test.js
const request = require('supertest');
const app = require('../../server');

describe('Users API', () => {
  it('deve listar usuários', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
```

### Executando Testes
```bash
# Todos os testes
npm run test:all

# Apenas frontend
npm run test:run

# Apenas backend
npm run test:backend

# Com coverage
npm run test:coverage

# Watch mode
npm run test:backend:watch
```

### Cobertura de Testes
- Mantenha cobertura acima de 90%
- Teste casos de erro
- Teste edge cases
- Inclua testes de integração

## 📚 Documentação

### README
- Mantenha atualizado
- Inclua exemplos práticos
- Use badges para status
- Adicione screenshots

### Comentários no Código
```javascript
// ✅ Bom - Explique o "porquê", não o "o quê"
// Calculamos o desconto baseado no nível do usuário
// porque usuários de nível mais alto merecem maiores benefícios
const discount = calculateDiscountByLevel(user.level);
```

### JSDoc (quando necessário)
```javascript
/**
 * Calcula o desconto baseado no nível do usuário
 * @param {string} level - Nível do usuário (bronze, prata, ouro, etc.)
 * @returns {number} Porcentagem de desconto (0-25)
 */
const calculateDiscountByLevel = (level) => {
  // implementation
};
```

## 🔄 Pull Requests

### Antes de Abrir o PR

1. **Atualize sua branch**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Execute todos os testes**
```bash
npm run validate
```

3. **Verifique se não há conflitos**

### Template do PR

```markdown
## 📝 Descrição
Descreva as mudanças implementadas.

## 🔗 Issue Relacionada
Fixes #123

## 📋 Checklist
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Linting sem erros
- [ ] Screenshots (se aplicável)

## 🧪 Como Testar
1. Faça checkout da branch
2. Execute `npm run setup`
3. Execute `npm run full-dev`
4. Navegue para...

## 📷 Screenshots
(se aplicável)
```

### Processo de Review

1. **Automated Checks**: CI/CD deve passar
2. **Code Review**: Pelo menos 1 aprovação
3. **Manual Testing**: Teste em diferentes navegadores
4. **Documentation**: Verifique se está atualizada

### Convenção de Commits

Use [Conventional Commits](https://conventionalcommits.org/):

```bash
# Features
git commit -m "feat: adicionar sistema de cupons de desconto"

# Bug fixes
git commit -m "fix: corrigir cálculo de pontos na gamificação"

# Documentação
git commit -m "docs: atualizar guia de instalação"

# Estilo
git commit -m "style: ajustar espaçamento dos cards"

# Refatoração
git commit -m "refactor: extrair lógica de validação para hook"

# Testes
git commit -m "test: adicionar testes para componente Header"

# Chores
git commit -m "chore: atualizar dependências"
```

## 🎯 Boas Práticas

### Performance
- Use React.memo para componentes pesados
- Implemente lazy loading
- Otimize imagens
- Minimize re-renders

### Acessibilidade
- Use semantic HTML
- Adicione alt text para imagens
- Implemente navegação por teclado
- Teste com screen readers

### Segurança
- Sanitize inputs
- Use HTTPS em produção
- Implemente rate limiting
- Valide dados no backend

### UX/UI
- Forneça feedback visual
- Implemente loading states
- Mantenha consistência visual
- Teste em diferentes dispositivos

## 🆘 Precisa de Ajuda?

- 💬 **Discussões**: Use GitHub Discussions
- 🐛 **Issues**: Reporte bugs via GitHub Issues
- 📧 **Email**: contato@mestrescafe.com.br
- 💬 **Discord**: [Link do servidor](#)

## 🏆 Reconhecimento

Todos os contribuidores são listados no [README.md](./README.md) e recebem:

- 🏅 Badge de contribuidor
- 📜 Certificado digital
- 🎁 Produtos gratuitos (contribuições significativas)
- 💼 Networking com a equipe

---

<div align="center">

**Obrigado por contribuir com o Mestres do Café! ☕**

**[⬆️ Voltar ao README](./README.md)**

</div> 