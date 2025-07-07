import {
  ArrowRight,
  Award,
  CheckCircle,
  Coffee,
  Heart,
  Play,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const PremiumHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    
    // Rotação automática de depoimentos
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const certifications = [
    { name: "SCA Certified", icon: <Award className="w-4 h-4" />, color: "text-amber-600" },
    { name: "Organic", icon: <Shield className="w-4 h-4" />, color: "text-green-600" },
    { name: "Fair Trade", icon: <Heart className="w-4 h-4" />, color: "text-red-500" },
    { name: "BSCA", icon: <Trophy className="w-4 h-4" />, color: "text-blue-600" }
  ];

  const testimonials = [
    {
      quote: "O melhor café que já experimentei. Cada xícara é uma experiência única!",
      author: "Maria Silva",
      role: "Barista Profissional",
      rating: 5
    },
    {
      quote: "Qualidade excepcional. Transformou minha rotina matinal completamente.",
      author: "João Santos",
      role: "Coffee Lover",
      rating: 5
    },
    {
      quote: "Nunca imaginei que café pudesse ter tantas nuances de sabor. Impressionante!",
      author: "Ana Costa",
      role: "Sommelier de Café",
      rating: 5
    }
  ];

  const stats = [
    { number: "95%", label: "Clientes Satisfeitos", icon: <Users className="w-5 h-5" /> },
    { number: "85+", label: "Pontuação SCA", icon: <Award className="w-5 h-5" /> },
    { number: "50+", label: "Cafés Especiais", icon: <Coffee className="w-5 h-5" /> },
    { number: "5★", label: "Avaliação Média", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <section className={`relative min-h-screen overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark
            ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20'
            : 'bg-gradient-to-br from-amber-200/40 to-pink-200/40'
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          isDark
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
            : 'bg-gradient-to-br from-yellow-200/40 to-orange-200/40'
        }`} style={{ animationDelay: '1s' }}></div>
        
        {/* Coffee Bean Shapes */}
        <div className={`absolute top-20 left-10 w-3 h-3 rounded-full animate-float ${
          isDark ? 'bg-brand-brown/40' : 'bg-brand-brown/20'
        }`}></div>
        <div className={`absolute top-40 right-20 w-2 h-2 rounded-full animate-float ${
          isDark ? 'bg-brand-brown/50' : 'bg-brand-brown/30'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-32 left-20 w-4 h-4 rounded-full animate-float ${
          isDark ? 'bg-brand-brown/30' : 'bg-brand-brown/15'
        }`} style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-20 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Content Side */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              
              {/* Certifications Badge */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {certifications.map((cert, index) => (
                  <div
                    key={cert.name}
                    className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${
                      isDark ? 'bg-gray-800/80' : 'bg-white/80'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className={cert.color}>{cert.icon}</span>
                    <span className={`text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{cert.name}</span>
                  </div>
                ))}
              </div>

              {/* Main Headline */}
              <div className="text-center lg:text-left space-y-4">
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${isVisible ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
                  <span className={`block font-serif mb-2 ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    Desperte Seus
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-orange-700 font-serif">
                    Sentidos
                  </span>
                </h1>
                
                <p className={`text-xl lg:text-2xl mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isVisible ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'} ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Cafés especiais que contam histórias únicas do grão à xícara
                </p>

                <div className={`flex items-center justify-center lg:justify-start gap-3 ${isVisible ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'}`}>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isDark ? 'bg-brand-brown/20' : 'bg-brand-brown/10'
                  }`}>
                    <Sparkles className="w-5 h-5 text-brand-brown" />
                    <span className="text-lg font-bold text-brand-brown">
                      Pontuação SCA 85+
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className={`ml-2 text-lg font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>4.9/5</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${isVisible ? 'animate-fade-in-up animation-delay-800' : 'opacity-0'}`}>
                <Link to="/marketplace" className="group">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-brand-brown to-orange-600 hover:from-brand-brown/90 hover:to-orange-700 text-white px-8 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 rounded-2xl group-hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Coffee className="w-6 h-6" />
                      Explorar Cafés Especiais
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </Link>

                <Link to="/sobre" className="group">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl group-hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      Nossa História
                    </div>
                  </Button>
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${isVisible ? 'animate-fade-in-up animation-delay-1000' : 'opacity-0'}`}>
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center p-4 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                      isDark ? 'bg-gray-800/60' : 'bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2 text-brand-brown">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-brand-brown font-serif">
                      {stat.number}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial Carousel */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl ${isVisible ? 'animate-fade-in-up animation-delay-1200' : 'opacity-0'} ${
                isDark ? 'bg-gray-800/80' : 'bg-white/80'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Depoimento verificado</span>
                </div>
                
                <blockquote className={`text-lg italic mb-4 transition-all duration-500 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-brand-brown/30' : 'bg-brand-brown/20'
                  }`}>
                    <span className="text-brand-brown font-bold">
                      {testimonials[currentTestimonial].author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>

                {/* Testimonial Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-brand-brown w-8'
                          : isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div className={`relative ${isVisible ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
                  <div className={`aspect-square rounded-3xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500 ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800'
                      : 'bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100'
                  }`}>
                    <img
                      src="/images/caneca-mestres-cafe.jpg"
                      alt="Mestres do Café - Cafés Especiais Premium"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`hidden w-full h-full items-center justify-center flex-col ${
                      isDark
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                        : 'bg-gradient-to-br from-amber-100 to-orange-100'
                    }`}>
                      <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-6 ${
                        isDark ? 'bg-brand-brown/30' : 'bg-brand-brown/20'
                      }`}>
                        <Coffee className="w-20 h-20 text-brand-brown" />
                      </div>
                      <h3 className="text-2xl font-bold text-brand-brown font-serif">
                        Mestres do Café
                      </h3>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className={`absolute -top-4 -right-4 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float ${
                    isDark ? 'bg-gray-800/90' : 'bg-white/90'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <div className={`text-sm font-bold ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>Certificado SCA</div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>85+ Pontos</div>
                      </div>
                    </div>
                  </div>

                  <div className={`absolute -bottom-4 -left-4 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float ${
                    isDark ? 'bg-gray-800/90' : 'bg-white/90'
                  }`} style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-amber-500" />
                      <div>
                        <div className={`text-sm font-bold ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>Premio BSCA</div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>2024</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 -right-8 bg-gradient-to-r from-brand-brown to-orange-600 text-white rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                    <div className="text-center">
                      <div className="text-2xl font-bold font-serif">500+</div>
                      <div className="text-xs">Clientes Felizes</div>
                    </div>
                  </div>
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute inset-0 -z-10">
                  <div className={`absolute top-8 left-8 w-20 h-20 rounded-full blur-xl animate-pulse ${
                    isDark
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20'
                      : 'bg-gradient-to-br from-amber-200/30 to-orange-200/30'
                  }`}></div>
                  <div className={`absolute bottom-8 right-8 w-32 h-32 rounded-full blur-xl animate-pulse ${
                    isDark
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                      : 'bg-gradient-to-br from-pink-200/30 to-orange-200/30'
                  }`} style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className={`w-6 h-10 border-2 rounded-full flex justify-center ${
          isDark ? 'border-brand-brown/70' : 'border-brand-brown/50'
        }`}>
          <div className={`w-1 h-3 rounded-full mt-2 animate-pulse ${
            isDark ? 'bg-brand-brown/70' : 'bg-brand-brown/50'
          }`}></div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHeroSection;