"use client"

import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image" // For logo in footer

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand and About */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center space-x-3 mb-5 group"
              aria-label="Mestres do Café - Página Inicial"
            >
              {/* Using the actual logo image if available */}
              <Image
                src="/logo-mestres-do-cafe.png" // Ensure this logo is suitable for dark backgrounds or use a variant
                alt="Mestres do Café Logo"
                width={48} // Smaller size for footer
                height={48 * (36 / 130)} // Maintain aspect ratio (130x36 original)
                className="h-10 w-auto filter group-hover:opacity-90 transition-opacity" // Example: make logo white/light for dark bg
              />
              <div>
                <h3 className="text-xl font-bold font-serif group-hover:text-brand-brown transition-colors">
                  Mestres do Café
                </h3>
                <p className="text-sm text-brand-brown font-medium">Torrefação Artesanal</p>
              </div>
            </Link>
            <p className="text-brand-light/80 mb-6 max-w-md text-sm leading-relaxed font-sans">
              Conectando você aos melhores cafés especiais do Brasil. Qualidade, tradição e sabor em cada xícara, desde
              2019.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/mestresdocafe" // Replace with actual Instagram
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#" // Replace with actual Facebook link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#" // Replace with actual Twitter/X link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Mestres do Café"
                className="w-9 h-9 bg-brand-light/10 rounded-full flex items-center justify-center hover:bg-brand-brown transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 font-sans uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-2.5 font-sans text-sm">
              {[
                { label: "Marketplace", href: "/marketplace" },
                { label: "Gamificação", href: "/gamificacao" },
                { label: "Cursos", href: "/cursos" },
                { label: "Blog", href: "/blog" },
                { label: "Sobre Nós", href: "/sobre" },
                { label: "Contato", href: "/contato" },
                // { label: "Termos de Serviço", href: "/termos" },
                // { label: "Política de Privacidade", href: "/privacidade" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-brand-light/80 hover:text-brand-brown transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base font-semibold mb-4 font-sans uppercase tracking-wider">Contato</h4>
            <div className="space-y-3.5 font-sans text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:financeiro.mestresdocafe@gmail.com"
                  className="text-brand-light/80 hover:text-brand-brown break-all"
                >
                  financeiro.mestresdocafe@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <a href="tel:+55996458600" className="text-brand-light/80 hover:text-brand-brown">
                  (55) 99645-8600
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-brown mt-0.5 flex-shrink-0" />
                <span className="text-brand-light/80">Rua Riachuelo 351, Sala 102. Centro, Santa Maria / RS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-light/10 mt-10 pt-8 text-center">
          <p className="text-xs text-brand-light/60 font-sans">
            © {currentYear} Mestres do Café. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
          </p>
          {/* <p className="text-xs text-brand-light/50 font-sans mt-1">
            Desenvolvido com <Heart className="inline w-3 h-3 text-red-500" /> por [Seu Nome/Empresa Aqui]
          </p> */}
        </div>
      </div>
    </footer>
  )
}
