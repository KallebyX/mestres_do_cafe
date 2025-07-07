import React, { useState } from 'react';
import { CoffeeButton } from '../components/CoffeeButton';
import { CoffeeCard } from '../components/CoffeeCard';
import { CoffeeForm } from '../components/CoffeeForm';
import { CoffeeLoading } from '../components/CoffeeLoading';

export default function DesignSystemDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simula uma requisição
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Formulário enviado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-coffee-cream to-coffee-warm py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-coffee-dark mb-4">
            Sistema de Design Premium
          </h1>
          <p className="text-xl text-coffee-medium max-w-2xl mx-auto">
            Experimente todos os componentes premium do sistema de design 
            <span className="text-coffee-brown font-semibold"> Mestres do Café</span>
          </p>
        </div>

        {/* Botões Premium */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-coffee-dark mb-6">
            Botões Premium
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <CoffeeButton variant="primary" size="lg">
              Botão Principal
            </CoffeeButton>
            <CoffeeButton variant="secondary" size="lg">
              Botão Secundário
            </CoffeeButton>
            <CoffeeButton variant="premium" size="lg">
              ✨ Botão Premium
            </CoffeeButton>
            <CoffeeButton variant="outline" size="lg">
              Botão Outline
            </CoffeeButton>
            <CoffeeButton variant="ghost" size="lg">
              Botão Ghost
            </CoffeeButton>
            <CoffeeButton variant="destructive" size="lg">
              Botão Destructive
            </CoffeeButton>
          </div>
        </section>

        {/* Cards Premium */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-coffee-dark mb-6">
            Cards Premium
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CoffeeCard variant="default">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Card Padrão</CoffeeCard.Title>
                <CoffeeCard.Description>
                  Um card simples e elegante para conteúdo geral
                </CoffeeCard.Description>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <p className="text-coffee-medium">
                  Conteúdo do card com texto descritivo e informações relevantes.
                </p>
              </CoffeeCard.Content>
              <CoffeeCard.Footer>
                <CoffeeButton variant="outline" size="sm">
                  Ver mais
                </CoffeeButton>
              </CoffeeCard.Footer>
            </CoffeeCard>

            <CoffeeCard variant="premium">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Card Premium ✨</CoffeeCard.Title>
                <CoffeeCard.Description>
                  Card com efeitos especiais e gradientes exclusivos
                </CoffeeCard.Description>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <p className="text-coffee-medium">
                  Este card possui animações suaves e efeitos visuais premium.
                </p>
              </CoffeeCard.Content>
              <CoffeeCard.Footer>
                <CoffeeButton variant="premium" size="sm">
                  Explorar
                </CoffeeButton>
              </CoffeeCard.Footer>
            </CoffeeCard>

            <CoffeeCard variant="product">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Café Especial</CoffeeCard.Title>
                <CoffeeCard.Description>
                  Bourbon Amarelo - Cerrado Mineiro
                </CoffeeCard.Description>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <div className="space-y-2">
                  <p className="text-coffee-medium">Notas: Chocolate, Caramelo</p>
                  <p className="text-coffee-medium">Pontuação SCA: 85</p>
                  <p className="text-2xl font-bold text-coffee-brown">R$ 45,90</p>
                </div>
              </CoffeeCard.Content>
              <CoffeeCard.Footer>
                <CoffeeButton variant="primary" size="sm" className="w-full">
                  Adicionar ao Carrinho
                </CoffeeButton>
              </CoffeeCard.Footer>
            </CoffeeCard>
          </div>
        </section>

        {/* Formulários Premium */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-coffee-dark mb-6">
            Formulários Premium
          </h2>
          <div className="max-w-2xl mx-auto">
            <CoffeeCard variant="elevated">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Fale Conosco</CoffeeCard.Title>
                <CoffeeCard.Description>
                  Entre em contato com nossos especialistas em café
                </CoffeeCard.Description>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <CoffeeForm.Input
                    label="Nome"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <CoffeeForm.Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <CoffeeForm.Textarea
                    label="Mensagem"
                    placeholder="Como podemos ajudar?"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    required
                  />
                  <CoffeeButton 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <CoffeeLoading variant="spinner" size="sm" /> : 'Enviar Mensagem'}
                  </CoffeeButton>
                </form>
              </CoffeeCard.Content>
            </CoffeeCard>
          </div>
        </section>

        {/* Estados de Loading */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-coffee-dark mb-6">
            Estados de Loading
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <CoffeeCard variant="default">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Variantes de Loading</CoffeeCard.Title>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CoffeeLoading variant="spinner" size="sm" />
                    <span>Spinner</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CoffeeLoading variant="pulse" size="sm" />
                    <span>Pulse</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CoffeeLoading variant="dots" size="sm" />
                    <span>Dots</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CoffeeLoading variant="coffee" size="sm" />
                    <span>Coffee</span>
                  </div>
                </div>
              </CoffeeCard.Content>
            </CoffeeCard>

            <CoffeeCard variant="default">
              <CoffeeCard.Header>
                <CoffeeCard.Title>Skeleton Loading</CoffeeCard.Title>
              </CoffeeCard.Header>
              <CoffeeCard.Content>
                <div className="space-y-4">
                  <div className="coffee-skeleton h-4 w-3/4"></div>
                  <div className="coffee-skeleton h-4 w-1/2"></div>
                  <div className="coffee-skeleton h-20 w-full"></div>
                  <div className="coffee-skeleton h-4 w-2/3"></div>
                </div>
              </CoffeeCard.Content>
            </CoffeeCard>
          </div>
        </section>

        {/* Demonstração de Tema */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-coffee-dark mb-6">
            Controle de Tema
          </h2>
          <div className="text-center">
            <CoffeeButton
              variant="outline"
              size="lg"
              onClick={() => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                document.body.classList.toggle('dark', newTheme === 'dark');
                localStorage.setItem('coffee-theme', newTheme);
              }}
            >
              🌙 Alternar Tema
            </CoffeeButton>
          </div>
        </section>

        {/* Footer da demonstração */}
        <div className="text-center py-8 border-t border-coffee-light">
          <p className="text-coffee-medium">
            Sistema de Design Premium - Mestres do Café 2025
          </p>
        </div>
      </div>
    </div>
  );
}