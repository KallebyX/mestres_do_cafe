"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { User, Building, Eye, EyeOff, UserPlus } from "lucide-react"
import Image from "next/image"

type AccountType = "cpf" | "cnpj"

export default function RegistroPage() {
  const [accountType, setAccountType] = useState<AccountType>("cpf")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Basic form submission handler (replace with your actual registration logic)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    data.accountType = accountType // Add account type to submitted data
    console.log("Registration data:", data)
    // Here you would typically send the data to a backend API for registration
    // Validate passwords match, etc.
    if (formData.get("password") !== formData.get("confirm-password")) {
      alert("As senhas não coincidem!")
      return
    }
    alert("Conta criada (simulação)! Verifique o console para os dados.")
    event.currentTarget.reset()
    // On success, redirect or update auth state
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow flex items-center justify-center py-8 md:py-12 px-4">
        <Card className="w-full max-w-lg shadow-2xl border-brand-brown/20 bg-white">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mb-4" aria-label="Voltar para a página inicial">
              <Image
                src="/logo-mestres-do-cafe.png"
                alt="Mestres do Café Logo"
                width={150}
                height={42}
                className="mx-auto"
                priority
              />
            </Link>
            <CardTitle className="text-3xl md:text-4xl font-serif text-brand-dark">Crie sua Conta</CardTitle>
            <CardDescription className="font-sans text-brand-dark/70 pt-1">
              Junte-se à comunidade Mestres do Café e comece a explorar um mundo de sabores!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 font-sans">
              <div>
                <Label className="block text-sm font-medium text-brand-dark mb-2">Tipo de Conta</Label>
                <RadioGroup
                  value={accountType}
                  onValueChange={(value: string) => setAccountType(value as AccountType)}
                  className="grid grid-cols-2 gap-4"
                  name="accountTypeSelection" // Added name for form submission if needed directly
                >
                  <Label
                    htmlFor="cpf"
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-brand-light cursor-pointer transition-all duration-200 ${
                      accountType === "cpf"
                        ? "border-brand-brown bg-brand-brown/10 ring-2 ring-brand-brown"
                        : "border-brand-dark/20"
                    }`}
                  >
                    <RadioGroupItem value="cpf" id="cpf" className="sr-only" />
                    <User
                      className={`mb-2 h-6 w-6 transition-colors ${accountType === "cpf" ? "text-brand-brown" : "text-brand-dark/60"}`}
                    />
                    <span
                      className={`font-medium transition-colors ${accountType === "cpf" ? "text-brand-brown" : "text-brand-dark"}`}
                    >
                      Pessoa Física
                    </span>
                  </Label>
                  <Label
                    htmlFor="cnpj"
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-brand-light cursor-pointer transition-all duration-200 ${
                      accountType === "cnpj"
                        ? "border-brand-brown bg-brand-brown/10 ring-2 ring-brand-brown"
                        : "border-brand-dark/20"
                    }`}
                  >
                    <RadioGroupItem value="cnpj" id="cnpj" className="sr-only" />
                    <Building
                      className={`mb-2 h-6 w-6 transition-colors ${accountType === "cnpj" ? "text-brand-brown" : "text-brand-dark/60"}`}
                    />
                    <span
                      className={`font-medium transition-colors ${accountType === "cnpj" ? "text-brand-brown" : "text-brand-dark"}`}
                    >
                      Pessoa Jurídica
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              {accountType === "cpf" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="cpf-name">Nome Completo</Label>
                    <Input
                      id="cpf-name"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      required={accountType === "cpf"}
                      className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cpf-number">CPF</Label>
                    <Input
                      id="cpf-number"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      required={accountType === "cpf"}
                      className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                    />
                  </div>
                </>
              )}

              {accountType === "cnpj" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj-company-name">Nome da Empresa (Razão Social)</Label>
                    <Input
                      id="cnpj-company-name"
                      name="companyName"
                      type="text"
                      placeholder="Nome da sua empresa"
                      required={accountType === "cnpj"}
                      className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj-number">CNPJ</Label>
                    <Input
                      id="cnpj-number"
                      name="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      required={accountType === "cnpj"}
                      className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj-responsible-name">Nome do Responsável</Label>
                    <Input
                      id="cnpj-responsible-name"
                      name="responsibleName"
                      type="text"
                      placeholder="Nome do responsável pela empresa"
                      required={accountType === "cnpj"}
                      className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
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
              <div className="space-y-1.5 relative">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown pr-10"
                  autoComplete="new-password"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-7 h-7 w-7 text-brand-dark/60 hover:text-brand-brown"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-1.5 relative">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown pr-10"
                  autoComplete="new-password"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-7 h-7 w-7 text-brand-dark/60 hover:text-brand-brown"
                  aria-label={showConfirmPassword ? "Esconder confirmação de senha" : "Mostrar confirmação de senha"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown"
                />
                <Label htmlFor="terms" className="text-sm text-brand-dark/80">
                  Eu li e concordo com os{" "}
                  <Link href="/termos" className="text-brand-brown hover:underline" target="_blank">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade" className="text-brand-brown hover:underline" target="_blank">
                    Política de Privacidade
                  </Link>
                  .
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold font-sans py-3 text-base"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Criar Conta
              </Button>
              <p className="text-center text-sm text-brand-dark/70 font-sans">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-semibold text-brand-brown hover:underline">
                  Faça Login
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
