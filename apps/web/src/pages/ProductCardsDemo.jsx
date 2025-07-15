import React from 'react';
import { Coffee, Star, ShoppingCart } from 'lucide-react';

const ProductCardsDemo = () => {
  // Mock products for demo
  const mockProducts = [
    {
      id: 1,
      name: "Café Premium Arábica",
      price: 45.90,
      originalPrice: 55.90,
      rating: 4.8,
      image: "☕",
      description: "Café especial com notas frutadas"
    },
    {
      id: 2,
      name: "Blend Especial",
      price: 38.90,
      rating: 4.6,
      image: "☕",
      description: "Mistura equilibrada para todos os momentos"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cards de Produtos Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo de cards de produtos com design premium, otimizado para máxima conversão em e-commerce de cafés especiais.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-amber-50 flex items-center justify-center text-6xl">
                  {product.image}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">R$ {product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">R$ {product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Características dos Cards
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Design Premium</h3>
              <p className="text-gray-600">
                Visual sofisticado com hover effects elegantes e transições suaves que transmitem qualidade premium.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Otimizado para Conversão</h3>
              <p className="text-gray-600">
                Elementos estrategicamente posicionados para maximizar vendas: preços destacados, badges de qualidade e CTAs claros.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Múltiplos Layouts</h3>
              <p className="text-gray-600">
                Suporte a visualização em grade e lista com diferentes densidades de informação.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Estados Inteligentes</h3>
              <p className="text-gray-600">
                Gerenciamento automático de estoque baixo, produtos indisponíveis e estados de loading.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Funcionalidades Avançadas</h3>
              <p className="text-gray-600">
                Busca, filtros, ordenação, favoritos, visualização rápida e sistema de badges certificados.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-amber-600">
              <h3 className="font-semibold text-lg mb-2">Performance Otimizada</h3>
              <p className="text-gray-600">
                Lazy loading de imagens, animações responsivas e estrutura otimizada para SEO.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Componentes desenvolvidos com React + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCardsDemo;