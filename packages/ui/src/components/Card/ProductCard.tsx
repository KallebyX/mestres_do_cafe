import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';
import { 
  Heart, 
  Star, 
  MapPin, 
  Eye, 
  ShoppingCart,
  Award,
  Truck,
  Clock,
  Flame,
  Coffee,
  Leaf,
  Tag
} from 'lucide-react';

export interface ProductCardProps {
  /** Dados do produto */
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    images?: string[];
    origin: string;
    rating: number;
    reviewCount: number;
    isInStock: boolean;
    stockCount?: number;
    isLowStock?: boolean;
    badges?: Array<{
      type: 'sca' | 'organic' | 'premium' | 'limited' | 'new';
      label: string;
      color?: string;
    }>;
    flavorNotes: string[];
    roastLevel: 'light' | 'medium' | 'dark';
    isFavorite?: boolean;
    isOnSale?: boolean;
    freeShipping?: boolean;
    estimatedDelivery?: string;
  };
  
  /** Configurações do card */
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'compact';
  showQuickView?: boolean;
  showFavorite?: boolean;
  showBadges?: boolean;
  showRating?: boolean;
  showFlavorNotes?: boolean;
  showEstimatedDelivery?: boolean;
  
  /** Estados */
  isLoading?: boolean;
  isDisabled?: boolean;
  
  /** Callbacks */
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onClick?: (productId: string) => void;
  
  /** Props adicionais */
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  size = 'md',
  variant = 'default',
  showQuickView = true,
  showFavorite = true,
  showBadges = true,
  showRating = true,
  showFlavorNotes = true,
  showEstimatedDelivery = true,
  isLoading = false,
  isDisabled = false,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  onClick,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Lazy loading da imagem
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = product.image;
          observer.unobserve(img);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [product.image]);

  // Rotação de imagens no hover
  useEffect(() => {
    if (!isHovered || !product.images || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, product.images]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || isAddingToCart || !product.isInStock) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id);
      // Feedback visual de sucesso
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite) return;
    onToggleFavorite(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onQuickView) return;
    onQuickView(product.id);
  };

  const handleClick = () => {
    if (!onClick || isDisabled) return;
    onClick(product.id);
  };

  // Cálculo do desconto
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  // Classes do componente
  const cardClasses = cn(
    // Base
    'group relative overflow-hidden rounded-xl border coffee-transition-normal',
    'coffee-bg-neutral-100 coffee-border-neutral-200',
    
    // Variantes
    {
      'coffee-shadow-md hover:coffee-shadow-lg': variant === 'default',
      'coffee-shadow-lg hover:coffee-shadow-premium': variant === 'premium',
      'coffee-shadow-sm hover:coffee-shadow-md': variant === 'compact',
    },
    
    // Tamanhos
    {
      'w-full max-w-[280px]': size === 'sm',
      'w-full max-w-[320px]': size === 'md',
      'w-full max-w-[380px]': size === 'lg',
    },
    
    // Estados
    {
      'coffee-hover-lift cursor-pointer': !isDisabled && onClick,
      'opacity-50 cursor-not-allowed': isDisabled,
      'coffee-state-loading': isLoading,
    },
    
    className
  );

  const roastLevelColors = {
    light: 'from-coffee-support-light to-coffee-secondary-accent',
    medium: 'from-coffee-secondary-light to-coffee-primary-light',
    dark: 'from-coffee-primary-dark to-coffee-neutral-700'
  };

  const badgeColors = {
    sca: 'coffee-bg-primary-light text-white',
    organic: 'coffee-bg-support-warm text-white',
    premium: 'coffee-bg-secondary-accent text-white',
    limited: 'coffee-bg-error text-white',
    new: 'coffee-bg-success text-white'
  };

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Container da imagem */}
      <div className="relative aspect-square overflow-hidden">
        {/* Imagem principal */}
        <img
          ref={imgRef}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover coffee-transition-slow',
            'group-hover:scale-105',
            {
              'opacity-0': !imageLoaded,
              'opacity-100': imageLoaded
            }
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Overlay de hover com imagens adicionais */}
        {product.images && product.images.length > 1 && (
          <div className={cn(
            'absolute inset-0 coffee-transition-normal',
            'opacity-0 group-hover:opacity-100'
          )}>
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 coffee-bg-neutral-200 coffee-animate-shimmer">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}

        {/* Badges */}
        {showBadges && product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.badges.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  'coffee-transition-normal coffee-animate-fade-in',
                  badgeColors[badge.type] || 'coffee-bg-neutral-600 text-white'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {badge.type === 'sca' && <Award className="w-3 h-3 inline mr-1" />}
                {badge.type === 'organic' && <Leaf className="w-3 h-3 inline mr-1" />}
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {/* Desconto */}
        {product.isOnSale && discountPercentage > 0 && (
          <div className="absolute top-3 right-3">
            <div className="coffee-bg-error text-white px-2 py-1 rounded-full text-xs font-bold">
              -{discountPercentage}%
            </div>
          </div>
        )}

        {/* Ações do hover */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'coffee-transition-normal',
          'opacity-0 group-hover:opacity-100',
          'bg-black/20 backdrop-blur-sm'
        )}>
          <div className="flex gap-2">
            {/* Quick View */}
            {showQuickView && (
              <button
                onClick={handleQuickView}
                className={cn(
                  'p-2 rounded-full coffee-bg-neutral-100 text-coffee-neutral-800',
                  'coffee-hover-scale coffee-transition-normal',
                  'hover:coffee-bg-primary-light hover:text-white'
                )}
                title="Visualização rápida"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {/* Favorito */}
            {showFavorite && (
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'p-2 rounded-full coffee-transition-normal',
                  'coffee-hover-scale',
                  product.isFavorite 
                    ? 'coffee-bg-error text-white' 
                    : 'coffee-bg-neutral-100 text-coffee-neutral-800 hover:coffee-bg-error hover:text-white'
                )}
                title={product.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={cn('w-4 h-4', product.isFavorite && 'fill-current')} />
              </button>
            )}
          </div>
        </div>

        {/* Indicador de estoque baixo */}
        {product.isLowStock && product.isInStock && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="coffee-bg-warning text-white px-3 py-1 text-xs font-medium">
              <Clock className="w-3 h-3 inline mr-1" />
              Últimas unidades!
            </div>
          </div>
        )}

        {/* Indicador de fora de estoque */}
        {!product.isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="coffee-bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium">
              Fora de estoque
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="p-4 space-y-3">
        {/* Origem geográfica */}
        <div className="flex items-center text-coffee-neutral-600 coffee-body-small">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{product.origin}</span>
        </div>

        {/* Nome do produto */}
        <h3 className="coffee-heading-6 coffee-font-display coffee-text-neutral-800 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(product.rating)
                      ? 'text-coffee-secondary-accent fill-current'
                      : 'text-coffee-neutral-300'
                  )}
                />
              ))}
            </div>
            <span className="coffee-body-small coffee-text-neutral-600">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Notas de sabor */}
        {showFlavorNotes && product.flavorNotes && product.flavorNotes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.flavorNotes.slice(0, 3).map((note, index) => (
              <span
                key={index}
                className="px-2 py-1 coffee-bg-neutral-200 coffee-text-neutral-700 rounded-full text-xs"
              >
                {note}
              </span>
            ))}
            {product.flavorNotes.length > 3 && (
              <span className="px-2 py-1 coffee-bg-neutral-200 coffee-text-neutral-700 rounded-full text-xs">
                +{product.flavorNotes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Nível de torra */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Coffee className="w-4 h-4 coffee-text-primary-light" />
            <span className="coffee-body-small coffee-text-neutral-600">
              Torra {product.roastLevel === 'light' ? 'Clara' : product.roastLevel === 'medium' ? 'Média' : 'Escura'}
            </span>
          </div>
          <div className={cn(
            'flex-1 h-2 rounded-full bg-gradient-to-r',
            roastLevelColors[product.roastLevel]
          )} />
        </div>

        {/* Preço */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="coffee-body-small coffee-text-neutral-500 line-through">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="coffee-heading-6 coffee-text-primary-light">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          
          {product.freeShipping && (
            <div className="flex items-center text-coffee-success coffee-body-small">
              <Truck className="w-3 h-3 mr-1" />
              Frete grátis
            </div>
          )}
        </div>

        {/* Entrega estimada */}
        {showEstimatedDelivery && product.estimatedDelivery && (
          <div className="flex items-center coffee-body-small coffee-text-neutral-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>Entrega em {product.estimatedDelivery}</span>
          </div>
        )}

        {/* Botão de adicionar ao carrinho */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isInStock || isAddingToCart}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium coffee-transition-normal',
            'flex items-center justify-center gap-2',
            'coffee-hover-scale focus:coffee-focus-ring',
            product.isInStock
              ? 'coffee-bg-primary-light text-white hover:coffee-bg-primary-medium'
              : 'coffee-bg-neutral-300 coffee-text-neutral-500 cursor-not-allowed'
          )}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adicionando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {product.isInStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;