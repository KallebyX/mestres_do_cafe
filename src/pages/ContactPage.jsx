import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Aqui você integraria com seu backend
      // const response = await api.post('/contact', formData);
      
      // Simulando envio bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-coffee-intense py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-cormorant font-bold text-5xl lg:text-6xl text-coffee-white mb-6">
                Entre em <span className="text-coffee-gold">Contato</span>
              </h1>
              <p className="text-xl text-coffee-white/80 max-w-3xl mx-auto leading-relaxed">
                Estamos aqui para ajudar você a encontrar o café perfeito. 
                Fale conosco e descubra como podemos tornar sua experiência ainda melhor.
              </p>
            </div>
          </div>
        </section>

        {/* Formulário e Informações */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Formulário */}
              <div>
                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-8">
                  Envie sua Mensagem
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-coffee-intense font-medium mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-coffee-intense font-medium mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-coffee-intense font-medium mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full p-4 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all resize-none"
                      placeholder="Conte-nos como podemos ajudar você..."
                    ></textarea>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      ✅ Mensagem enviada com sucesso!
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                      ❌ Erro ao enviar mensagem. Tente novamente.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-8">
                    Outras Formas de Contato
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="card">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-coffee rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          WhatsApp
                        </h3>
                        <p className="text-coffee-gray">
                          <a 
                            href="https://wa.me/5555996458600" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-coffee-gold hover:text-coffee-intense transition-colors font-medium"
                          >
                            (55) 99645-8600
                          </a>
                        </p>
                        <p className="text-coffee-gray text-sm mt-2">
                          Atendimento de seg. a sex., 8h às 18h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-coffee rounded-lg flex items-center justify-center">
                        <span className="text-2xl">✉️</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          E-mail
                        </h3>
                        <p className="text-coffee-gray">
                          <a 
                            href="mailto:contato@mestrescafe.com.br"
                            className="text-coffee-gold hover:text-coffee-intense transition-colors font-medium"
                          >
                            contato@mestrescafe.com.br
                          </a>
                        </p>
                        <p className="text-coffee-gray text-sm mt-2">
                          Resposta em até 24 horas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-coffee rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📍</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          Localização
                        </h3>
                        <p className="text-coffee-gray">
                          Santa Maria - RS<br />
                          Brasil
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage; 