"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const featuredProducts = [
  {
    id: 1,
    name: "Bourbon Amarelo Premium",
    origin: "Cerrado Mineiro",
    score: 87,
    price: 89.9,
    originalPrice: 109.9,
    image: "/placeholder.svg?height=300&width=300&text=Bourbon Amarelo",
    notes: ["Chocolate", "Caramelo", "Nozes"],
    bestseller: true,
  },
  {
    id: 2,
    name: "Geisha Especial",
    origin: "Mantiqueira de Minas",
    score: 92,
    price: 149.9,
    originalPrice: 179.9,
    image: "/placeholder.svg?height=300&width=300&text=Geisha Especial",
    notes: ["Floral", "Frutas Vermelhas", "Mel"],
    limited: true,
  },
  {
    id: 3,
    name: "Catuaí Pulped Natural",
    origin: "Sul de Minas",
    score: 85,
    price: 69.9,
    originalPrice: 84.9,
    image: "/placeholder.svg?height=300&width=300&text=Catuaí Natural",
    notes: ["Frutas Cítricas", "Açúcar Mascavo", "Baunilha"],
    popular: true,
  },
]

export function FeaturedProductsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 bg-brand-brown text-white px-4 py-2">🔥 MAIS VENDIDOS</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
            Cafés Que Nossos Clientes Amam
          </h2>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto font-sans">
            Selecionamos os 3 cafés mais pedidos pelos nossos mestres. Cada um com sua personalidade única e
            <span className="text-brand-brown font-semibold"> pontuação SCA excepcional</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-brand-brown/10 group hover:-translate-y-2"
            >
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.bestseller && <Badge className="bg-red-500 text-white">🏆 BEST SELLER</Badge>}
                  {product.limited && <Badge className="bg-purple-500 text-white">⭐ EDIÇÃO LIMITADA</Badge>}
                  {product.popular && <Badge className="bg-green-500 text-white">🔥 POPULAR</Badge>}
                </div>
                <div className="absolute top-4 right-4 bg-brand-brown text-white px-3 py-1 rounded-full text-sm font-bold">
                  SCA {product.score}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-2 font-serif">{product.name}</h3>
                <p className="text-brand-dark/70 mb-3 font-sans">{product.origin}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {product.notes.map((note, index) => (
                    <span key={index} className="text-xs bg-brand-light text-brand-brown px-2 py-1 rounded-full">
                      {note}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-brand-dark/70 ml-1">(4.9)</span>
                  </div>
                  <Award className="w-5 h-5 text-brand-brown" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-brand-brown">R$ {product.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </div>

                <Button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white font-semibold">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Agora
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white px-8 py-3 text-lg font-semibold"
            >
              Ver Todos os Cafés
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
