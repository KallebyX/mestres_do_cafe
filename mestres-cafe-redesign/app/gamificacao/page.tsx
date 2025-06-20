"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Coffee, Star, ShieldCheck, Gift, Zap, TrendingUp, Award, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

const missionsData = [
  {
    id: "mission1",
    icon: Coffee,
    title: "Explorador de Origens",
    description: "Experimente cafés de 3 regiões diferentes.",
    progress: 66,
    xp: 50,
    points: 25,
  },
  {
    id: "mission2",
    icon: Star,
    title: "Amante de Catuai",
    description: "Compre 5 pacotes de qualquer variedade Catuai.",
    progress: 20,
    xp: 100,
    points: 50,
  },
  {
    id: "mission3",
    icon: Trophy,
    title: "Mestre da Torra",
    description: "Participe de um de nossos cursos de torrefação.",
    progress: 0,
    xp: 200,
    points: 100,
  },
  {
    id: "mission4",
    icon: Zap,
    title: "Feedback Premiado",
    description: "Avalie 3 produtos comprados.",
    progress: 33,
    xp: 30,
    points: 15,
  },
]

const badgesData = [
  { id: "badge1", icon: ShieldCheck, title: "Primeira Compra", description: "Realizou sua primeira compra." },
  { id: "badge2", icon: Coffee, title: "Conhecedor Arábica", description: "Comprou 5 tipos de Arábica." },
  { id: "badge3", icon: Star, title: "Cliente Fiel", description: "5+ compras no último mês." },
  { id: "badge4", icon: Trophy, title: "Mestre do Café", description: "Alcançou o nível máximo." },
  { id: "badge5", icon: Gift, title: "Aniversariante", description: "Ganhou presente no seu mês." },
]

const howItWorksSteps = [
  {
    icon: TrendingUp,
    title: "Explore e Ganhe",
    description:
      "Cada compra, avaliação e missão cumprida te aproxima de benefícios incríveis. Sua jornada para se tornar um mestre começa agora!",
  },
  {
    icon: Award,
    title: "Evolua e Domine",
    description:
      "Avance de Aprendiz a Lenda do Café! A cada novo nível, você desbloqueia descontos maiores, fretes especiais e acesso a produtos secretos.",
  },
  {
    icon: Star,
    title: "Colecione Conquistas",
    description:
      "Receba medalhas exclusivas que celebram sua jornada. Mostre para todos que você é um verdadeiro conhecedor e mestre do café.",
  },
  {
    icon: Gift,
    title: "Resgate Prêmios Incríveis",
    description:
      "Troque seus pontos por descontos, produtos grátis, acessórios e experiências únicas que só os membros do nosso clube podem ter.",
  },
]

