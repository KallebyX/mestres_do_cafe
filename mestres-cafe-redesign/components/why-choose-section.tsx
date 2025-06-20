"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Truck, Award, Heart } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Award,
    title: "Qualidade Certificada",
    description: "Todos os nossos cafés possuem certificação SCA com pontuação superior a 80 pontos.",
  },
  {
    icon: Heart,
    title: "Torrefação Artesanal",
    description: "Processo artesanal que preserva os sabores únicos e características de cada grão.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida e Segura",
    description: "Entregamos em todo o Brasil com garantia de frescor e qualidade, direto para sua casa.",
  },
  {
    icon: Shield,
    title: "Direto do Produtor",
    description: "Relacionamento transparente com produtores, garantindo origem e sustentabilidade.",
  },
]

export function WhyChooseSection() {
  return (
    <section className="py-16 md:py-20 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
            Por Que Escolher os Mestres do Café?
          </h2>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto font-sans">
            Há mais de {new Date().getFullYear() - 2019} anos conectando você aos melhores cafés especiais do Brasil,
            com paixão e expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white hover:bg-amber-50/30 border border-brand-brown/10 hover:border-brand-brown/20 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 rounded-2xl flex items-center justify-center group-hover:from-brand-brown/20 group-hover:to-brand-brown/30 transition-all duration-300 transform group-hover:scale-105">
                <feature.icon className="w-8 h-8 text-brand-brown" />
              </div>
              <h3 className="text-lg font-semibold text-brand-dark mb-2 font-serif">{feature.title}</h3>
              <p className="text-brand-dark/70 text-sm leading-relaxed font-sans">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/sobre" passHref>
            <Button
              size="lg"
              className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Conhecer Nossa História
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
