import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Award, Heart, Users, Coffee, MapPin } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-brand-dark text-brand-light py-24 md:py-36 text-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/placeholder.svg?height=700&width=1400"
              alt="Plantação de Café ao entardecer"
              layout="fill"
              objectFit="cover"
              className="opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
          </div>
          <div className="relative container mx-auto px-4 z-10">
            <Coffee className="w-16 h-16 text-brand-brown mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight">Nossa Paixão, Sua Xícara</h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-brand-light/80 font-sans">
              Conheça a história, a dedicação e os valores que fazem da Mestres do Café uma referência em cafés
              especiais artesanais.
            </p>
          </div>
        </section>

        {/* Conteúdo Principal */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">Sobre a Mestres do Café</h2>
              <div className="space-y-5 text-brand-dark/90 font-sans text-lg leading-relaxed">
                <p>
                  Fundada em 2019 em Santa Maria - RS, a Mestres do Café nasceu da paixão por grãos excepcionais e da
                  missão de levar a verdadeira essência do café especial para sua casa. Somos uma torrefação artesanal
                  dedicada a selecionar os melhores cafés de origens renomadas como Minas Gerais, São Paulo, Bahia e
                  Espírito Santo.
                </p>
                <p>
                  Cada lote de café que chega até nós é tratado com o máximo respeito. Nossos grãos ostentam altas
                  pontuações e são certificados pela Associação de Cafés Especiais (SCA), um selo de qualidade que
                  reflete nosso compromisso com a excelência. O processo de torra é uma arte que dominamos: ajustamos
                  perfis e técnicas para cada variedade, realçando suas notas sensoriais únicas e garantindo uma bebida
                  complexa e memorável.
                </p>
                <p>
                  Mais do que vender café, queremos compartilhar experiências, conectar pessoas e celebrar a cultura do
                  café especial brasileiro. Junte-se a nós nesta jornada de sabores e aromas.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-brown to-yellow-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Image
                src="/placeholder.svg?height=550&width=450"
                alt="Processo artesanal de torrefação de café"
                width={450}
                height={550}
                className="rounded-xl shadow-2xl w-full h-auto object-cover relative"
              />
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-brand-dark">Nossos Pilares</h2>
              <p className="text-lg text-brand-dark/70 font-sans mt-2">O que nos move todos os dias.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  icon: Award,
                  title: "Qualidade Suprema",
                  description:
                    "Busca incessante pela excelência, do grão à xícara, com certificação e rastreabilidade.",
                },
                {
                  icon: Heart,
                  title: "Paixão Artesanal",
                  description: "Amor pelo café em cada detalhe, da seleção cuidadosa à torra precisa e personalizada.",
                },
                {
                  icon: Users,
                  title: "Comunidade e Parceria",
                  description:
                    "Valorizamos produtores, colaboradores e clientes, construindo relações justas e duradouras.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-xl transition-shadow border border-transparent hover:border-brand-brown/10"
                >
                  <div className="p-5 bg-brand-brown/10 rounded-full mb-5 inline-block">
                    <value.icon className="w-10 h-10 text-brand-brown" />
                  </div>
                  <h3 className="text-xl font-serif text-brand-dark mb-2">{value.title}</h3>
                  <p className="text-brand-dark/80 font-sans leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action / Localização */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-brand-brown/5 via-brand-light to-brand-light">
          <div className="container mx-auto px-4 text-center">
            <MapPin className="w-12 h-12 text-brand-brown mx-auto mb-4" />
            <h2 className="text-3xl font-serif text-brand-dark mb-3">Visite Nossa Torrefação</h2>
            <p className="text-lg text-brand-dark/80 font-sans mb-6 max-w-xl mx-auto">
              Rua Riachuelo 351, Sala 102. Centro, Santa Maria / RS.
              <br />
              Venha sentir o aroma e conhecer de perto nosso processo!
            </p>
            <Button size="lg" className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold">
              Ver no Mapa & Agendar Visita
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
