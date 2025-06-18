# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Mestres do Café**! 

## 📋 Como Contribuir

### 🐛 Reportar Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/mestres-do-cafe-frontend/issues)
2. Se não encontrou, crie uma nova issue com:
   - **Título claro** descrevendo o problema
   - **Passos para reproduzir** o bug
   - **Comportamento esperado** vs **comportamento atual**
   - **Screenshots** se aplicável
   - **Ambiente** (OS, navegador, versão do Node)

### ✨ Sugerir Melhorias

1. Abra uma issue com o label `enhancement`
2. Descreva detalhadamente sua sugestão
3. Explique **por que** seria útil
4. Considere incluir mockups ou exemplos

### 🔧 Contribuir com Código

#### 1. Fork e Clone
```bash
# Fork no GitHub, depois:
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend
```

#### 2. Configurar Ambiente
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

#### 3. Criar Branch
```bash
# Use um nome descritivo
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/corrigir-bug
# ou  
git checkout -b docs/atualizar-readme
```

#### 4. Desenvolver
- Mantenha o código **limpo** e **bem documentado**
- Siga os **padrões de código** existentes
- Adicione **comentários** quando necessário
- **Teste** suas mudanças

#### 5. Commit
Use commits semânticos:
```bash
# Exemplos:
git commit -m "feat: adicionar componente de busca"
git commit -m "fix: corrigir validação de email"
git commit -m "docs: atualizar README com instruções"
git commit -m "style: formatar código seguindo ESLint"
git commit -m "refactor: reorganizar estrutura de pastas"
```

#### 6. Push e Pull Request
```bash
git push origin feature/nova-funcionalidade
```

Depois abra um Pull Request no GitHub com:
- **Título descritivo**
- **Descrição detalhada** do que foi alterado
- **Screenshots** se aplicável
- Referência a issues relacionadas

## 🎯 Padrões de Código

### 📁 Estrutura de Arquivos
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Radix)
│   └── específicos/    # Componentes da aplicação
├── pages/              # Páginas/rotas
├── contexts/           # Contextos React
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
└── assets/             # Recursos estáticos
```

### 🧹 Nomenclatura
- **Componentes:** PascalCase (`UserProfile.jsx`)
- **Arquivos:** kebab-case (`user-profile.css`)
- **Variáveis:** camelCase (`userName`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)

### 📝 Componentes React
```jsx
// Imports organizados
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Props tipadas (se usando TypeScript)
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// Componente funcional
const MeuComponente = ({ title, onAction }) => {
  const [state, setState] = useState(false);

  // Effects no topo
  useEffect(() => {
    // Lógica aqui
  }, []);

  // Handlers
  const handleClick = () => {
    onAction?.();
  };

  // Render
  return (
    <div className="container">
      <h1>{title}</h1>
      <Button onClick={handleClick}>
        Ação
      </Button>
    </div>
  );
};

export default MeuComponente;
```

### 🎨 CSS/Tailwind
- Use **classes utilitárias** do Tailwind
- Agrupe classes por **categoria** (layout, spacing, colors)
- Use **variáveis CSS** para valores customizados
- Prefira **componentes** a classes customizadas

```jsx
// ✅ Bom
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// ❌ Evitar
<div className="custom-card-style">
```

## 🧪 Testes

### Executar Testes
```bash
npm run test          # Testes unitários
npm run test:watch    # Modo watch
npm run test:coverage # Com coverage
```

### Escrever Testes
```jsx
import { render, screen } from '@testing-library/react';
import { MeuComponente } from './MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar o título', () => {
    render(<MeuComponente title="Teste" />);
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
```

## 📦 Tipos de Contribuição

### 🐛 Bug Fixes
- Correções de bugs existentes
- Melhorias de performance
- Correções de acessibilidade

### ✨ Features
- Novas funcionalidades
- Novos componentes
- Melhorias de UX

### 📚 Documentação
- Melhorias no README
- Comentários no código
- Guias de uso

### 🎨 Design/UI
- Melhorias visuais
- Responsividade
- Temas e cores

### 🔧 DevOps/Config
- Configurações de build
- Scripts de automação
- Configurações de CI/CD

## ❓ Precisa de Ajuda?

- 📖 Leia a [documentação](README.md)
- 🐛 Verifique as [issues abertas](https://github.com/seu-usuario/mestres-do-cafe-frontend/issues)
- 💬 Abra uma **discussão** no GitHub
- 📧 Entre em contato: contato@mestrescafe.com.br

## 🎉 Reconhecimento

Todos os contribuidores serão reconhecidos:
- Nome na seção de **agradecimentos**
- Badge de **contribuidor**
- Perfil no **hall da fama** (futuro)

---

**Obrigado por ajudar a tornar o Mestres do Café ainda melhor! ☕** 