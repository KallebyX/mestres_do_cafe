import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A2328] border-t border-[#C8956D]/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#C8956D] rounded-full flex items-center justify-center">
                <span className="text-[#2B3A42] font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">Mestres do Café</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Torrefação artesanal de cafés especiais em Santa Maria - RS. 
              Mais de 5 anos de experiência levando o melhor café até você.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <MapPin size={16} className="mr-2 text-[#C8956D]" />
                <span className="text-sm">Santa Maria - RS</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone size={16} className="mr-2 text-[#C8956D]" />
                <span className="text-sm">(55) 99645-8600</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail size={16} className="mr-2 text-[#C8956D]" />
                <span className="text-sm">contato@mestrescafe.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de Separação */}
        <div className="border-t border-[#C8956D]/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Mestres do Café. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C8956D] transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

