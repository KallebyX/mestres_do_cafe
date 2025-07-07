# ☕ Sistema de Design Premium - Mestres do Café

Sistema completo de componentes UI com identidade visual premium, desenvolvido especificamente para torrefação artesanal de cafés especiais.

## 🎨 Identidade da Marca

- **Empresa**: Torrefação artesanal de cafés especiais (desde 2019)
- **Público**: Apreciadores de café premium
- **Valores**: Qualidade, tradição, artesanal, confiança
- **Estilo**: Premium, artesanal, confiável, acolhedor

## 🎯 Paleta de Cores

### Cores Primárias - Marrom
```css
--coffee-primary-light: #8B4513   /* Saddle Brown */
--coffee-primary-medium: #5D4037  /* Brown */
--coffee-primary-dark: #3E2723    /* Dark Brown */
```

### Cores Secundárias - Âmbar
```css
--coffee-secondary-light: #D2691E   /* Chocolate */
--coffee-secondary-medium: #FF8F00  /* Dark Orange */
--coffee-secondary-accent: #FFC107  /* Amber */
```

### Cores de Apoio - Laranja
```css
--coffee-support-warm: #F4A460    /* Sandy Brown */
--coffee-support-light: #FFE082   /* Light Yellow */
```

### Neutros Premium
```css
--coffee-neutral-100: #FAFAFA  /* Quase Branco */
--coffee-neutral-200: #F5F5F5  /* Cinza Muito Claro */
--coffee-neutral-300: #E0E0E0  /* Cinza Claro */
--coffee-neutral-400: #BDBDBD  /* Cinza Médio */
--coffee-neutral-500: #757575  /* Cinza */
--coffee-neutral-600: #616161  /* Cinza Escuro */
--coffee-neutral-700: #424242  /* Cinza Muito Escuro */
--coffee-neutral-800: #212121  /* Quase Preto */
--coffee-neutral-900: #000000  /* Preto */
```

## 📝 Tipografia

### Fontes
- **Display**: Playfair Display (títulos e elementos de destaque)
- **Corpo**: Inter (texto corrido e interface)

### Hierarquia Tipográfica
```css
.coffee-heading-1    /* 60px - Títulos principais */
.coffee-heading-2    /* 48px - Títulos de seção */
.coffee-heading-3    /* 36px - Subtítulos */
.coffee-heading-4    /* 30px - Títulos de card */
.coffee-heading-5    /* 24px - Títulos pequenos */
.coffee-heading-6    /* 20px - Labels grandes */
.coffee-body-large   /* 18px - Texto destacado */
.coffee-body         /* 16px - Texto padrão */
.coffee-body-small   /* 14px - Texto secundário */
.coffee-caption      /* 12px - Legendas e metadados */
```

## 🧩 Componentes

### CoffeeButton

Botões premium com múltiplas variações e estados de loading.

```tsx
import { CoffeeButton } from '@mestres-cafe/ui';

// Botão primário
<CoffeeButton variant="primary" size="md">
  Explorar Cafés
</CoffeeButton>

// Botão premium com efeito shimmer
<CoffeeButton variant="premium" size="lg">
  Comprar Agora
</CoffeeButton>

// Botão com loading
<CoffeeButton loading={true}>
  Processando...
</CoffeeButton>

// Botão com ícones
<CoffeeButton 
  leftIcon={<CoffeeIcon />}
  rightIcon={<ArrowIcon />}
>
  Ver Processo
</CoffeeButton>
```

#### Variantes
- `primary` - Botão principal da marca
- `secondary` - Botão secundário âmbar
- `outline` - Botão com borda apenas
- `ghost` - Botão transparente
- `premium` - Botão com gradiente e efeitos especiais
- `destructive` - Botão para ações de remoção

#### Tamanhos
- `sm` - Pequeno (32px altura)
- `md` - Médio (40px altura) - padrão
- `lg` - Grande (48px altura)
- `xl` - Extra grande (56px altura)
- `icon` - Apenas ícone (40x40px)

### CoffeeCard

Cards premium para produtos, conteúdo e informações.

