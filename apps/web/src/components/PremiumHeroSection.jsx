import {
  ArrowRight,
  Award,
  Coffee,
  Leaf,
  MapPin,
  Star,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const PremiumHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const highlights = [
    { icon: <Award className="w-5 h-5" />, text: "SCA 85+" },
    { icon: <Leaf className="w-5 h-5" />, text: "100% Arabica" },
    { icon: <MapPin className="w-5 h-5" />, text: "Minas Gerais" },
  ];

  return (
    <section className={`relative min-h-[90vh] overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-white'
    }`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b58150' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">

            {/* Content Side */}
            <div className={`space-y-8 text-center lg:text-left ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-brown/10 rounded-full">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  ))}
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  +500 clientes satisfeitos
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span className={`block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cafe Especial
                  </span>
                  <span className="block text-brand-brown">
                    Direto da Origem
                  </span>
                </h1>

                <p className={`text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Selecionamos os melhores graos das montanhas de Minas Gerais.
                  Torragem artesanal semanal para o maximo frescor e sabor.
                </p>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                      isDark
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                        : 'bg-white/80 border-gray-200 text-gray-700 shadow-sm'
                    }`}
                  >
                    <span className="text-brand-brown">{item.icon}</span>
                    <span className="text-sm font-semibold">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/marketplace">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
                  >
                    Explorar Cafes
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link to="/sobre">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Nossa Historia
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className={`flex items-center justify-center lg:justify-start gap-6 pt-4 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm">Frete gratis +R$200</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm">Pagamento seguro</span>
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div className={`relative ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
              <div className="relative max-w-lg mx-auto lg:max-w-none">

                {/* Main Image Container */}
                <div className={`relative aspect-square rounded-3xl overflow-hidden shadow-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-amber-100 to-orange-100'
                }`}>
                  <img
                    src="/caneca-mestres-cafe.svg"
                    alt="Cafe Especial Mestres do Cafe"
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className={`hidden w-full h-full items-center justify-center ${
                    isDark ? 'bg-gray-800' : 'bg-amber-50'
                  }`}>
                    <Coffee className="w-32 h-32 text-brand-brown/40" />
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Floating Card - SCA Score */}
                <div className={`absolute -top-4 -right-4 lg:top-8 lg:-right-8 p-4 rounded-2xl shadow-xl ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-brown/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-brand-brown" />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>85+</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pontos SCA</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card - Fresh Roast */}
                <div className={`absolute -bottom-4 -left-4 lg:bottom-8 lg:-left-8 p-4 rounded-2xl shadow-xl ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Torra Fresca</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Semanal</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave/Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-auto ${isDark ? 'text-gray-900' : 'text-white'}`}
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default PremiumHeroSection;
