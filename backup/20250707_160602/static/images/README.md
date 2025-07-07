# 📸 Estrutura de Imagens - Mestres do Café

## 📁 Organização das Imagens

Esta pasta contém todas as imagens utilizadas no sistema Mestres do Café.

### **Estrutura de Pastas**

```
public/images/
├── products/              # Imagens dos produtos de café
│   ├── cafe-especial-1.jpg
│   ├── cafe-especial-2.jpg
│   └── ...
├── blog/                  # Imagens para posts do blog
├── testimonials/          # Fotos de depoimentos
├── gallery/               # Galeria geral
└── caneca-mestres-cafe.jpg # Imagem principal da caneca
```

### **Diretrizes para Imagens**

#### **Produtos**
- **Formato**: JPG ou PNG
- **Tamanho recomendado**: 800x800px (quadrado)
- **Qualidade**: Alta resolução para zoom
- **Nomenclatura**: `produto-[id]-[variacao].jpg`

#### **Blog**
- **Formato**: JPG (recomendado)
- **Tamanho**: 1200x630px (formato Facebook)
- **Peso máximo**: 500KB

#### **Geral**
- **Formatos aceitos**: JPG, PNG, WebP
- **Otimização**: Sempre otimizar para web
- **Alt text**: Sempre definir no código

### **Como Adicionar Novas Imagens**

1. **Faça upload** das imagens na pasta apropriada
2. **Otimize** o tamanho do arquivo
3. **Atualize** o código para referenciar a nova imagem
4. **Teste** em diferentes dispositivos

### **Imagens Atuais**

- ✅ `caneca-mestres-cafe.jpg` - Imagem principal da caneca
- ✅ Logos na pasta `/assets/logo/`
- ✅ Estrutura preparada para produtos

### **Fallbacks**

O sistema possui fallbacks automáticos:
- **Produtos**: Ícone de café (`Coffee` component)
- **Blog**: Imagem padrão ou gradiente
- **Erro 404**: Placeholder personalizado

---

**📝 Nota**: Todas as imagens devem estar commitadas no repositório Git para funcionar em produção. 