"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CafeCard, type CafeCardProps } from "@/components/cafe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Coffee } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const sampleCafesData: CafeCardProps[] = [
  {
    nome: "CATUAI AMARELO",
    pontuacao: "86+",
    imagemUrl: "/placeholder.svg?height=300&width=400",
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
    imagemUrl: "/placeholder.svg?height=300&width=400",
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
    imagemUrl: "/placeholder.svg?height=300&width=400",
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
    imagemUrl: "/placeholder.svg?height=300&width=400",
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
    imagemUrl: "/placeholder.svg?height=300&width=400",
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
    imagemUrl: "/placeholder.svg?height=300&width=400",
    descricaoSensorial: "Corpo equilibrado, notas de chocolate e nozes.",
    notas: "Finalização suave e agradável.",
    doçura: 3,
    acidez: 3,
    intensidade: 4,
    embalagens: ["250g", "500g", "1kg"],
  },
]

const ProductSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[200px] w-full rounded-xl bg-brand-brown/10" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 bg-brand-brown/10" />
      <Skeleton className="h-4 w-1/2 bg-brand-brown/10" />
      <Skeleton className="h-8 w-full mt-4 bg-brand-brown/10" />
    </div>
  </div>
)

export default function MarketplacePage() {
  const [cafes, setCafes] = useState<CafeCardProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("relevance")

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setCafes(sampleCafesData)
      setIsLoading(false)
    }, 1500)
  }, [])

  const filteredAndSortedCafes = cafes
    .filter((cafe) => cafe.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.nome.localeCompare(b.nome)
      if (sortBy === "name-desc") return b.nome.localeCompare(a.nome)
      if (sortBy === "score-desc") return Number.parseFloat(b.pontuacao) - Number.parseFloat(a.pontuacao)
      return 0
    })

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">
            Nosso Marketplace de Cafés Especiais
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/80 font-sans max-w-2xl mx-auto">
            Explore nossa seleção exclusiva de grãos artesanais, torrados com paixão para sua melhor experiência.
          </p>
        </div>

        <div className="mb-8 md:mb-12 p-6 bg-white rounded-xl shadow-lg border border-brand-brown/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-brand-dark mb-1 font-sans">
                Buscar por nome
              </label>
              <div className="relative">
                <Input
                  type="text"
                  id="search"
                  placeholder="Ex: Catuai Amarelo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-sans border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-label="Buscar café por nome"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-brown/70" />
              </div>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-brand-dark mb-1 font-sans">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className="w-full font-sans border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-label="Ordenar cafés por"
                >
                  <SelectValue placeholder="Relevância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance" className="font-sans">
                    Relevância
                  </SelectItem>
                  <SelectItem value="name-asc" className="font-sans">
                    Nome (A-Z)
                  </SelectItem>
                  <SelectItem value="name-desc" className="font-sans">
                    Nome (Z-A)
                  </SelectItem>
                  <SelectItem value="score-desc" className="font-sans">
                    Melhor Pontuação
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full md:w-auto bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-sans md:self-end"
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
              <CafeCard key={cafe.nome} {...cafe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Coffee className="w-16 h-16 text-brand-brown/50 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-brand-dark mb-2">Nenhum café encontrado</h2>
            <p className="text-brand-dark/70 font-sans">Tente ajustar seus filtros ou termos de busca.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
