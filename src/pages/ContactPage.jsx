import React, { useState } from 'react';
// import { _Phone, _Mail, _MapPin, _Clock, _MessageCircle, _Send, _CheckCircle, _Star, _User, _Building, _HelpCircle, _Shield, _Award, _Coffee } from 'lucide-react'; // Temporarily commented - unused import

const _ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'geral',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const _contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Premium",
      description: "Atendimento direto e rápido",
      contact: "(55) 99645-8600",
      action: "Chamar no WhatsApp",
      available: "Online agora",
      gradient: "from-green-500 to-emerald-600",
      badge: "Mais Rápido"
    },
    {
      icon: Mail,
      title: "E-mail Executivo", 
      description: "Para parcerias e orçamentos",
      contact: "contato@mestresdocafe.com.br",
      action: "Enviar E-mail",
      available: "Resposta em 2h",
      gradient: "from-blue-500 to-purple-600",
      badge: "Profissional"
    },
    {
      icon: MapPin,
      title: "Matriz Santa Maria",
      description: "Venha conhecer nossa torrefação",
      contact: "Rua do Café, 123 - Centro",
      action: "Ver no Mapa",
      available: "Seg-Sex 8h-18h",
      gradient: "from-orange-500 to-red-600",
      badge: "Presencial"
    }
  ];

  const _subjects = [
    { value: 'geral', label: 'Informações Gerais' },
    { value: 'pedidos', label: 'Pedidos e Entregas' },
    { value: 'qualidade', label: 'Qualidade dos Produtos' },
    { value: 'parceria', label: 'Parcerias Comerciais' },
    { value: 'franquia', label: 'Oportunidades de Franquia' },
    { value: 'suporte', label: 'Suporte Técnico' }
  ];

  const _faq = [
    {
      question: "Qual o prazo de entrega?",
      answer: "Para Santa Maria: 24-48h. Demais regiões: 3-7 dias úteis. Frete grátis acima de R$ 99."
    },
    {
      question: "Como garantem o frescor do café?",
      answer: "Torramos sob demanda e embalamos com válvula desgaseificante. Cada pacote tem data de torra."
    },
    {
      question: "Têm certificação SCA?",
      answer: "Sim! Todos os nossos cafés especiais são avaliados pelos padrões SCA com pontuação acima de 80."
    },
    {
      question: "Posso visitar a torrefação?",
      answer: "Claro! Agende uma visita pelo WhatsApp. Oferecemos tours guiados e degustações."
    }
  ];

  const _handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'geral',
        message: ''
      });
      setIsSubmitted(false);
    }, 3000);
  };

  const _handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mensagem Enviada!</h2>
          <p className="text-slate-600 mb-6">
            Recebemos sua mensagem e responderemos em breve. Obrigado pelo contato!
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Enviar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2 mb-6">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Atendimento Premium</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Fale <span className="text-amber-400">Conosco</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Estamos aqui para ajudar! Nossa equipe especializada está pronta para esclarecer dúvidas, 
              receber sugestões e oferecer o melhor atendimento em café especial.
            </p>

            <div className="flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Seg-Sex 8h-18h</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">WhatsApp 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="text-sm">Resposta em 2h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Como Podemos Ajudar?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Escolha o canal que preferir para entrar em contato. Nosso time está pronto para atendê-lo!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100">
                {/* Badge */}
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {method.badge}
                  </span>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${method.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {method.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-slate-900">
                      {method.contact}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {method.available}
                    </div>
                  </div>

                  <button className={`w-full bg-gradient-to-r ${method.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105`}>
                    {method.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Form */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
                  <Send className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium text-sm">Formulário Premium</span>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                  Envie sua Mensagem
                </h2>
                
                <p className="text-xl text-slate-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato rapidamente.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Assunto *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none"
                      >
                        {subjects.map(subject => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    placeholder="Conte-nos como podemos ajudar..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-8">
              {/* Testimonial */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 text-lg leading-relaxed mb-6">
                  "Atendimento excepcional! Eles realmente entendem de café e sempre têm as melhores recomendações. Equipe muito profissional."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Maria Clara</div>
                    <div className="text-slate-600 text-sm">Cliente há 2 anos</div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-slate-50 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="w-6 h-6 text-amber-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Perguntas Frequentes
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {faq.map((item, index) => (
                    <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {item.question}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-2xl border border-slate-200">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-xs font-medium text-slate-700">SSL Seguro</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl border border-slate-200">
                  <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-xs font-medium text-slate-700">SCA Certificado</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl border border-slate-200">
                  <Coffee className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-slate-700">Premium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Location */}
      <section className="py-20 lg:py-32 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Venha nos Visitar
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Nossa torrefação está localizada no coração de Santa Maria. 
              Agende uma visita e conheça todo o processo de produção!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Map Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <div className="text-slate-600 font-medium">Mapa Interativo</div>
                  <div className="text-slate-500 text-sm">Rua do Café, 123 - Santa Maria/RS</div>
                </div>
              </div>
              
              {/* Floating Action */}
              <div className="absolute top-6 right-6">
                <button className="bg-white text-slate-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm">
                  Ver no Google Maps
                </button>
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Torrefação Mestres do Café
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Nossa sede conta com torrefação artesanal, laboratório de qualidade, 
                  área de degustação e loja conceito. Venha conhecer todo o processo de produção!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <div className="font-semibold text-slate-900">Endereço</div>
                    <div className="text-slate-600">Rua do Café, 123 - Centro<br />Santa Maria - RS, 97010-000</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <div className="font-semibold text-slate-900">Horário de Funcionamento</div>
                    <div className="text-slate-600">
                      Segunda a Sexta: 8h às 18h<br />
                      Sábado: 8h às 12h<br />
                      Domingo: Fechado
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <div className="font-semibold text-slate-900">Agendamento</div>
                    <div className="text-slate-600">
                      WhatsApp: (55) 99645-8600<br />
                      E-mail: visita@mestresdocafe.com.br
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-6 h-6 text-amber-600" />
                  <span className="font-semibold text-slate-900">Tour Gratuito</span>
                </div>
                <p className="text-slate-700">
                  Agende um tour gratuito pela nossa torrefação e ganhe uma degustação exclusiva 
                  dos nossos melhores cafés especiais!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 