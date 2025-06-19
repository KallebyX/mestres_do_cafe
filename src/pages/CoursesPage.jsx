import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, Award } from 'lucide-react';

const CoursesPage = () => {
  const courses = [
    {
      id: 1,
      title: 'Barista Profissional - Nível Básico',
      description: 'Aprenda os fundamentos da arte do café, desde a extração até a apresentação.',
      duration: '8 horas',
      level: 'Iniciante',
      price: 'R$ 450,00',
      rating: 4.9,
      students: 156,
      image: '☕',
      highlights: ['Técnicas de extração', 'Latte Art básico', 'Conhecimento dos grãos', 'Certificação']
    },
    {
      id: 2,
      title: 'Torra Artesanal - Intermediário',
      description: 'Domine as técnicas de torrefação para criar perfis únicos de sabor.',
      duration: '12 horas',
      level: 'Intermediário',
      price: 'R$ 650,00',
      rating: 4.8,
      students: 89,
      image: '🔥',
      highlights: ['Perfis de torra', 'Controle de temperatura', 'Análise sensorial', 'Equipamentos']
    },
    {
      id: 3,
      title: 'Cupping e Análise Sensorial',
      description: 'Desenvolva seu paladar para identificar notas e qualidades do café.',
      duration: '6 horas',
      level: 'Intermediário',
      price: 'R$ 380,00',
      rating: 4.9,
      students: 123,
      image: '👃',
      highlights: ['Protocolo SCAA', 'Identificação de defeitos', 'Vocabulário sensorial', 'Prática guiada']
    },
    {
      id: 4,
      title: 'Gestão de Cafeteria',
      description: 'Aprenda a gerenciar todos os aspectos de uma cafeteria de sucesso.',
      duration: '16 horas',
      level: 'Avançado',
      price: 'R$ 850,00',
      rating: 4.7,
      students: 67,
      image: '📊',
      highlights: ['Gestão financeira', 'Atendimento ao cliente', 'Cardápio estratégico', 'Marketing']
    }
  ];

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Cursos de <span className="text-coffee-gold">Especialização</span>
            </h1>
            <p className="text-coffee-gray text-lg max-w-3xl mx-auto">
              Desenvolva suas habilidades no mundo do café com nossos cursos ministrados por especialistas certificados. 
              Do básico ao avançado, temos o curso perfeito para você.
            </p>
          </div>

          {/* Destaque */}
          <div className="bg-gradient-coffee rounded-2xl p-8 mb-16 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-coffee-white" />
              </div>
              <h2 className="font-cormorant font-bold text-3xl text-coffee-white mb-4">
                🏆 Certificação Reconhecida
              </h2>
              <p className="text-coffee-cream text-lg mb-6">
                Nossos cursos são certificados pela Associação Brasileira de Cafés Especiais (ABCE) 
                e reconhecidos no mercado nacional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-coffee-gold mb-1">+500</div>
                  <div className="text-coffee-cream text-sm">Alunos Formados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-coffee-gold mb-1">4.8★</div>
                  <div className="text-coffee-cream text-sm">Avaliação Média</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-coffee-gold mb-1">98%</div>
                  <div className="text-coffee-cream text-sm">Taxa de Satisfação</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Cursos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-gold transition-all duration-300">
                <div className="flex flex-col h-full">
                  {/* Header do Card */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-coffee-gold/20 rounded-xl flex items-center justify-center text-2xl">
                      {course.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-coffee-gray">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students} alunos
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {course.rating}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-coffee-gray mb-6 flex-1">
                    {course.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-coffee-intense mb-3">O que você vai aprender:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-coffee-gray">
                          <div className="w-2 h-2 bg-coffee-gold rounded-full"></div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer do Card */}
                  <div className="flex items-center justify-between pt-4 border-t border-coffee-cream">
                    <div>
                      <div className="font-cormorant font-bold text-2xl text-coffee-gold">
                        {course.price}
                      </div>
                      <div className="text-sm text-coffee-gray">
                        Nível {course.level}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Ver Prévia
                      </button>
                      <button className="btn-primary px-6 py-2 text-sm">
                        Inscrever-se
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-coffee-cream rounded-xl p-8">
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                Não encontrou o curso ideal?
              </h3>
              <p className="text-coffee-gray mb-6 max-w-2xl mx-auto">
                Entre em contato conosco para cursos personalizados ou para grupos. 
                Oferecemos treinamentos in-company e workshops especiais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contato"
                  className="btn-primary px-8 py-3"
                >
                  Falar com Especialista
                </Link>
                <button className="btn-secondary px-8 py-3">
                  Ver Agenda de Turmas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursesPage; 