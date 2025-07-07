import { ArrowUpDown, LayoutGrid, List, Search } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../utils';
import ProductCard, { ProductCardProps } from './ProductCard';

interface ProductGridProps {
  products: ProductCardProps['product'][];
  
  /** Layout */
  layout?: 'grid' | 'list';
  columns?: 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  
  /** Configurações dos cards */
  cardSize?: 'sm' | 'md' | 'lg';
  cardVariant?: 'default' | 'premium' | 'compact';
  showQuickView?: boolean;
  showFavorite?: boolean;
  showBadges?: boolean;
  showRating?: boolean;
  showFlavorNotes?: boolean;
  showEstimatedDelivery?: boolean;
  
  /** Filtros e ordenação */
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  
  /** Estados */
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  
  /** Callbacks */
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  onFilterChange?: (filters: any) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  
  /** Props adicionais */
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  layout = 'grid',
  columns = 4,
  gap = 'md',
  cardSize = 'md',
  cardVariant = 'default',
  showQuickView = true,
  showFavorite = true,
  showBadges = true,
  showRating = true,
  showFlavorNotes = true,
  showEstimatedDelivery = true,
  showFilters = true,
  showSearch = true,
  showSorting = true,
  isLoading = false,
  emptyState,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onProductClick,
  onFilterChange,
  onSortChange,
  onSearch,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [currentColumns, setCurrentColumns] = useState(columns);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query) ||
        product.flavorNotes.some(note => note.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortBy as keyof typeof a];
    let bValue: any = b[sortBy as keyof typeof b];
    
    if (sortBy === 'price') {
      aValue = a.price;
      bValue = b.price;
    } else if (sortBy === 'rating') {
      aValue = a.rating;
      bValue = b.rating;
    } else if (sortBy === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Barra de controles */}
      {(showSearch || showSorting || showFilters) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Busca */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border coffee-border-neutral-300 rounded-lg',
                  'coffee-bg-neutral-100 coffee-text-neutral-800',
                  'focus:outline-none focus:ring-2 focus:ring-coffee-primary-light/50',
                  'coffee-transition-normal'
                )}
              />
            </div>
          )}

          {/* Controles de layout e ordenação */}
          <div className="flex items-center gap-3">
            {/* Layout toggle */}
            <div className="flex items-center border coffee-border-neutral-300 rounded-lg p-1">
              <button
                onClick={() => setCurrentLayout('grid')}
                title="Visualização em grade"
                aria-label="Visualização em grade"
                className={cn(
                  'p-2 rounded coffee-transition-normal',
                  currentLayout === 'grid'
                    ? 'coffee-bg-primary-light text-white'
                    : 'text-coffee-neutral-600 hover:coffee-bg-neutral-200'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentLayout('list')}
                title="Visualização em lista"
                aria-label="Visualização em lista"
                className={cn(
                  'p-2 rounded coffee-transition-normal',
                  currentLayout === 'list'
                    ? 'coffee-bg-primary-light text-white'
                    : 'text-coffee-neutral-600 hover:coffee-bg-neutral-200'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Colunas (apenas para grid) */}
            {currentLayout === 'grid' && (
              <div className="flex items-center gap-1">
                {[2, 3, 4, 5].map((col) => (
                  <button
                    key={col}
                    onClick={() => setCurrentColumns(col as any)}
                    className={cn(
                      'px-2 py-1 rounded coffee-transition-normal text-sm',
                      currentColumns === col
                        ? 'coffee-bg-primary-light text-white'
                        : 'text-coffee-neutral-600 hover:coffee-bg-neutral-200'
                    )}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}

            {/* Ordenação */}
            {showSorting && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-coffee-neutral-600" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                    onSortChange?.(newSortBy, newSortOrder as 'asc' | 'desc');
                  }}
                  title="Ordenar produtos"
                  aria-label="Ordenar produtos"
                  className={cn(
                    'border coffee-border-neutral-300 rounded-lg px-3 py-2',
                    'coffee-bg-neutral-100 coffee-text-neutral-800',
                    'focus:outline-none focus:ring-2 focus:ring-coffee-primary-light/50',
                    'coffee-transition-normal'
                  )}
                >
                  <option value="name-asc">Nome A-Z</option>
                  <option value="name-desc">Nome Z-A</option>
                  <option value="price-asc">Preço: Menor</option>
                  <option value="price-desc">Preço: Maior</option>
                  <option value="rating-desc">Melhor Avaliado</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="mb-4">
        <p className="coffee-body-small coffee-text-neutral-600">
          {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      </div>

      {/* Grid de produtos */}
      {isLoading ? (
        <div className={cn(
          'grid',
          gridClasses[currentColumns],
          gapClasses[gap]
        )}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="coffee-animate-shimmer">
              <div className="aspect-square coffee-bg-neutral-200 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 coffee-bg-neutral-200 rounded w-3/4" />
                <div className="h-4 coffee-bg-neutral-200 rounded w-1/2" />
                <div className="h-6 coffee-bg-neutral-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          {emptyState || (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto coffee-bg-neutral-200 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-coffee-neutral-400" />
              </div>
              <div>
                <h3 className="coffee-heading-5 coffee-text-neutral-700 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="coffee-body coffee-text-neutral-600">
                  Tente ajustar seus filtros ou termo de busca
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          currentLayout === 'grid' ? 'grid' : 'flex flex-col',
          currentLayout === 'grid' && gridClasses[currentColumns],
          gapClasses[gap]
        )}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size={cardSize}
              variant={cardVariant}
              showQuickView={showQuickView}
              showFavorite={showFavorite}
              showBadges={showBadges}
              showRating={showRating}
              showFlavorNotes={showFlavorNotes}
              showEstimatedDelivery={showEstimatedDelivery}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              onQuickView={onQuickView}
              onClick={onProductClick}
              className={cn(
                'coffee-animate-fade-in',
                currentLayout === 'list' && 'max-w-none'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;