"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Clock, Star } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-brand-dark via-gray-800 to-slate-900 text-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-brown/20 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-yellow-500/20 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
              <Clock className="w-4 h-4" />
              OFERTA LIMITADA
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-serif">
              Experimente Agora os Melhores
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-brown via-yellow-500 to-amber-400">
                Cafés Especiais do Brasil
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-8 font-sans">
              Junte-se a mais de 10.000 amantes de café que já descobriram a diferença.
              <span className="text-yellow-400 font-semibold"> Primeira compra com 25% de desconto!</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Frete Grátis</h3>
              <p className="text-sm text-white/80">Em compras acima de R$ 150</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Garantia Total</h3>
              <p className="text-sm text-white/80">30 dias para devolução</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Entrega Rápida</h3>
              <p className="text-sm text-white/80">Até 3 dias úteis</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-brand-brown hover:bg-brand-brown/90 text-white px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
              >
                Comprar Agora com 25% OFF
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-brand-dark px-8 py-4 text-lg font-semibold bg-transparent w-full sm:w-auto"
              >
                Criar Conta Grátis
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/60">
            * Desconto válido apenas para novos clientes. Oferta por tempo limitado.
          </p>
        </div>
      </div>
    </section>
  )
}
