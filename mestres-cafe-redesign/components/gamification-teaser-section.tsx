"use client"
import { Button } from "@/components/ui/button"
import { Trophy, Zap, Gift } from "lucide-react" // Importação correta dos ícones
import Link from "next/link"

// Exportação nomeada correta
export function GamificationTeaserSection() {
  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-amber-900 font-carena sm:text-4xl">
          Junte-se à Elite do Café e Ganhe Recompensas!
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-700">
          Nosso programa de gamificação transforma sua paixão por café em uma jornada emocionante. Acumule pontos,
          desbloqueie conquistas e ganhe prêmios exclusivos enquanto explora o universo dos cafés especiais.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 lg:gap-x-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 rounded-full">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800">Desafios Exclusivos</h3>
            <p className="mt-1 text-sm text-gray-600">Complete missões e prove seu conhecimento.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 rounded-full">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800">Pontos e Níveis</h3>
            <p className="mt-1 text-sm text-gray-600">Suba no ranking e mostre que é um Mestre do Café.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 rounded-full">
              <Gift className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800">Recompensas Incríveis</h3>
            <p className="mt-1 text-sm text-gray-600">Troque seus pontos por produtos e descontos.</p>
          </div>
        </div>
        <div className="mt-10">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-allroundgothic">
            <Link href="/gamificacao">Saiba Mais e Participe</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
