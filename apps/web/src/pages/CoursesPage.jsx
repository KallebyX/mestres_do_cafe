import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, PlayCircle, Award } from 'lucide-react';
import { getAllCourses, getActiveCourses } from "@/lib/api"

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // Tentar carregar cursos ativos primeiro, depois todos se não houver ativos
      let result = await getActiveCourses();
      
      if (!result.success || (result.data && result.data.length === 0)) {
        result = await getAllCourses();
      }

      if (result.success && result.data && result.data.length > 0) {
        setCourses(result.data);
        } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cursos:', error);
      setError('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getLevelText = (level) => {
    const levels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário', 
      'advanced': 'Avançado'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
          <p className="text-coffee-gray">Carregando cursos...</p>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Destaque */}
          <div className="bg-gradient-coffee rounded-2xl p-8 mb-16 text-center">
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
                <div className="text-2xl font-bold text-coffee-gold mb-1">+{Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.enrolled_students || 0), 0) : 0}</div>
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

          {/* Lista de Cursos */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="card hover:shadow-gold transition-all duration-300">
                  <div className="flex flex-col h-full">
                    {/* Header do Card */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-coffee-gold/20 rounded-xl flex items-center justify-center text-2xl">
                        <BookOpen className="w-8 h-8 text-coffee-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-coffee-gray">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}h
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrolled_students || 0} alunos
                          </div>
                          {course.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              {course.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-coffee-gray mb-6 flex-1">
                      {course.description}
                    </p>

                    {/* Highlights */}
                    {Array.isArray(course.highlights) && course.highlights.length > 0 && (
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
                    )}

                    {/* Footer do Card */}
                    <div className="flex items-center justify-between pt-4 border-t border-coffee-cream">
                      <div>
                        <div className="font-cormorant font-bold text-2xl text-coffee-gold">
                          {formatPrice(course.price || 0)}
                        </div>
                        <div className="text-sm text-coffee-gray">
                          Nível {getLevelText(course.level)}
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
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-coffee-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-coffee-intense mb-2">Nenhum curso disponível</h3>
              <p className="text-coffee-gray">
                Os cursos serão disponibilizados em breve. Acompanhe nossas novidades!
              </p>
            </div>
          )}

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