```tsx
import { 
  CoffeeCard, 
  CoffeeCardHeader, 
  CoffeeCardTitle, 
  CoffeeCardDescription, 
  CoffeeCardContent, 
  CoffeeCardFooter 
} from '@mestres-cafe/ui';

<CoffeeCard variant="premium" size="lg">
  <CoffeeCardHeader>
    <CoffeeCardTitle>Café Especial Premium</CoffeeCardTitle>
    <Badge>SCA 85+</Badge>
  </CoffeeCardHeader>
  
  <CoffeeCardContent>
    <CoffeeCardDescription>
      Café de origem única com notas de chocolate e caramelo.
    </CoffeeCardDescription>
  </CoffeeCardContent>
  
  <CoffeeCardFooter>
    <span className="coffee-text-2xl coffee-font-bold">R$ 45,90</span>
    <CoffeeButton size="sm">Adicionar</CoffeeButton>
  </CoffeeCardFooter>
</CoffeeCard>
```

#### Variantes
- `default` - Card padrão
- `premium` - Card com efeitos premium
- `product` - Card otimizado para produtos
- `elevated` - Card com sombra elevada
- `outline` - Card apenas com borda

### CoffeeForm

Componentes de formulário premium com validação e estados.

```tsx
import { CoffeeInput, CoffeeTextarea, CoffeeSelect } from '@mestres-cafe/ui';

// Input com validação
<CoffeeInput
  label="Nome completo"
  placeholder="Digite seu nome"
  required
  error="Este campo é obrigatório"
  leftIcon={<UserIcon />}
/>

// Textarea premium
<CoffeeTextarea
  label="Comentários"
  variant="premium"
  rows={4}
  helpText="Conte-nos sobre sua experiência"
/>

// Select com opções
<CoffeeSelect
  label="Método de preparo"
  placeholder="Escolha um método"
  options={[
    { value: 'v60', label: 'Hario V60' },
    { value: 'chemex', label: 'Chemex' },
    { value: 'french-press', label: 'French Press' }
  ]}
/>
```

#### Variantes
- `default` - Estilo padrão
- `premium` - Com bordas e sombras especiais
- `filled` - Com fundo preenchido

#### Estados
- `default` - Normal
- `error` - Com erro de validação
- `success` - Validação bem-sucedida

### CoffeeLoading

Estados de carregamento e skeleton screens.

```tsx
import { 
  CoffeeLoading, 
  CoffeeSkeleton, 
  CoffeeSkeletonCard,
  CoffeeLoadingOverlay 
} from '@mestres-cafe/ui';

// Loading com ícone de café
<CoffeeLoading 
  variant="coffee" 
  size="lg" 
  text="Preparando seu café..." 
/>

// Skeleton para texto
<CoffeeSkeleton variant="text" lines={3} />

// Card skeleton completo
<CoffeeSkeletonCard 
  showAvatar={true}
  showImage={true}
  textLines={2}
/>

// Overlay de loading
<CoffeeLoadingOverlay isLoading={loading} text="Carregando...">
  <div>Conteúdo que será coberto pelo overlay</div>
</CoffeeLoadingOverlay>
```

#### Variantes de Loading
- `spinner` - Spinner circular clássico
- `pulse` - Pulsação suave
- `dots` - Três pontos animados
- `coffee` - Ícone de café flutuante

## 🎭 Temas

O sistema suporta tema claro e escuro automaticamente.

```tsx
import { useTheme, initializeCoffeeDesignSystem } from '@mestres-cafe/ui';

// Inicializar sistema
initializeCoffeeDesignSystem({
  theme: 'system' // ou 'light' | 'dark'
});

// Hook para controle de tema
function ThemeToggle() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  
  return (
    <CoffeeButton onClick={toggleTheme}>
      {isDark ? 'Modo Claro' : 'Modo Escuro'}
    </CoffeeButton>
  );
}
```

## 🎨 Classes Utilitárias

### Cores
```css
/* Textos */
.coffee-text-primary-light
.coffee-text-secondary-medium
.coffee-text-neutral-600

/* Fundos */
.coffee-bg-primary-light
.coffee-bg-neutral-100

/* Bordas */
.coffee-border-primary-light
```

### Espaçamentos
```css
.coffee-padding-4     /* 16px */
.coffee-padding-6     /* 24px */
.coffee-space-8       /* 32px margin */
```

### Efeitos
```css
.coffee-shadow-md         /* Sombra média */
.coffee-shadow-premium    /* Sombra premium */
.coffee-hover-lift        /* Elevação no hover */
.coffee-hover-glow        /* Brilho no hover */
```

### Animações
```css
.coffee-animate-fade-in      /* Fade in suave */
.coffee-animate-float        /* Flutuação */
.coffee-transition-normal    /* Transição padrão */
```

## 📱 Responsividade

O sistema é mobile-first com breakpoints definidos:

