import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Coffee, ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, className = '', onAddToCart, showActions = true }) => {
  const {
    id,
    name,
    score,
    origin,
    profile,
    notes,
    sizes,
    price,
    originalPrice,
    image,
    producer,
    isNew,
    isBestseller,
    discount
  } = product;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const discountPercentage = originalPrice && price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount;

  return (
    <div className={`group card-interactive overflow-hidden ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Product Image */}
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-coffee-100 to-coffee-200">
            <Coffee className="w-16 h-16 text-coffee-400" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="badge bg-success-500 text-white text-xs px-2.5 py-1">
              Novo
            </span>
          )}
          {isBestseller && (
            <span className="badge bg-brand-brown text-white text-xs px-2.5 py-1">
              Mais Vendido
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="badge bg-error-500 text-white text-xs px-2.5 py-1">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Score Badge */}
        {score && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-md">
            <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
            <span className="text-sm font-bold text-foreground">{score}</span>
          </div>
        )}

        {/* Quick Actions */}
        {showActions && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Link
              to={`/produto/${id}`}
              className="flex-1 btn-secondary bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-2.5 text-sm justify-center"
            >
              <Eye className="w-4 h-4" />
              Ver Detalhes
            </Link>
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="btn-primary p-2.5"
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Origin */}
        {origin && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{origin}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 group-hover:text-brand-brown transition-colors">
          {name}
        </h3>

        {/* Producer */}
        {producer && (
          <p className="text-sm text-muted-foreground">
            por <span className="font-medium text-brand-brown">{producer}</span>
          </p>
        )}

        {/* Sensory Notes */}
        {notes && notes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {notes.slice(0, 3).map((note, index) => (
              <span
                key={index}
                className="badge-primary text-xs"
              >
                {note}
              </span>
            ))}
            {notes.length > 3 && (
              <span className="badge-secondary text-xs">
                +{notes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Sensory Profile - Compact Version */}
        {profile && (
          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {[
              { label: 'Corpo', value: profile.body },
              { label: 'Acidez', value: profile.acidity },
              { label: 'Docura', value: profile.sweetness },
              { label: 'Intens.', value: profile.intensity }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                <div className="text-xs font-semibold text-foreground">{item.value || '-'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sizes */}
        {sizes && sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sizes.map((size, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        {price !== undefined && (
          <div className="flex items-end gap-2 pt-2 border-t border-border">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
