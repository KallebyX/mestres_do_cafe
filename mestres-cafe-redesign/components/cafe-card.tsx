import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Coffee, Zap, TrendingUp, Package } from "lucide-react" // Added ShoppingCart
import Image from "next/image"
import Link from "next/link" // For linking to product details page

interface AtributoProps {
  label: string
  nivel: 1 | 2 | 3 | 4 | 5
  IconComponent: React.ElementType
  iconColorClass: string
  bgColorClass: string
}

const AtributoVisual = ({ label, nivel, IconComponent, iconColorClass, bgColorClass }: AtributoProps) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center mb-1">
      <IconComponent className={`w-3.5 h-3.5 mr-1 ${iconColorClass}`} />
      <span className="text-xs font-medium text-brand-dark/70">{label}</span>
    </div>
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < nivel ? bgColorClass : "bg-gray-300"}`} />
      ))}
    </div>
  </div>
)

export interface CafeCardProps {
  id?: string // Optional ID for linking or keys
  nome: string
  pontuacao: string
  imagemUrl: string
  descricaoSensorial: string
  notas: string
  doçura: 1 | 2 | 3 | 4 | 5
  acidez: 1 | 2 | 3 | 4 | 5
  intensidade: 1 | 2 | 3 | 4 | 5
  embalagens: string[]
  preco?: string // Optional price
  slug?: string // Optional slug for URL
}

export function CafeCard({
  nome,
  pontuacao,
  imagemUrl,
  descricaoSensorial,
  notas,
  doçura,
  acidez,
  intensidade,
  embalagens,
  preco,
  slug = "#", // Default slug if not provided
}: CafeCardProps) {
  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl border border-brand-brown/10 flex flex-col group">
      <CardHeader className="p-0">
        <Link
          href={`/marketplace/${slug}`}
          className="block relative w-full h-48 overflow-hidden"
          aria-label={`Ver detalhes do café ${nome}`}
        >
          <Image
            src={imagemUrl || "/placeholder.svg?height=200&width=300&query=roasted+coffee+beans"}
            alt={`Café ${nome}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          {preco && (
            <Badge className="absolute top-3 right-3 bg-brand-dark text-white px-2.5 py-1 text-sm font-semibold">
              {preco}
            </Badge>
          )}
        </Link>
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-bold text-brand-dark font-serif group-hover:text-brand-brown transition-colors">
              <Link href={`/marketplace/${slug}`}>{nome}</Link>
            </CardTitle>
            <Badge
              variant="outline"
              className="border-brand-brown text-brand-brown bg-brand-brown/10 font-semibold text-xs px-2 py-0.5"
            >
              SCA {pontuacao}
            </Badge>
          </div>
          <CardDescription className="text-xs text-brand-dark/80 mb-1 h-10 overflow-hidden text-ellipsis font-sans">
            {descricaoSensorial}
          </CardDescription>
          <CardDescription className="text-xs text-brand-dark/70 font-medium italic font-sans">
            Notas: {notas}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-brand-dark/90 mb-1.5 text-center font-sans">
            Atributos Sensoriais:
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <AtributoVisual
              label="Doçura"
              nivel={doçura}
              IconComponent={Coffee}
              iconColorClass="text-brand-brown"
              bgColorClass="bg-brand-brown"
            />
            <AtributoVisual
              label="Acidez"
              nivel={acidez}
              IconComponent={Zap}
              iconColorClass="text-yellow-500" // Differentiated color for Acidez
              bgColorClass="bg-yellow-500"
            />
            <AtributoVisual
              label="Intensidade"
              nivel={intensidade}
              IconComponent={TrendingUp}
              iconColorClass="text-red-500" // Differentiated color for Intensidade
              bgColorClass="bg-red-500"
            />
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-brand-dark/90 mb-0.5 flex items-center font-sans">
            <Package className="w-3.5 h-3.5 mr-1.5 text-brand-brown" />
            Embalagens:
          </h4>
          <p className="text-xs text-brand-dark/70 font-sans">{embalagens.join(" | ")}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-brand-light/30 border-t border-brand-brown/10 mt-auto">
        <Link href={`/marketplace/${slug}`} className="flex-1" passHref>
          <Button
            variant="outline"
            className="w-full text-xs py-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white bg-white"
          >
            Ver Detalhes
          </Button>
        </Link>
        {/* Optional: Add to cart button - implement functionality separately */}
        {/* <Button className="flex-1 ml-2 bg-brand-brown hover:bg-brand-brown/90 text-white text-xs py-2">
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Comprar
        </Button> */}
      </CardFooter>
    </Card>
  )
}
