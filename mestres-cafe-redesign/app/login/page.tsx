"use client" // Required for form interactions
import { Header } from "@/components/header"
import type React from "react"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  // Basic form submission handler (replace with your actual auth logic)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")
    console.log("Login attempt:", { email, password })
    // Here you would typically call your authentication API
    alert("Tentativa de login (simulação)! Verifique o console.")
    // On success, redirect or update auth state
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl border-brand-brown/20 bg-white">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mb-4" aria-label="Voltar para a página inicial">
              <Image
                src="/logo-mestres-do-cafe.png"
                alt="Mestres do Café Logo"
                width={150}
                height={42} // Adjusted for aspect ratio based on typical logo dimensions
                className="mx-auto"
                priority
              />
            </Link>
            <CardTitle className="text-3xl font-serif text-brand-dark">Bem-vindo de Volta!</CardTitle>
            <CardDescription className="font-sans text-brand-dark/70">
              Acesse sua conta para continuar sua jornada pelo mundo dos cafés especiais.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 font-sans">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="#" className="text-xs text-brand-brown hover:underline">
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Sua senha"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold font-sans"
              >
                Entrar
              </Button>
              <p className="text-center text-xs text-brand-dark/70 font-sans">
                Não tem uma conta?{" "}
                <Link href="/registro" className="font-semibold text-brand-brown hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
