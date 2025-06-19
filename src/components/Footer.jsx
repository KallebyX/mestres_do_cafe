import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-coffee-intense text-coffee-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center">
                <span className="text-coffee-white font-cormorant font-bold text-xl">M</span>
              </div>
              <div>
                <h3 className="font-cormorant font-bold text-xl">Mestres do Café</h3>
                <span className="text-coffee-gold text-xs">Torrefação Artesanal</span>
              </div>
            </Link>
            <p className="text-coffee-white/80 text-sm leading-relaxed">
              Há mais de 5 anos dedicados à arte da torrefação, levando o melhor café 
              especial de Santa Maria para todo o Brasil.
            </p>
          </div>

          {/* Links Principais */}
          <div>
            <h4 className="font-cormorant font-bold text-lg mb-4 text-coffee-gold">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Cursos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-cormorant font-bold text-lg mb-4 text-coffee-gold">
              Suporte
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Contato
                </Link>
              </li>
              <li>
                <a href="#" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm">
                  Trocas e Devoluções
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-cormorant font-bold text-lg mb-4 text-coffee-gold">
              Contato
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-coffee-gold">📍</span>
                <span className="text-coffee-white/80 text-sm">Santa Maria - RS, Brasil</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-coffee-gold">📱</span>
                <a 
                  href="https://wa.me/5555996458600" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm"
                >
                  (55) 99645-8600
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-coffee-gold">✉️</span>
                <a 
                  href="mailto:contato@mestrescafe.com.br"
                  className="text-coffee-white/80 hover:text-coffee-gold transition-colors text-sm"
                >
                  contato@mestrescafe.com.br
                </a>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="mt-6">
              <h5 className="font-medium mb-3 text-coffee-gold">Siga-nos</h5>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/mestresdocafe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-coffee-white/80 hover:text-coffee-gold transition-colors"
                >
                  📷
                </a>
                <a 
                  href="https://facebook.com/mestresdocafe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-coffee-white/80 hover:text-coffee-gold transition-colors"
                >
                  📘
                </a>
                <a 
                  href="#" 
                  className="text-coffee-white/80 hover:text-coffee-gold transition-colors"
                >
                  🐦
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-coffee-gold/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-coffee-white/60 text-sm">
              © 2024 Mestres do Café. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-coffee-white/60 text-sm">Desenvolvido com ☕ em Santa Maria</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

