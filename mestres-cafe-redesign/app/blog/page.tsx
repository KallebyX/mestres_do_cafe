import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, User, ArrowRight, Tag, Edit3, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const articles = [
  {
    title: "5 Mitos sobre o Café Especial que Você Precisa Conhecer Agora",
    excerpt:
      "Desvendamos as verdades e mentiras mais comuns sobre o mundo dos cafés de alta qualidade. Prepare-se para se surpreender!",
    image: "/placeholder.svg?height=220&width=380",
    author: "Equipe Mestres",
    date: "19 de Junho, 2025",
    slug: "5-mitos-cafe-especial",
    category: "Curiosidades",
    readingTime: "5 min de leitura",
  },
  {
    title: "Guia Completo: Como Moer seu Café em Casa Como um Profissional",
    excerpt:
      "A moagem correta é crucial para a extração perfeita. Aprenda a escolher o moedor ideal e as técnicas para cada método.",
    image: "/placeholder.svg?height=220&width=380",
    author: "Ana Silva, Barista",
    date: "15 de Junho, 2025",
    slug: "guia-moagem-cafe-profissional",
    category: "Preparo",
    readingTime: "8 min de leitura",
  },
  {
    title: "Catuai vs. Bourbon Amarelo: Entenda as Diferenças e Sabores",
    excerpt:
      "Duas das variedades mais amadas do Brasil, lado a lado. Conheça as características sensoriais de cada uma e escolha sua preferida.",
    image: "/placeholder.svg?height=220&width=380",
    author: "Equipe Mestres",
    date: "10 de Junho, 2025",
    slug: "catuai-vs-bourbon-amarelo",
    category: "Variedades",
    readingTime: "6 min de leitura",
  },
  {
    title: "A Arte da Torra: Como Transformamos Grãos Verdes em Ouro Líquido",
    excerpt:
      "Explore os segredos do nosso processo de torrefação artesanal e como ele influencia o sabor final da sua xícara de café.",
    image: "/placeholder.svg?height=220&width=380",
    author: "Daniel Nascimento, Mestre de Torra",
    date: "05 de Junho, 2025",
    slug: "arte-da-torra-mestres-do-cafe",
    category: "Torrefação",
    readingTime: "7 min de leitura",
  },
]

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <Edit3 className="w-16 h-16 text-brand-brown mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">Blog dos Mestres</h1>
          <p className="text-lg md:text-xl text-brand-dark/80 font-sans max-w-2xl mx-auto">
            Artigos, dicas, novidades e curiosidades do universo do café, escritos por quem entende e ama o assunto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 xl:gap-10">
          {articles.map((article) => (
            <Card
              key={article.slug}
              className="flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-brand-brown/10 rounded-xl group"
            >
              <CardHeader className="p-0 relative">
                <Link href={`/blog/${article.slug}`} className="block" aria-label={`Ler artigo: ${article.title}`}>
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    width={380}
                    height={220}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-brand-brown text-brand-light font-semibold"
                >
                  <Tag className="w-3 h-3 mr-1.5" />
                  {article.category}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="font-serif text-2xl mb-3 text-brand-dark leading-tight">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="hover:text-brand-brown transition-colors duration-200"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription className="font-sans text-brand-dark/80 text-base mb-4 line-clamp-3">
                  {article.excerpt}
                </CardDescription>
                <div className="flex flex-wrap items-center text-xs font-sans text-brand-dark/70 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> {article.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> {article.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> {article.readingTime}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-brand-light/30 border-t border-brand-brown/10 mt-auto">
                <Link
                  href={`/blog/${article.slug}`}
                  className="w-full"
                  aria-label={`Continuar lendo: ${article.title}`}
                >
                  <Button
                    variant="outline"
                    className="w-full border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light font-sans font-semibold transition-all duration-200 bg-white"
                  >
                    Ler Artigo Completo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
