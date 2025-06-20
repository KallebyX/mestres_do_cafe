"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-brand-light overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-amber-50 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 bg-brand-brown/10 text-brand-brown hover:bg-brand-brown/20 px-4 py-2 text-sm font-medium border-brand-brown/30"
          >
            <Award className="w-4 h-4 mr-2" />
            Certificação SCA & Torra Artesanal
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark font-serif mb-6 leading-tight">
            Cafés Especiais
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-brown via-yellow-600 to-amber-700 mt-1 sm:mt-2">
              Direto do Produtor
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-brand-dark/80 mb-10 max-w-3xl mx-auto leading-relaxed font-sans">
            Descubra sabores únicos dos melhores cafés especiais do Brasil. Nossos grãos possuem{" "}
            <span className="text-brand-brown font-semibold">pontuação SCA acima de 80 pontos</span>, passam por
            torrefação artesanal e chegam frescos até você.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
              >
                Explorar Cafés
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sobre">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/10 hover:text-brand-brown px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm w-full sm:w-auto"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Processo
              </Button>
            </Link>
          </div>

          <div className="relative max-w-xl lg:max-w-2xl mx-auto group">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-brand-brown/50 to-yellow-600/50 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500 transform group-hover:rotate-3"></div>
            <Image
              src="/placeholder.svg?height=400&width=600&text=Café Premium Mestres do Café"
              alt="Embalagem de Café Premium Mestres do Café"
              width={600}
              height={400}
              className="relative w-full h-auto rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
