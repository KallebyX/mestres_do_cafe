import {
  ArrowRight,
  Award,
  Coffee,
  Heart,
  Play,
  Shield,
  Star,
  Trophy,
  Truck,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductSkeleton, useDataState } from "../components/LoadingStates";
import { Button } from "../components/ui/button";
import { getFeaturedTestimonials, getFiltered } from "../lib/api.js";

const LandingPage = () => {
  const {
    data: featuredProducts,
    loading,
    error,
    execute: loadProducts,
  } = useDataState([]);

  // Estado para testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // Carregar produtos e testimonials em destaque reais do Supabase
  useEffect(() => {
    loadFeaturedProducts();
    loadTestimonials();
  }, []);

  const loadFeaturedProducts = async () => {
    await loadProducts(async () => {
      // Usar helper genérico para buscar produtos em destaque
      const response = await getFiltered(
        "products",
        { is_featured: true, is_active: true },
        { limit: 3, orderBy: "sca_score", ascending: false },
      );

      if (response.success && response.data) {
        // Mapear dados para formato da UI
        const products = response.data.products || response.data; // Suporte a ambos formatos
        const formattedProducts = products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          origin: product.origin || "Brasil",
          price: product.price,
          originalPrice: product.original_price,
          rating:
            product.rating || product.sca_score ? product.sca_score / 20 : null, // Rating baseado em SCA ou rating real
          sca: product.sca_score || 85,
          images: product.images || [], // Incluir as imagens dos produtos
        }));

        console.log(
          "✅ Produtos em destaque carregados:",
          formattedProducts.length,
        );
        return formattedProducts;
      } else {
        throw new Error(
          response.error || "Erro ao carregar produtos em destaque",
        );
      }
    });
  };

  const stats = [
    { number: "500+", label: "Clientes Satisfeitos" },
    { number: "50+", label: "Cafés Especiais" },
    { number: "5", label: "Anos de Experiência" },
    { number: "95%", label: "Avaliações 5 Estrelas" },
  ];

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certificação SCA",
      description:
        "Todos os nossos cafés possuem pontuação SCA acima de 80 pontos",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Frete Grátis",
      description:
        "Entrega gratuita para compras acima de R$ 99 em todo o Brasil",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compra Segura",
      description:
        "Pagamento seguro com garantia de qualidade ou dinheiro de volta",
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "Frescor Garantido",
      description: "Torrefação semanal para garantir máximo frescor e sabor",
    },
  ];

  // Função para carregar testimonials reais
  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const result = await getFeaturedTestimonials(3);
      if (result.success) {
        setTestimonials(result.data);
        console.log(`✅ ${result.data.length} testimonials carregados`);
      } else {
        console.log("⚠️ Erro ao carregar testimonials:", result.error);
        setTestimonials([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar testimonials:", error);
      setTestimonials([]);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-white">
      {/* Hero Section - Design Fiel ao Mestres do Café */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-200 to-pink-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 lg:py-32 z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* SCA & Torra Artesanal Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-700">
                SCA & Torra Artesanal
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              <span className="block font-serif">Cafés Especiais</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-orange-700 font-serif">
                Direto do Produtor
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              Descubra sabores únicos dos melhores cafés especiais do Brasil.
            </p>

            <p className="text-lg lg:text-xl text-gray-700 font-semibold mb-12 max-w-2xl mx-auto">
              Pontuação SCA acima de 80 pontos
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/marketplace">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 rounded-2xl"
                >
                  Explorar Cafés
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>

              <Link to="/sobre">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 px-12 py-6 text-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl"
                >
                  <Play className="mr-3 w-6 h-6" />
                  Ver Processo
                </Button>
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative w-full h-96 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src="/images/caneca-mestres-cafe.jpg"
                  alt="Mestres do Café - Cafés Especiais Premium"
                  className="w-full h-full object-cover rounded-3xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center flex-col bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl">
                  <div className="w-32 h-32 bg-amber-600/20 rounded-3xl flex items-center justify-center mb-6">
                    <Coffee className="w-20 h-20 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-600 font-serif">
                    Mestres do Café
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Adaptativo por dispositivo */}
      <section className="py-16 lg:py-20 bg-white transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Layout vertical compacto */}
          <div className="block md:hidden">
            <div className="bg-gradient-to-br from-brand-brown/10 to-amber-50 rounded-2xl p-6 shadow-lg border border-brand-brown/20">
              <h3 className="text-xl font-bold text-brand-dark text-center mb-6 font-serif">
                Nossos Números
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center bg-white/70 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold text-brand-brown font-serif mb-1">
                      {stat.number}
                    </div>
                    <div className="text-brand-dark text-xs font-medium leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Layout horizontal espaçoso */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-brand-brown/5 to-amber-50/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border border-brand-brown/10 hover:border-brand-brown/30 transform hover:-translate-y-2">
                    <div className="text-4xl xl:text-5xl font-bold text-brand-brown font-serif mb-3 transform group-hover:scale-110 transition-all duration-300">
                      {stat.number}
                    </div>
                    <div className="text-brand-dark text-base lg:text-lg font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Layout Adaptativo */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-amber-50 relative overflow-hidden">
        {/* Decorative elements - apenas desktop */}
        <div className="hidden lg:block absolute top-0 left-0 w-64 h-64 bg-brand-brown/5 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="hidden lg:block absolute bottom-0 right-0 w-96 h-96 bg-brand-brown/3 rounded-full translate-x-48 translate-y-48"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-brown/10 rounded-2xl mb-6 mx-auto">
              <Coffee className="w-8 h-8 text-brand-brown" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark font-serif mb-6 leading-tight">
              Por que escolher nossos cafés?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-brand-dark/80 max-w-3xl mx-auto leading-relaxed">
              Oferecemos uma experiência completa em cafés especiais, do grão à
              xícara
            </p>
          </div>

          {/* Mobile: Layout em lista com cartões expandidos */}
          <div className="block lg:hidden space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-brand-brown/10 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start p-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 rounded-xl flex items-center justify-center mr-4">
                    {React.cloneElement(feature.icon, {
                      className: "w-7 h-7 text-brand-brown",
                    })}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-brand-dark mb-2 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-brand-dark/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Layout em grid espaçoso */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-transparent hover:border-brand-brown/20 h-full">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-brown group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(feature.icon, {
                        className: "w-8 h-8",
                      })}
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-brand-brown/20 rounded-2xl mx-auto blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-xl text-brand-dark mb-3 group-hover:text-brand-brown transition-colors duration-300 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-brand-dark/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 lg:py-28 bg-amber-50 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-8 h-8 bg-brand-brown rounded-full"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-brand-brown rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-brand-brown rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-10 h-10 bg-brand-brown rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-brown/10 rounded-2xl mb-6 mx-auto">
              <Star className="w-8 h-8 text-brand-brown" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark font-serif mb-6 leading-tight">
              Nossos Cafés Especiais
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-brand-dark/80 max-w-3xl mx-auto leading-relaxed">
              Conheça nossa seleção premium de cafés especiais, cuidadosamente
              escolhidos para você
            </p>
          </div>

          {/* Mobile: Layout em lista vertical */}
          <div className="block lg:hidden space-y-6">
            {loading ? (
              <ProductSkeleton count={3} />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Erro ao Carregar
                </h3>
                <p className="text-red-700 mb-4 text-sm">{error}</p>
                <button
                  onClick={loadFeaturedProducts}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 3).map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg border border-brand-brown/10 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex">
                    <div className="w-32 h-32 bg-gradient-to-br from-brand-brown/10 to-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          display:
                            product.images && product.images[0]
                              ? "none"
                              : "flex",
                        }}
                      >
                        <Coffee className="w-12 h-12 text-brand-brown/70" />
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-brand-brown/10 text-brand-brown text-xs font-bold rounded-full">
                          SCA {product.sca}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-brand-dark font-semibold">
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-brand-dark mb-1 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs text-brand-brown font-medium mb-2">
                        {product.origin}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-brand-brown">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                        <Link to={`/produto/${product.id}`}>
                          <button className="px-4 py-2 bg-brand-brown hover:bg-brand-brown/90 text-white font-semibold rounded-xl transition-all duration-300 text-sm">
                            Ver Mais
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-brand-brown/60" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  Em breve!
                </h3>
                <p className="text-brand-dark/60 mb-4">
                  Novos cafés especiais chegando.
                </p>
                <button
                  onClick={loadFeaturedProducts}
                  className="bg-brand-brown hover:bg-brand-brown/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Atualizar
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Layout em grid espaçoso */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {loading ? (
              <ProductSkeleton count={3} />
            ) : error ? (
              <div className="col-span-full">
                <div className="bg-red-50 border border-red-200 rounded-3xl p-12 max-w-md mx-auto text-center shadow-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Coffee className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900 mb-3">
                    Erro ao Carregar Produtos
                  </h3>
                  <p className="text-red-700 mb-6">{error}</p>
                  <button
                    onClick={loadFeaturedProducts}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <div key={product.id} className="group relative">
                  <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-transparent hover:border-brand-brown/20 transform hover:-translate-y-4">
                    <div className="relative h-64 bg-gradient-to-br from-brand-brown/10 via-amber-100/50 to-brand-brown/5 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          display:
                            product.images && product.images[0]
                              ? "none"
                              : "flex",
                        }}
                      >
                        <Coffee className="w-24 h-24 text-brand-brown/60 group-hover:text-brand-brown group-hover:scale-110 transition-all duration-300" />
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-brand-brown/10 to-brand-brown/20 text-brand-brown text-xs font-bold rounded-full">
                          SCA {product.sca}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-brand-dark font-semibold">
                            {product.rating}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-2xl text-brand-dark mb-2 group-hover:text-brand-brown transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-brand-dark/70 mb-2 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-sm text-brand-brown font-medium mb-6">
                        {product.origin}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-2xl text-brand-brown">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-sm text-brand-dark/60 line-through">
                                R${" "}
                                {product.originalPrice
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </span>
                            )}
                        </div>
                        <Link to={`/produto/${product.id}`}>
                          <button className="px-6 py-3 bg-brand-brown hover:bg-brand-brown/90 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                            Ver Detalhes
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-brand-brown/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Coffee className="w-14 h-14 text-brand-brown/60" />
                </div>
                <h3 className="text-3xl font-bold text-brand-dark mb-4">
                  Em breve, novos cafés especiais!
                </h3>
                <p className="text-lg text-brand-dark/60 mb-8 max-w-md mx-auto">
                  Estamos preparando uma seleção exclusiva para você.
                </p>
                <button
                  onClick={loadFeaturedProducts}
                  className="bg-brand-brown hover:bg-brand-brown/90 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  Atualizar Lista
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-16 lg:mt-20">
            <Link to="/marketplace">
              <button className="bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white font-bold px-10 py-4 lg:px-12 lg:py-5 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Ver Todos os Cafés
                <ArrowRight className="ml-3 w-5 h-5 inline-block" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-brown/10 rounded-2xl mb-6 mx-auto">
              <Users className="w-8 h-8 text-brand-brown" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark font-serif mb-6 leading-tight">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-brand-dark/80 max-w-3xl mx-auto leading-relaxed">
              Depoimentos reais de quem já experimentou nossos cafés especiais
            </p>
          </div>

          {/* Testimonials Grid */}
          {testimonialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-amber-50 rounded-2xl p-8 animate-pulse"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-brand-brown/20 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-brand-brown/20 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-brand-brown/10 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-brand-brown/10 rounded"></div>
                </div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg border border-brand-brown/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-brand-brown/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      {testimonial.avatar_url ? (
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-brand-brown font-bold text-lg ${testimonial.avatar_url ? "hidden" : "flex"}`}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-dark">
                        {testimonial.name}
                      </h4>
                      <p className="text-brand-brown text-sm">
                        {testimonial.role}
                      </p>
                      {testimonial.location && (
                        <p className="text-brand-dark/60 text-xs">
                          {testimonial.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-brand-dark/70 font-medium">
                      {testimonial.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <blockquote className="text-brand-dark/80 italic leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-brown/60" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                Em breve, depoimentos!
              </h3>
              <p className="text-brand-dark/60">
                Nossos clientes compartilharão suas experiências em breve.
              </p>
            </div>
          )}

          {/* Call to Action */}
          {testimonials.length > 0 && (
            <div className="text-center mt-16">
              <p className="text-lg text-brand-dark/70 mb-6">
                Faça parte da nossa comunidade de amantes do café!
              </p>
              <Link to="/marketplace">
                <button className="bg-brand-brown hover:bg-brand-brown/90 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Experimentar Nossos Cafés
                  <ArrowRight className="ml-2 w-5 h-5 inline-block" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-brand-dark text-white relative overflow-hidden">
        {/* Enhanced background elements - responsive */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gradient-to-br from-brand-brown/20 to-transparent rounded-full blur-2xl sm:blur-3xl -translate-x-24 sm:-translate-x-36 md:-translate-x-48 -translate-y-24 sm:-translate-y-36 md:-translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-gradient-to-tl from-amber-600/20 to-transparent rounded-full blur-2xl sm:blur-3xl translate-x-20 sm:translate-x-30 md:translate-x-40 translate-y-20 sm:translate-y-30 md:translate-y-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden sm:block">
            <div className="w-2 h-2 bg-brand-brown/30 rounded-full"></div>
            <div className="w-1 h-1 bg-amber-400/40 rounded-full absolute top-20 left-32"></div>
            <div className="w-1.5 h-1.5 bg-brand-brown/20 rounded-full absolute -top-16 -left-20"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-brand-brown/20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 mx-auto">
              <Heart className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-brand-brown" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif mb-4 sm:mb-6 lg:mb-8 leading-tight px-4 sm:px-0">
              Pronto para descobrir o seu café especial?
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-light/90 mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed px-4 sm:px-6">
              Junte-se a centenas de amantes do café que já descobriram sabores
              únicos com a gente.
              <span className="block mt-1 sm:mt-2 text-brand-brown font-semibold text-sm sm:text-base md:text-lg lg:text-xl">
                Sua jornada pelos melhores cafés do Brasil começa aqui.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-12 max-w-lg sm:max-w-none mx-auto">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto flex-1 sm:flex-initial"
              >
                <button className="group bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white px-8 py-4 sm:px-12 sm:py-5 lg:px-16 lg:py-6 text-base sm:text-lg lg:text-xl font-bold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 w-full sm:w-auto relative overflow-hidden min-h-[50px] sm:min-h-[56px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center">
                    Começar Jornada
                    <Trophy className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                </button>
              </Link>

              <Link
                to="/sobre"
                className="w-full sm:w-auto flex-1 sm:flex-initial"
              >
                <button className="border-2 border-brand-light/30 text-brand-light hover:bg-brand-light hover:text-brand-dark px-8 py-4 sm:px-12 sm:py-5 lg:px-16 lg:py-6 text-base sm:text-lg lg:text-xl font-bold rounded-xl sm:rounded-2xl transition-all duration-300 w-full sm:w-auto hover:shadow-xl transform hover:-translate-y-1 min-h-[50px] sm:min-h-[56px]">
                  <span className="flex items-center justify-center">
                    <span className="hidden sm:inline">Nossa História</span>
                    <span className="sm:hidden">História</span>
                    <Coffee className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Trust indicators - responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-brand-brown/10 rounded-xl p-3 sm:p-4 lg:p-6 border border-brand-brown/20">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown mb-1">
                  500+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-brand-light/70 leading-tight">
                  Clientes Felizes
                </div>
              </div>
              <div className="text-center bg-brand-brown/10 rounded-xl p-3 sm:p-4 lg:p-6 border border-brand-brown/20">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown mb-1">
                  50+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-brand-light/70 leading-tight">
                  Cafés Especiais
                </div>
              </div>
              <div className="text-center bg-brand-brown/10 rounded-xl p-3 sm:p-4 lg:p-6 border border-brand-brown/20">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown mb-1">
                  5★
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-brand-light/70 leading-tight">
                  Avaliação Média
                </div>
              </div>
              <div className="text-center bg-brand-brown/10 rounded-xl p-3 sm:p-4 lg:p-6 border border-brand-brown/20">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown mb-1">
                  24h
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-brand-light/70 leading-tight">
                  Entrega Rápida
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
