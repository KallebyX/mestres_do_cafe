"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Instagram, MessageSquare } from "lucide-react"

export default function ContatoPage() {
  // Basic form submission handler (replace with your actual logic, e.g., API call)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    console.log("Form data:", data)
    // Here you would typically send the data to a backend API
    alert("Mensagem enviada (simulação)! Verifique o console para os dados.")
    event.currentTarget.reset()
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-10 md:mb-16">
          <MessageSquare className="w-16 h-16 text-brand-brown mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">Entre em Contato</h1>
          <p className="text-lg md:text-xl text-brand-dark/80 font-sans max-w-2xl mx-auto">
            Adoraríamos ouvir de você! Envie suas dúvidas, sugestões ou apenas diga um olá.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Formulário de Contato */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-brand-brown/10">
            <h2 className="text-2xl font-serif text-brand-dark mb-6">Envie uma Mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-brand-dark mb-1">
                  Assunto
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Sobre o que gostaria de falar?"
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-1">
                  Mensagem <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Sua mensagem..."
                  required
                  className="border-brand-brown/30 focus:border-brand-brown focus:ring-brand-brown"
                  aria-required="true"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-brown hover:bg-brand-brown/90 text-brand-light font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-8 font-sans">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-brand-brown/10">
              <h3 className="text-xl font-serif text-brand-dark mb-4">Nossas Informações</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-brand-brown mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-brand-dark">Email</h4>
                    <a
                      href="mailto:financeiro.mestresdocafe@gmail.com"
                      className="text-brand-dark/80 hover:text-brand-brown transition-colors"
                    >
                      financeiro.mestresdocafe@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-brand-brown mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-brand-dark">Telefone / WhatsApp</h4>
                    <a
                      href="https://wa.me/55996458600" // Assumes Brazilian number format for WhatsApp link
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-dark/80 hover:text-brand-brown transition-colors"
                    >
                      (55) 99645-8600
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-brand-brown mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-brand-dark">Endereço</h4>
                    <p className="text-brand-dark/80">Rua Riachuelo 351, Sala 102. Centro, Santa Maria / RS.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Instagram className="w-5 h-5 text-brand-brown mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-brand-dark">Instagram</h4>
                    <a
                      href="https://instagram.com/mestresdocafe" // Replace with actual Instagram profile
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-dark/80 hover:text-brand-brown transition-colors"
                    >
                      @mestresdocafe
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Mapa do Google (Opcional - replace with your actual embed link) */}
            {/* 
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-brand-brown/10">
              <h3 className="text-xl font-serif text-brand-dark mb-4">Nossa Localização</h3>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-brand-brown/20">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3473.0000000000005!2d-53.809000000000004!3d-29.686000000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xYOUR_GOOGLE_MAPS_EMBED_LINK!2sMestres%20do%20Caf%C3%A9!5e0!3m2!1spt-BR!2sbr!4vTIMESTAMP" 
                  width="100%" 
                  height="300" 
                  style={{border:0}} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Mestres do Café"
                ></iframe>
              </div>
            </div>
            */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
