import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand and About */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="mb-5 group"
              aria-label="Mestres do Café - Página Inicial"
            >
              <Logo size="large" showText={true} variant="dark" textColor="text-white group-hover:text-brand-brown transition-colors" />
            </Link>
            <p className="text-brand-light/80 mb-6 max-w-md text-sm leading-relaxed">
              Conectando você aos melhores cafés especiais do Brasil. Qualidade, tradição e sabor em cada xícara, desde
              2019.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/mestresdocafe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Marketplace", href: "/marketplace" },
                { label: "Gamificação", href: "/gamificacao" },
                { label: "Cursos", href: "/cursos" },
                { label: "Blog", href: "/blog" },
                { label: "Sobre Nós", href: "/sobre" },
                { label: "Contato", href: "/contato" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-brand-light/80 hover:text-brand-brown transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base font-semibold mb-4 uppercase tracking-wider">Contato</h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:financeiro.mestresdocafe@gmail.com"
                  className="text-brand-light/80 hover:text-brand-brown break-all transition-colors"
                >
                  financeiro.mestresdocafe@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <a href="tel:+55996458600" className="text-brand-light/80 hover:text-brand-brown transition-colors">
                  (55) 99645-8600
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <span className="text-brand-light/80">Rua Riachuelo 351, Sala 102. Centro, Santa Maria / RS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-light/10 mt-10 pt-8 text-center">
          <p className="text-xs text-brand-light/60">
            © {currentYear} Mestres do Café. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
          </p>
        </div>
      </div>
    </footer>
  );
};