export default function GamificacaoPage() {
  // Mock login state - replace with actual authentication context or state management
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const userLevel = 5
  const userXP = 1500
  const nextLevelXP = 2000
  const userPoints = 1250
  const userName = "Mestre do Café" // Mock user name
  const userAvatarFallback = userName.substring(0, 2).toUpperCase()

  // Simulate login state change for demo purposes
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn)

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <Trophy className="w-16 h-16 text-brand-brown mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">
            Jornada do Mestre: Nosso Clube de Recompensas
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/80 font-sans max-w-3xl mx-auto">
            Aqui, sua paixão pelo café se transforma em descontos, produtos exclusivos e experiências inesquecíveis.
            Bem-vindo ao clube!
          </p>
        </div>

        {/* Botão de simulação de login/logout (APENAS PARA DEMONSTRAÇÃO) */}
        {/* Remove this in a real application */}
        <div className="text-center mb-8">
          <Button
            onClick={toggleLogin}
            variant="outline"
            className="bg-white border-brand-dark text-brand-dark hover:bg-brand-dark/5"
          >
            {isLoggedIn ? "Simular Logout" : "Simular Login"}
          </Button>
          <p className="text-xs text-brand-dark/60 mt-1">(Este botão é apenas para demonstração)</p>
        </div>

        {/* Seção "Como Funciona" - Visível para todos */}
        <section className="mb-12 md:mb-16 p-6 md:p-10 bg-white rounded-xl shadow-xl border border-brand-brown/10">
          <h2 className="text-2xl md:text-3xl font-serif text-brand-dark text-center mb-8">
            Transforme sua Paixão em Vantagens Exclusivas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="p-5 bg-brand-brown/10 rounded-full mb-4 inline-block">
                  <step.icon className="w-10 h-10 text-brand-brown" />
                </div>
                <h3 className="text-xl font-semibold font-sans text-brand-dark mb-2">{step.title}</h3>
                <p className="text-sm text-brand-dark/80 font-sans leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {isLoggedIn ? (
          // Painel do Usuário Logado
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Perfil do Usuário */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="shadow-xl border-brand-brown/20 bg-white">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-brand-brown shadow-md">
                    <AvatarImage src="/placeholder.svg?height=100&width=100" alt={userName} />
                    <AvatarFallback className="text-3xl bg-brand-brown/20 text-brand-brown">
                      {userAvatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-serif text-2xl text-brand-dark">{userName}</CardTitle>
                  <CardDescription className="font-sans text-brand-brown font-semibold">
                    Nível {userLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="font-sans text-center p-6">
                  <p className="text-brand-dark/80 mb-1 text-sm">
                    Próximo Nível: {userXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                  </p>
                  <Progress
                    value={(userXP / nextLevelXP) * 100}
                    className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-brand-brown [&>div]:to-yellow-500"
                    aria-label={`Progresso para o próximo nível: ${((userXP / nextLevelXP) * 100).toFixed(0)}%`}
                  />
                  <p className="text-4xl font-bold text-brand-brown mt-6 mb-2">{userPoints.toLocaleString()} Pontos</p>
                  <p className="text-xs text-brand-dark/60 mb-4">Use seus pontos para descontos e produtos!</p>
                  <Button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold">
                    <Gift className="w-4 h-4 mr-2" />
                    Resgatar Recompensas
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Missões e Medalhas */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-xl border-brand-brown/10 bg-white">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-brand-dark">Suas Missões Atuais</CardTitle>
                  <CardDescription className="font-sans text-brand-dark/70">
                    Complete para ganhar XP e pontos!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {missionsData.map((mission) => (
                    <div
                      key={mission.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-brand-brown/10 hover:bg-brand-light/50 transition-colors"
                    >
                      <div className="p-3 bg-brand-brown/10 rounded-lg">
                        <mission.icon className="w-6 h-6 text-brand-brown" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold font-sans text-brand-dark">{mission.title}</p>
                        <p className="text-sm text-brand-dark/70 font-sans mb-1">{mission.description}</p>
                        <Progress
                          value={mission.progress}
                          className="h-2 [&>div]:bg-brand-brown"
                          aria-label={`Progresso da missão ${mission.title}: ${mission.progress}%`}
                        />
                        <div className="flex justify-between text-xs text-brand-dark/60 mt-1">
                          <span>Recompensa: {mission.xp} XP</span>
                          <span>+{mission.points} Pontos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-xl border-brand-brown/10 bg-white">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-brand-dark">Suas Medalhas</CardTitle>
                  <CardDescription className="font-sans text-brand-dark/70">
                    Conquistas desbloqueadas na sua jornada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
                  {badgesData.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-3 rounded-lg border border-transparent hover:border-brand-brown/20 hover:bg-brand-light/50 transition-colors cursor-default"
                      title={badge.description}
                    >
                      <div className="p-4 bg-gradient-to-br from-brand-brown/10 to-yellow-500/10 rounded-full mb-2 shadow-sm">
                        <badge.icon className="w-8 h-8 text-brand-brown" />
                      </div>
                      <p className="text-sm font-semibold font-sans text-brand-dark">{badge.title}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // CTA para Usuários Deslogados
          <section className="text-center py-12 md:py-16 bg-white rounded-xl shadow-xl border border-brand-brown/10">
            <Coffee className="w-12 h-12 md:w-16 md:h-16 text-brand-brown mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-serif text-brand-dark mb-4">Pronto para Iniciar sua Jornada?</h2>
            <p className="text-brand-dark/80 font-sans mb-8 max-w-lg mx-auto text-base md:text-lg">
              Não fique de fora! Crie sua conta ou faça login para entrar no clube, ativar seu painel de recompensas e
              começar a acumular pontos hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/login" passHref>
                <Button
                  size="lg"
                  className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold w-full sm:w-auto"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar na Conta
                </Button>
              </Link>
              <Link href="/registro" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-brown text-brand-brown hover:bg-brand-brown/10 hover:text-brand-brown font-semibold bg-white w-full sm:w-auto"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar Nova Conta
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
