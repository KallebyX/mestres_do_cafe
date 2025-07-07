import { ProductGridDemo } from '@mestres-cafe/ui';
import React from 'react';

const ProductCardsDemo = () => {
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
          <ProductGridDemo />
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