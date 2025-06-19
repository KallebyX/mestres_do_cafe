import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Award,
  Coffee,
  Truck,
  Shield,
  Package,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Skeleton Loading Component
const ProductSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <div className="h-[200px] w-full rounded-xl bg-brand-brown/10 animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 bg-brand-brown/10 animate-pulse rounded" />
      <div className="h-4 w-1/2 bg-brand-brown/10 animate-pulse rounded" />
      <div className="h-8 w-full mt-4 bg-brand-brown/10 animate-pulse rounded" />
    </div>
  </div>
);

// Cafe Card Component
const CafeCard = ({ cafe }) => {
  const getAttributeIcon = (attribute) => {
    switch (attribute) {
      case 'doçura': return Coffee;
      case 'acidez': return Zap;
      case 'intensidade': return TrendingUp;
      default: return Coffee;
    }
  };

  const getAttributeColor = (attribute) => {
    switch (attribute) {
      case 'doçura': return 'text-brand-brown';
      case 'acidez': return 'text-yellow-500';
      case 'intensidade': return 'text-red-500';
      default: return 'text-brand-brown';
    }
  };

  const getAttributeBgColor = (attribute) => {
    switch (attribute) {
      case 'doçura': return 'bg-brand-brown';
      case 'acidez': return 'bg-yellow-500';
      case 'intensidade': return 'bg-red-500';
      default: return 'bg-brand-brown';
    }
  };

  const AtributoVisual = ({ label, nivel, attribute }) => {
    const IconComponent = getAttributeIcon(attribute);
    const iconColorClass = getAttributeColor(attribute);
    const bgColorClass = getAttributeBgColor(attribute);

    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-1">
          <IconComponent className={`w-3.5 h-3.5 mr-1 ${iconColorClass}`} />
          <span className="text-xs font-medium text-brand-dark/70">{label}</span>
        </div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < nivel ? bgColorClass : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl border border-brand-brown/10 flex flex-col group">
      <CardHeader className="p-0">
        <Link
          to={`/marketplace/${cafe.slug || cafe.nome.toLowerCase().replace(/\s+/g, '-')}`}
          className="block relative w-full h-48 overflow-hidden"
          aria-label={`Ver detalhes do café ${cafe.nome}`}
        >
          <div className="w-full h-full bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Coffee className="w-16 h-16 text-brand-brown" />
          </div>
          {cafe.preco && (
            <Badge className="absolute top-3 right-3 bg-brand-dark text-white px-2.5 py-1 text-sm font-semibold">
              {cafe.preco}
            </Badge>
          )}
        </Link>
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-bold text-brand-dark font-serif group-hover:text-brand-brown transition-colors">
              <Link to={`/marketplace/${cafe.slug || cafe.nome.toLowerCase().replace(/\s+/g, '-')}`}>{cafe.nome}</Link>
            </CardTitle>
            <Badge
              variant="outline"
              className="border-brand-brown text-brand-brown bg-brand-brown/10 font-semibold text-xs px-2 py-0.5"
            >
              SCA {cafe.pontuacao}
            </Badge>
          </div>
          <CardDescription className="text-xs text-brand-dark/80 mb-1 h-10 overflow-hidden text-ellipsis">
            {cafe.descricaoSensorial}
          </CardDescription>
          <CardDescription className="text-xs text-brand-dark/70 font-medium italic">
            Notas: {cafe.notas}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-brand-dark/90 mb-1.5 text-center">
            Atributos Sensoriais:
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <AtributoVisual
              label="Doçura"
              nivel={cafe.doçura}
              attribute="doçura"
            />
            <AtributoVisual
              label="Acidez"
              nivel={cafe.acidez}
              attribute="acidez"
            />
            <AtributoVisual
              label="Intensidade"
              nivel={cafe.intensidade}
              attribute="intensidade"
            />
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-brand-dark/90 mb-0.5 flex items-center">
            <Package className="w-3.5 h-3.5 mr-1.5 text-brand-brown" />
            Embalagens:
          </h4>
          <p className="text-xs text-brand-dark/70">{cafe.embalagens.join(' | ')}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-brand-light/30 border-t border-brand-brown/10 mt-auto">
        <Link to={`/marketplace/${cafe.slug || cafe.nome.toLowerCase().replace(/\s+/g, '-')}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full text-xs py-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white bg-white"
          >
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Sample Data
const sampleCafesData = [
  {
    nome: "CATUAI AMARELO",
    pontuacao: "86+",
    descricaoSensorial: "Corpo cítrico, frutas tropicais, sabor caramelo.",
    notas: "Retrogosto prolongado e adocicado.",
    doçura: 4,
    acidez: 3,
    intensidade: 4,
    embalagens: ["100g", "250g", "500g", "1kg"],
  },
  {
    nome: "ARARA",
    pontuacao: "84+",
    descricaoSensorial: "Corpo cítrico, sabor de caramelo salgado com pimenta rosa.",
    notas: "Retrogosto com notas de chocolate meio amargo.",
    doçura: 3,
    acidez: 4,
    intensidade: 3,
    embalagens: ["100g", "250g", "500g", "1kg"],
  },
  {
    nome: "BOURBON AMARELO",
    pontuacao: "82+",
    descricaoSensorial: "Corpo aveludado, frutas amarelas, sabor mel.",
    notas: "Retrogosto adocicado suave.",
    doçura: 5,
    acidez: 2,
    intensidade: 3,
    embalagens: ["100g", "250g", "500g", "1kg"],
  },
  {
    nome: "CATUCAÍ AMARELO",
    pontuacao: "87+",
    descricaoSensorial: "Corpo cremoso e aveludado, com notas marcantes de pêssego, damasco, baunilha e mel.",
    notas: "Retrogosto prolongado e floral, que envolve o paladar com suavidade e doçura.",
    doçura: 5,
    acidez: 3,
    intensidade: 4,
    embalagens: ["100g", "250g", "500g", "1kg"],
  },
  {
    nome: "CATUAÍ VERMELHO",
    pontuacao: "85+",
    descricaoSensorial: "Corpo médio e aveludado. Açúcar mascavo, frutas vermelhas e leve toque cítrico.",
    notas: "Com acidez equilibrada e finalização doce e prolongada.",
    doçura: 4,
    acidez: 4,
    intensidade: 3,
    embalagens: ["100g", "250g", "500g", "1kg"],
  },
  {
    nome: "MUNDO NOVO",
    pontuacao: "83+",
    descricaoSensorial: "Corpo equilibrado, notas de chocolate e nozes.",
    notas: "Finalização suave e agradável.",
    doçura: 3,
    acidez: 3,
    intensidade: 4,
    embalagens: ["250g", "500g", "1kg"],
  },
];

// Main Marketplace Component
const MarketplacePage = () => {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCafes(sampleCafesData);
      setIsLoading(false);
    }, 1500);
  }, []);

  const filteredAndSortedCafes = cafes
    .filter((cafe) => cafe.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.nome.localeCompare(b.nome);
      if (sortBy === "name-desc") return b.nome.localeCompare(a.nome);
      if (sortBy === "score-desc") return Number.parseFloat(b.pontuacao) - Number.parseFloat(a.pontuacao);
      return 0;
    });

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">
            Nosso Marketplace de Cafés Especiais
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto">
            Explore nossa seleção exclusiva de grãos artesanais, torrados com paixão para sua melhor experiência.
          </p>
        </div>

        <div className="mb-8 md:mb-12 p-6 bg-white rounded-xl shadow-lg border border-brand-brown/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-brand-dark mb-1">
                Buscar por nome
              </label>
              <div className="relative">
                <Input
                  type="text"
                  id="search"
                  placeholder="Ex: Catuai Amarelo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-label="Buscar café por nome"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-brown/70" />
              </div>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-brand-dark mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown rounded-md px-3 py-2"
                aria-label="Ordenar cafés por"
              >
                <option value="relevance">Relevância</option>
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
                <option value="score-desc">Melhor Pontuação</option>
              </select>
            </div>
            <Button
              className="w-full md:w-auto bg-brand-brown hover:bg-brand-brown/90 text-brand-light md:self-end"
              disabled
            >
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros (Em breve)
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedCafes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedCafes.map((cafe) => (
              <CafeCard key={cafe.nome} cafe={cafe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Coffee className="w-16 h-16 text-brand-brown/50 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-brand-dark mb-2">Nenhum café encontrado</h2>
            <p className="text-brand-dark/70">Tente ajustar seus filtros ou termos de busca.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage; 