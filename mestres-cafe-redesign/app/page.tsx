import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { FeaturedProductsSection } from "@/components/featured-products-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ProcessSection } from "@/components/process-section"
import { GamificationTeaserSection } from "@/components/gamification-teaser-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-light via-amber-50 to-white">
      <Header />
      <main className="flex-grow">
        {/* 1. IMPACTO INICIAL - Captura atenção e apresenta proposta de valor */}
        <HeroSection />

        {/* 2. CREDIBILIDADE - Números que impressionam */}
        <StatsSection />

        {/* 3. PRODUTOS EM DESTAQUE - Mostra o que vendemos */}
        <FeaturedProductsSection />

        {/* 4. PROVA SOCIAL - Depoimentos que convencem */}
        <TestimonialsSection />

        {/* 5. DIFERENCIAIS - Por que somos únicos */}
        <WhyChooseSection />

        {/* 6. PROCESSO - Como garantimos qualidade */}
        <ProcessSection />

        {/* 7. GAMIFICAÇÃO - Programa de fidelidade */}
        <GamificationTeaserSection />

        {/* 8. CALL TO ACTION FINAL - Última chance de conversão */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
