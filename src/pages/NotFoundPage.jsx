import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#2B3A42] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-[#C8956D] mb-4">404</div>
          <div className="text-6xl">☕</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Ops! Parece que esta página não existe ou foi movida. 
          Que tal voltar para o início e explorar nossos cafés especiais?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#C8956D] text-[#2B3A42] px-6 py-3 rounded-lg font-semibold hover:bg-[#C8956D]/90 transition-colors inline-flex items-center justify-center"
          >
            <Home className="mr-2" size={20} />
            Voltar ao Início
          </Link>
          
          <Link
            to="/marketplace"
            className="border-2 border-[#C8956D] text-[#C8956D] px-6 py-3 rounded-lg font-semibold hover:bg-[#C8956D] hover:text-[#2B3A42] transition-colors inline-flex items-center justify-center"
          >
            Ver Marketplace
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-[#1A2328] rounded-lg">
          <h3 className="text-white font-semibold mb-3">Precisa de ajuda?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Se você chegou aqui através de um link, entre em contato conosco.
          </p>
          <div className="text-[#C8956D] text-sm">
            <p>📞 (55) 99645-8600</p>
            <p>✉️ contato@mestrescafe.com.br</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