```css
/* Breakpoints */
sm: 640px   /* Tablet pequeno */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Classes Responsivas
```css
.coffee-container     /* Container responsivo */
.coffee-grid         /* Grid responsivo */
.coffee-flex         /* Flex responsivo */
```

## 🚀 Instalação e Uso

### 1. Instalação
```bash
npm install @mestres-cafe/ui
```

### 2. Importar Estilos
```tsx
// No seu app principal
import '@mestres-cafe/ui/styles/design-system.css';
```

### 3. Inicializar Sistema
```tsx
import { initializeCoffeeDesignSystem } from '@mestres-cafe/ui';

// Na inicialização do app
initializeCoffeeDesignSystem({
  theme: 'system'
});
```

### 4. Usar Componentes
```tsx
import { CoffeeButton, CoffeeCard } from '@mestres-cafe/ui';

function App() {
  return (
    <div className="coffee-container">
      <CoffeeCard variant="premium">
        <CoffeeButton variant="primary">
          Descobrir Cafés
        </CoffeeButton>
      </CoffeeCard>
    </div>
  );
}
```

## 🎯 Exemplos de Uso

### Landing Page Hero
```tsx
<section className="coffee-bg-neutral-100 coffee-padding-20">
  <div className="coffee-container text-center">
    <h1 className="coffee-heading-1 coffee-text-gradient-primary">
      Mestres do Café
    </h1>
    <p className="coffee-body-large coffee-text-neutral-600 mb-8">
      Torrefação artesanal de cafés especiais desde 2019
    </p>
    <div className="flex gap-4 justify-center">
      <CoffeeButton variant="premium" size="lg">
        Explorar Cafés
      </CoffeeButton>
      <CoffeeButton variant="outline" size="lg">
        Nossa História
      </CoffeeButton>
    </div>
  </div>
</section>
```

### Grid de Produtos
```tsx
<div className="coffee-grid coffee-container">
  {produtos.map(produto => (
    <CoffeeCard key={produto.id} variant="product" interactive>
      <img src={produto.imagem} className="w-full h-48 object-cover" />
      <CoffeeCardContent>
        <CoffeeCardTitle>{produto.nome}</CoffeeCardTitle>
        <CoffeeCardDescription>{produto.descricao}</CoffeeCardDescription>
        <div className="flex justify-between items-center mt-4">
          <span className="coffee-text-2xl coffee-font-bold coffee-text-primary-light">
            R$ {produto.preco}
          </span>
          <CoffeeButton size="sm">Adicionar</CoffeeButton>
        </div>
      </CoffeeCardContent>
    </CoffeeCard>
  ))}
</div>
```

### Formulário de Contato
```tsx
<CoffeeCard variant="elevated" className="max-w-md mx-auto">
  <CoffeeCardHeader>
    <CoffeeCardTitle>Entre em Contato</CoffeeCardTitle>
  </CoffeeCardHeader>
  
  <CoffeeCardContent className="space-y-4">
    <CoffeeInput
      label="Nome"
      variant="premium"
      required
      leftIcon={<UserIcon />}
    />
    
    <CoffeeInput
      label="E-mail"
      type="email"
      variant="premium"
      required
      leftIcon={<MailIcon />}
    />
    
    <CoffeeTextarea
      label="Mensagem"
      variant="premium"
      rows={4}
      required
    />
  </CoffeeCardContent>
  
  <CoffeeCardFooter>
    <CoffeeButton variant="primary" className="w-full">
      Enviar Mensagem
    </CoffeeButton>
  </CoffeeCardFooter>
</CoffeeCard>
```

## 🛡️ Acessibilidade

O sistema foi desenvolvido com foco em acessibilidade:

- ✅ Suporte a leitores de tela
- ✅ Navegação por teclado
- ✅ Contraste adequado (WCAG AA)
- ✅ Foco visível
- ✅ Reduced motion support
- ✅ Semântica HTML adequada

## 🎨 Customização

### Tokens Personalizados
```tsx
initializeCoffeeDesignSystem({
  customTokens: {
    colors: {
      primary: {
        light: '#YOUR_COLOR',
        medium: '#YOUR_COLOR',
        dark: '#YOUR_COLOR'
      }
    },
    typography: {
      fontDisplay: 'Your Custom Font',
      fontBody: 'Your Custom Font'
    }
  }
});
```

### CSS Custom Properties
```css
:root {
  --coffee-primary-light: #YOUR_COLOR;
  --coffee-font-display: 'Your Font';
}
```

## 📄 Licença

MIT License - Mestres do Café Design System

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Compatibilidade**: React 18+, Tailwind CSS 3+

Para mais informações e exemplos, visite nossa [documentação completa](./docs/).