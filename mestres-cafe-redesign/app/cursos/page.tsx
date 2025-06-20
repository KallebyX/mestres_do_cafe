import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Clock, Users, BookOpen, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const courses = [
  {
    title: "Introdução aos Cafés Especiais",
    description:
      "Descubra o universo dos cafés especiais, desde a fazenda até a xícara. Ideal para iniciantes e entusiastas.",
    image: "/placeholder.svg?height=220&width=380",
    level: "Iniciante",
    duration: "3 horas",
    attendees: "10 vagas",
    tags: ["Degustação", "Origens", "Qualidade"],
    price: "R$ 150,00",
  },
  {
    title: "Técnicas de Barista Essencial",
    description:
      "Aprenda a extrair o espresso perfeito, vaporizar o leite corretamente e as técnicas básicas de latte art.",
    image: "/placeholder.svg?height=220&width=380",
    level: "Intermediário",
    duration: "8 horas (1 dia)",
    attendees: "6 vagas",
    tags: ["Espresso", "Latte Art", "Equipamentos"],
    price: "R$ 450,00",
  },
  {
    title: "Métodos de Preparo em Casa",
    description:
      "Domine métodos como V60, Aeropress, Prensa Francesa e Chemex para fazer o melhor café no conforto do seu lar.",
    image: "/placeholder.svg?height=220&width=380",
    level: "Todos os Níveis",
    duration: "4 horas",
    attendees: "8 vagas",
    tags: ["V60", "Aeropress", "Prensa Francesa", "Moagem"],
    price: "R$ 220,00",
  },
  {
    title: "Análise Sensorial e Cupping",
    description:
      "Desenvolva seu paladar para identificar notas, aromas e atributos em cafés especiais. Técnica de cupping profissional.",
    image: "/placeholder.svg?height=220&width=380",
    level: "Avançado",
    duration: "6 horas",
    attendees: "6 vagas",
    tags: ["Cupping", "Sensorial", "Aromas", "Sabores"],
    price: "R$ 380,00",
  },
]

export default function CursosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <BookOpen className="w-16 h-16 text-brand-brown mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">Nossos Cursos</h1>
          <p className="text-lg md:text-xl text-brand-dark/80 font-sans max-w-2xl mx-auto">
            Aprofunde seu conhecimento e suas habilidades no mundo do café com nossos especialistas. Do básico ao
            avançado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 xl:gap-10">
          {courses.map((course) => (
            <Card
              key={course.title}
              className="flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-brand-brown/10 rounded-xl"
            >
              <CardHeader className="p-0 relative">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  width={380}
                  height={220}
                  className="w-full h-56 object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-brand-brown text-brand-light font-semibold">
                  {course.level}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="font-serif text-2xl mb-2 text-brand-dark leading-tight">{course.title}</CardTitle>
                <CardDescription className="font-sans text-brand-dark/80 mb-4 text-base">
                  {course.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-brand-brown/50 text-brand-brown bg-brand-brown/5 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start p-6 bg-brand-light/30 border-t border-brand-brown/10 mt-auto">
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-sans text-brand-dark/90 mb-5">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-brand-brown flex-shrink-0" /> Duração: {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-brand-brown flex-shrink-0" /> Vagas: {course.attendees}
                  </div>
                </div>
                <div className="w-full flex justify-between items-center">
                  <p className="text-2xl font-serif font-bold text-brand-brown">{course.price}</p>
                  <Button className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-sans font-semibold px-6 py-3">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Inscreva-se Agora
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
