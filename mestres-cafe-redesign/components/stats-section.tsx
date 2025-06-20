import { Coffee, Users, Award } from "lucide-react"

export function StatsSection() {
  const stats = [
    { id: 1, icon: Coffee, value: "100+", label: "Variedades de Café" },
    { id: 2, icon: Users, value: "10k+", label: "Clientes Satisfeitos" },
    { id: 3, icon: Award, value: "50+", label: "Prêmios e Reconhecimentos" },
  ]

  return (
    <section className="py-12 md:py-20 bg-amber-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center">
              <stat.icon className="w-12 h-12 md:w-16 md:h-16 mb-4 text-amber-400" />
              <p className="text-3xl md:text-4xl font-bold font-serif">{stat.value}</p>
              <p className="text-sm md:text-base text-amber-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
