import React from 'react';
import type { ProductCardProps } from './ProductCard';
import ProductGrid from './ProductGrid';

// Dados de exemplo para demonstração
const mockProducts: ProductCardProps['product'][] = [
  {
    id: '1',
    name: 'Bourbon Amarelo Premium',
    origin: 'Cerrado Mineiro',
    price: 89.90,
    originalPrice: 119.90,
    image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 127,
    isInStock: true,
    stockCount: 15,
    flavorNotes: ['Chocolate', 'Caramelo', 'Frutas Vermelhas'],
    badges: [
      { type: 'premium', label: 'Premium' },
      { type: 'limited', label: 'Edição Limitada' }
    ],
    roastLevel: 'medium',
    estimatedDelivery: '2-3 dias úteis',
    isFavorite: false,
    isOnSale: true,
    freeShipping: true
  },
  {
    id: '2',
    name: 'Geisha Especial',
    origin: 'Chapada Diamantina',
    price: 149.90,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 89,
    isInStock: true,
    stockCount: 8,
    isLowStock: true,
    flavorNotes: ['Floral', 'Bergamota', 'Mel'],
    badges: [
      { type: 'sca', label: 'SCA 90+' },
      { type: 'organic', label: 'Orgânico' }
    ],
    roastLevel: 'light',
    estimatedDelivery: '1-2 dias úteis',
    isFavorite: true,
    isOnSale: false,
    freeShipping: true
  },
  {
    id: '3',
    name: 'Blend Tradicional',
    origin: 'Sul de Minas',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 234,
    isInStock: false,
    stockCount: 0,
    flavorNotes: ['Nozes', 'Chocolate', 'Baunilha'],
    badges: [
      { type: 'new', label: 'Bestseller' }
    ],
    roastLevel: 'dark',
    estimatedDelivery: '3-5 dias úteis',
    isFavorite: false,
    isOnSale: false
  },
  {
    id: '4',
    name: 'Catuaí Vermelho',
    origin: 'Mogiana Paulista',
    price: 59.90,
    originalPrice: 69.90,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    isInStock: true,
    stockCount: 23,
    flavorNotes: ['Açúcar Mascavo', 'Amêndoas', 'Cítricos'],
    badges: [
      { type: 'organic', label: 'Sustentável' }
    ],
    roastLevel: 'medium',
    estimatedDelivery: '2-4 dias úteis',
    isFavorite: false,
    isOnSale: true,
    freeShipping: false
  },
  {
    id: '5',
    name: 'Icatu Experimental',
    origin: 'Mantiqueira de Minas',
    price: 79.90,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 93,
    isInStock: true,
    stockCount: 12,
    flavorNotes: ['Frutas Tropicais', 'Especiarias', 'Cacau'],
    badges: [
      { type: 'limited', label: 'Experimental' },
      { type: 'new', label: 'Fermentação Controlada' }
    ],
    roastLevel: 'light',
    estimatedDelivery: '1-3 dias úteis',
    isFavorite: true,
    isOnSale: false,
    freeShipping: true
  },
  {
    id: '6',
    name: 'Mundo Novo Clássico',
    origin: 'Alta Paulista',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    rating: 4.4,
    reviewCount: 178,
    isInStock: true,
    stockCount: 31,
    flavorNotes: ['Chocolate Amargo', 'Nozes', 'Especiarias'],
    badges: [
      { type: 'premium', label: 'Clássico' }
    ],
    roastLevel: 'dark',
    estimatedDelivery: '2-4 dias úteis',
    isFavorite: false,
    isOnSale: false,
    freeShipping: false
  }
];

const ProductGridDemo: React.FC = () => {
  const handleAddToCart = (productId: string) => {
    console.log('Adicionando ao carrinho:', productId);
    // Aqui você implementaria a lógica de adicionar ao carrinho
  };

  const handleToggleFavorite = (productId: string) => {
    console.log('Alternando favorito:', productId);
    // Aqui você implementaria a lógica de favoritar/desfavoritar
  };

  const handleQuickView = (productId: string) => {
    console.log('Visualização rápida:', productId);
    // Aqui você implementaria a lógica de visualização rápida
  };

  const handleProductClick = (productId: string) => {
    console.log('Clicou no produto:', productId);
    // Aqui você implementaria a navegação para página do produto
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filtros alterados:', filters);
    // Aqui você implementaria a lógica de filtros
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    console.log('Ordenação alterada:', sortBy, sortOrder);
    // Aqui você implementaria a lógica de ordenação
  };

  const handleSearch = (query: string) => {
    console.log('Busca realizada:', query);
    // Aqui você implementaria a lógica de busca
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="coffee-heading-2 coffee-text-neutral-800 mb-2">
          Demonstração do Product Grid
        </h1>
        <p className="coffee-body coffee-text-neutral-600">
          Componente completo de grade de produtos com funcionalidades de busca, filtros, ordenação e diferentes layouts.
        </p>
      </div>

      <div className="space-y-12">
        {/* Grid padrão */}
        <section>
          <h2 className="coffee-heading-4 coffee-text-neutral-800 mb-4">
            Grade Padrão (4 colunas)
          </h2>
          <ProductGrid
            products={mockProducts}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
          />
        </section>

        {/* Grid compacto */}
        <section>
          <h2 className="coffee-heading-4 coffee-text-neutral-800 mb-4">
            Grade Compacta (5 colunas)
          </h2>
          <ProductGrid
            products={mockProducts}
            columns={5}
            cardSize="sm"
            cardVariant="compact"
            showFlavorNotes={false}
            showEstimatedDelivery={false}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
          />
        </section>

        {/* Grid premium */}
        <section>
          <h2 className="coffee-heading-4 coffee-text-neutral-800 mb-4">
            Grade Premium (3 colunas)
          </h2>
          <ProductGrid
            products={mockProducts}
            columns={3}
            cardSize="lg"
            cardVariant="premium"
            gap="lg"
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
          />
        </section>

        {/* Grid com loading */}
        <section>
          <h2 className="coffee-heading-4 coffee-text-neutral-800 mb-4">
            Estado de Carregamento
          </h2>
          <ProductGrid
            products={[]}
            isLoading={true}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
            onProductClick={handleProductClick}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSearch={handleSearch}
          />
        </section>
      </div>
    </div>
  );
};

export { ProductGridDemo };
export default ProductGridDemo;