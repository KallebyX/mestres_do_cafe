"use client"

import { Leaf, Award, Truck, Coffee } from "lucide-react"

const processSteps = [
  {
    icon: Leaf,
    title: "Seleção Rigorosa",
    description:
      "Visitamos pessoalmente cada fazenda parceira. Selecionamos apenas grãos com pontuação SCA acima de 80 pontos.",
    details: "Relacionamento direto com produtores certificados",
  },
  {
    icon: Coffee,
    title: "Torra Artesanal",
    description: "Processo de torra desenvolvido por mestres torradores com mais de 20 anos de experiência.",
    details: "Perfis únicos para cada origem e variedade",
  },
  {
    icon: Award,
    title: "Controle de Qualidade",
    description: "Cada lote passa por análise sensorial completa antes de ser aprovado para venda.",
    details: "Certificação SCA e testes de cupping",
  },
  {
    icon: Truck,
    title: "Entrega Expressa",
    description: "Embalagem a vácuo e envio em até 24h para garantir máximo frescor dos grãos.",
    details: "Frete grátis para todo o Brasil acima de R$ 150",
  },
]

export function ProcessSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
            Como Garantimos a Excelência
          </h2>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto font-sans">
            Nosso processo de 4 etapas garante que você receba apenas
            <span className="text-brand-brown font-semibold"> os melhores cafés especiais do Brasil</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className="text-center group hover:bg-brand-light p-6 rounded-2xl transition-all duration-300"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 rounded-2xl flex items-center justify-center group-hover:from-brand-brown/20 group-hover:to-brand-brown/30 transition-all duration-300 transform group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-brand-brown" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-brand-dark mb-3 font-serif">{step.title}</h3>
              <p className="text-brand-dark/70 mb-3 font-sans">{step.description}</p>
              <p className="text-sm text-brand-brown font-semibold">{step.details}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-brand-brown to-amber-700 text-white p-8 md:p-12 rounded-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 font-serif">Garantia de Satisfação 100%</h3>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Não ficou satisfeito? Devolvemos seu dinheiro em até 30 dias, sem perguntas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              <span className="font-semibold">Certificação SCA</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6" />
              <span className="font-semibold">Frete Grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6" />
              <span className="font-semibold">Torra Artesanal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
