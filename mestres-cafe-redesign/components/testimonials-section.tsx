"use client"

import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    role: "Barista Profissional",
    location: "São Paulo, SP",
    rating: 5,
    text: "Trabalho com café há 15 anos e posso afirmar: os grãos da Mestres do Café são excepcionais. A torra é perfeita e o sabor é incomparável. Meus clientes sempre perguntam qual café uso!",
    avatar: "/placeholder.svg?height=80&width=80&text=Maria",
  },
  {
    id: 2,
    name: "João Santos",
    role: "Empresário",
    location: "Rio de Janeiro, RJ",
    rating: 5,
    text: "Compro mensalmente há 2 anos. A qualidade é consistente, a entrega é rápida e o programa de pontos é fantástico. Já ganhei vários brindes! Recomendo de olhos fechados.",
    avatar: "/placeholder.svg?height=80&width=80&text=João",
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Sommelier de Café",
    location: "Belo Horizonte, MG",
    rating: 5,
    text: "Como sommelier, sou muito exigente. Os cafés especiais da Mestres do Café superam minhas expectativas. A pontuação SCA é real e o perfil sensorial é impecável. Simplesmente o melhor!",
    avatar: "/placeholder.svg?height=80&width=80&text=Ana",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">O Que Nossos Mestres Dizem</h2>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto font-sans">
            Mais de <span className="text-brand-brown font-semibold">10.000 clientes satisfeitos</span> já descobriram a
            diferença dos nossos cafés especiais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-brand-brown/10 relative"
            >
              <Quote className="w-8 h-8 text-brand-brown/30 mb-4" />

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-brand-dark/80 mb-6 font-sans leading-relaxed italic">"{testimonial.text}"</p>

              <div className="flex items-center">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-brand-dark font-serif">{testimonial.name}</h4>
                  <p className="text-sm text-brand-dark/70">{testimonial.role}</p>
                  <p className="text-xs text-brand-dark/50">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-brand-brown/20 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-brown"
                >
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-brand-dark">+10.000 clientes satisfeitos</span>
          </div>
        </div>
      </div>
    </section>
  )
}
