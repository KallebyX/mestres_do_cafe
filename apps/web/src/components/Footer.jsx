import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram, Facebook, Linkedin, Youtube,
  Mail, Phone, MapPin, Coffee, Heart,
  CreditCard, Shield, Truck, ArrowUpRight
} from 'lucide-react';
import Logo from './Logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Clube dos Mestres", href: "/gamificacao" },
    { label: "Cursos", href: "/cursos" },
    { label: "Blog", href: "/blog" },
  ];

  const institutionalLinks = [
    { label: "Sobre Nos", href: "/sobre" },
    { label: "Contato", href: "/contato" },
    { label: "Termos de Uso", href: "/termos" },
    { label: "Politica de Privacidade", href: "/privacidade" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/mestresdocafe", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/mestresdocafe", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/mestresdocafe", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/mestresdocafe", label: "YouTube" },
  ];

  const features = [
    { icon: Truck, text: "Frete Gratis acima de R$150" },
    { icon: Shield, text: "Compra Segura" },
    { icon: CreditCard, text: "Ate 12x sem juros" },
  ];

  return (
    <footer className="bg-brand-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-coffee-pattern opacity-5" />

      {/* Features Bar */}
      <div className="relative border-b border-white/10">
        <div className="container-responsive py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center sm:justify-start gap-3 text-sm"
              >
                <div className="w-10 h-10 rounded-full bg-brand-brown/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-brand-brown" />
                </div>
                <span className="text-white/90">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container-responsive py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6 group" aria-label="Mestres do Cafe - Pagina Inicial">
              <Logo size="large" showText={true} variant="dark" />
            </Link>

            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              Conectando voce aos melhores cafes especiais do Brasil.
              Qualidade, tradicao e sabor em cada xicara, desde 2019.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="footer-social w-10 h-10"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Navegacao
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-brand-brown transition-colors duration-200 text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Institucional
            </h4>
            <ul className="space-y-3">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-brand-brown transition-colors duration-200 text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5">
              Contato
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:financeiro.mestresdocafe@gmail.com"
                  className="flex items-start gap-3 text-white/70 hover:text-brand-brown transition-colors duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-brown/20 transition-colors">
                    <Mail className="w-4 h-4 text-brand-brown" />
                  </div>
                  <div className="pt-1.5">
                    <span className="text-sm break-all">financeiro.mestresdocafe@gmail.com</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+5555996458600"
                  className="flex items-start gap-3 text-white/70 hover:text-brand-brown transition-colors duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-brown/20 transition-colors">
                    <Phone className="w-4 h-4 text-brand-brown" />
                  </div>
                  <div className="pt-1.5">
                    <span className="text-sm">(55) 99645-8600</span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-brown" />
                </div>
                <div className="pt-1.5">
                  <span className="text-sm">
                    Rua Riachuelo 351, Sala 102<br />
                    Centro, Santa Maria / RS
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-md">
              <h4 className="text-lg font-semibold text-white mb-2">
                Receba novidades exclusivas
              </h4>
              <p className="text-sm text-white/60">
                Cadastre-se e receba ofertas, dicas de preparo e novos cafes em primeira mao.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 lg:w-72 px-4 py-3 rounded-xl bg-white/10 border border-white/10
                         text-white placeholder:text-white/40 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-brown focus:border-transparent
                         transition-all duration-200"
              />
              <button className="btn-primary whitespace-nowrap px-6 py-3">
                <Coffee className="w-4 h-4" />
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="container-responsive py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-xs text-white/50">
              {currentYear} Mestres do Cafe. Todos os direitos reservados.
              <span className="hidden sm:inline"> CNPJ: 00.000.000/0001-00</span>
            </p>
            <p className="text-xs text-white/50 flex items-center gap-1">
              Feito com <Heart className="w-3 h-3 text-error-500 fill-error-500" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
