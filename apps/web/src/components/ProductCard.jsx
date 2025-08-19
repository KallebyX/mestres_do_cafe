import React from 'react';
import { Coffee, Star } from 'lucide-react';

const ProductCard = ({ product, className = '' }) => {
  const {
    name,
    score,
    origin,
    profile,
    notes,
    sizes
  } = product;

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      {/* Header com nome e pontuação */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
          {score}
        </div>
      </div>
      
      {/* Origem */}
      <div className="text-amber-600 text-sm font-medium mb-4">
        {origin}
      </div>
      
      {/* Perfil sensorial */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium">Corpo:</span> {profile.body}
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium">Acidez:</span> {profile.acidity}
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium">Doçura:</span> {profile.sweetness}
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium">Intensidade:</span> {profile.intensity}
          </div>
        </div>
      </div>
      
      {/* Notas sensoriais */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Notas Sensoriais:</div>
        <div className="flex flex-wrap gap-1">
          {notes.map((note, noteIndex) => (
            <span key={noteIndex} className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">
              {note}
            </span>
          ))}
        </div>
      </div>
      
      {/* Tamanhos disponíveis */}
      <div className="border-t pt-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Tamanhos Disponíveis:</div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, sizeIndex) => (
            <span key={sizeIndex} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
