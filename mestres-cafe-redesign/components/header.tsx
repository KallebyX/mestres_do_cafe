"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: "Início", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Gamificação", href: "/gamificacao" },
    { label: "Cursos", href: "/cursos" },
    { label: "Blog", href: "/blog" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu on route change
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]) // Only run when pathname changes

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled || isMenuOpen
          ? "bg-brand-light/95 backdrop-blur-sm shadow-lg border-b border-brand-brown/10"
          : "bg-brand-light/80 backdrop-blur-none shadow-none border-b border-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center shrink-0" aria-label="Mestres do Café - Página Inicial">
            <Image
              src="/logo-mestres-do-cafe.png" // Ensure this logo exists in your public folder
              alt="Mestres do Café Logo"
              width={130} // Intrinsic width
              height={36} // Intrinsic height
              priority // Prioritize loading for LCP
              className="object-contain h-9 md:h-10 w-auto" // Control rendered size
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-6" aria-label="Navegação Principal">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative group font-sans",
                  pathname === item.href ? "text-brand-brown" : "text-brand-dark hover:text-brand-brown",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-[2px] bg-brand-brown transition-all duration-300",
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full",
                  )}
                  aria-hidden="true"
                ></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 hidden lg:inline-flex"
              aria-label="Carrinho de Compras"
              // onClick={() => { /* Implement cart functionality */ }}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <div className="hidden lg:flex items-center space-x-1">
              <Link href="/login" passHref>
                <Button
                  variant="ghost"
                  className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 px-3 py-2 text-sm font-sans"
                >
                  Entrar
                </Button>
              </Link>
              <span className="text-brand-dark/30 hidden md:inline" aria-hidden="true">
                |
              </span>
              <Link href="/registro" passHref>
                <Button className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light px-3 py-2 text-sm shadow-md hover:shadow-lg transition-all font-sans">
                  Cadastrar
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-brand-dark hover:text-brand-brown focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-brown"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen
              ? "max-h-[calc(100vh-4rem)] opacity-100 py-3 border-t border-brand-brown/10" // Adjusted max-h for better fit
              : "max-h-0 opacity-0 py-0 border-t border-transparent",
          )}
        >
          <nav className="flex flex-col space-y-1.5" aria-label="Navegação Móvel">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)} // Close menu on click
                className={cn(
                  "block font-medium py-2.5 px-3 rounded-md transition-colors font-sans text-base",
                  pathname === item.href
                    ? "bg-brand-brown/10 text-brand-brown"
                    : "text-brand-dark hover:bg-brand-brown/5 hover:text-brand-brown",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-brand-brown/10">
              <Link href="/login" passHref className="flex-1">
                <Button
                  variant="outline"
                  className="border-brand-brown text-brand-brown hover:bg-brand-brown/10 justify-center w-full font-sans bg-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/registro" passHref className="flex-1">
                <Button
                  className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light justify-center w-full font-sans"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 flex items-center justify-start w-full mt-2 py-2.5 px-3 font-sans text-base"
              // onClick={() => { /* Implement cart functionality */ setIsMenuOpen(false); }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Carrinho
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
