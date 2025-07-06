# 🌙☀️ Como Usar o ThemeProvider - Mestres do Café

## Introdução

O `ThemeProvider` é um Context do React que gerencia o sistema de temas (claro/escuro) da aplicação Mestres do Café. Ele fornece acesso às cores da marca, tema atual e funções para alternar entre temas.

## Import Básico

```jsx
import { ThemeProvider } from "./contexts/ThemeContext";
```

## Setup no App Principal

```jsx
import React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>{/* Sua aplicação aqui */}</AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

## Hook useTheme

```jsx
import { useTheme } from "./contexts/ThemeContext";

const MyComponent = () => {
  const {
    currentTheme, // 'light' ou 'dark'
    theme, // Objeto completo do tema atual
    isDark, // boolean
    isLight, // boolean
    toggleTheme, // função para alternar tema
    setTheme, // função para definir tema específico
    brandColors, // cores da marca
    availableThemes, // temas disponíveis
  } = useTheme();

  return (
    <div className={isDark ? "bg-brand-dark" : "bg-brand-light"}>
      <h1>Tema atual: {currentTheme}</h1>
      <button onClick={toggleTheme}>
        Alternar para {isDark ? "Claro" : "Escuro"}
      </button>
    </div>
  );
};
```

## Cores da Marca

O ThemeProvider fornece acesso às cores oficiais:

```jsx
const { brandColors } = useTheme();

// Cores disponíveis:
// brandColors.dark  = '#101820'  (Preto principal)
// brandColors.gold  = '#b58150'  (Dourado/âmbar)
// brandColors.light = '#f7fcff'  (Branco/claro)
// brandColors.accent = '#1f2937' (Cinza escuro)
// brandColors.neutral = '#6b7280' (Cinza neutro)
```

## Classes Tailwind Personalizadas

O tema se integra perfeitamente com as classes do Tailwind CSS:

```jsx
// Backgrounds
<div className="bg-brand-dark">     // Fundo escuro
<div className="bg-brand-light">    // Fundo claro
<div className="bg-brand-brown">    // Fundo dourado

// Textos
<p className="text-brand-dark">     // Texto escuro
<p className="text-brand-light">    // Texto claro
<p className="text-brand-brown">    // Texto dourado

// Bordas
<div className="border-brand-brown"> // Borda dourada

// Com opacidade
<div className="bg-brand-brown/20">  // Fundo dourado 20%
<p className="text-brand-dark/80">   // Texto escuro 80%
```

## Componente Responsivo ao Tema

```jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeAwareCard = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`
      p-6 rounded-xl shadow-lg transition-colors
      ${
        isDark
          ? "bg-brand-dark text-brand-light border-brand-brown/30"
          : "bg-white text-brand-dark border-brand-brown/20"
      }
    `}
    >
      {children}
    </div>
  );
};
```

## Botão Toggle de Tema

```jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-3 rounded-full transition-all duration-300
        ${
          isDark
            ? "bg-brand-brown/20 text-brand-light hover:bg-brand-brown/30"
            : "bg-brand-brown/10 text-brand-brown hover:bg-brand-brown/20"
        }
      `}
      aria-label={`Alternar para tema ${isDark ? "claro" : "escuro"}`}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
};
```

## Persistência de Tema

O tema é automaticamente salvo no `localStorage` e restaurado na próxima visita:

```jsx
// Salvo automaticamente como 'mestres-cafe-theme'
// Valores: 'light' ou 'dark'
```

## Detecção de Tema do Sistema

```jsx
const { useSystemTheme, getSystemTheme } = useTheme();

// Usar tema do sistema
useSystemTheme();

// Apenas detectar (sem aplicar)
const systemTheme = getSystemTheme(); // 'light' ou 'dark'
```

## CSS Custom Properties

O ThemeProvider também define CSS variables para uso direto:

```css
/* Automaticamente disponíveis */
--color-bg-primary
--color-bg-secondary
--color-text-primary
--color-text-secondary
--color-accent-primary
--color-border-primary

/* Exemplo de uso */
.my-element {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

## Exemplo Completo

```jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ProductCard = ({ product }) => {
  const { isDark, brandColors, toggleTheme } = useTheme();

  return (
    <div
      className={`
      relative p-6 rounded-2xl shadow-lg transition-all duration-300
      ${
        isDark
          ? "bg-brand-dark text-brand-light border border-brand-brown/30"
          : "bg-white text-brand-dark border border-brand-brown/20"
      }
      hover:shadow-xl hover:scale-105
    `}
    >
      {/* Toggle de tema no card */}
      <button
        onClick={toggleTheme}
        className="absolute top-2 right-2 p-2 rounded-full bg-brand-brown/20 hover:bg-brand-brown/30"
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      {/* Conteúdo do produto */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />

      <h3 className="text-xl font-bold text-brand-brown mb-2">
        {product.name}
      </h3>

      <p className={`mb-4 ${isDark ? "text-brand-light/80" : "text-gray-600"}`}>
        {product.description}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-brand-brown">
          R$ {product.price.toFixed(2)}
        </span>

        <button
          className={`
          px-4 py-2 rounded-lg font-semibold transition-colors
          ${
            isDark
              ? "bg-brand-brown text-brand-light hover:bg-brand-brown/90"
              : "bg-brand-brown text-brand-light hover:bg-brand-brown/90"
          }
        `}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
```

## Status Atual

✅ **ThemeProvider configurado e funcionando**
✅ **Cores da marca definidas**
✅ **Persistência no localStorage**
✅ **Integração com Tailwind CSS**
✅ **Suporte a tema escuro/claro**
✅ **CSS custom properties**
✅ **Detecção de tema do sistema**

O sistema de temas está **100% funcional** e pronto para uso em toda a aplicação! 🎨☕
