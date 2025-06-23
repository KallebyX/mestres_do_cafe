import { supabase } from './supabase.js';

// =============================================
// COURSES - BUSCAR E LISTAR
// =============================================

export const getAllCourses = async () => {
  try {
    console.log('🎓 Buscando todos os cursos...');
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar cursos:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ ${data?.length || 0} cursos encontrados`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Erro ao buscar cursos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getActiveCourses = async () => {
  try {
    console.log('🎓 Buscando cursos ativos...');
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar cursos ativos:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ ${data?.length || 0} cursos ativos encontrados`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Erro ao buscar cursos ativos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getCourseById = async (courseId) => {
  try {
    console.log(`🎓 Buscando curso ${courseId}...`);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar curso:', error);
      return { success: false, error: error.message, data: null };
    }

    console.log('✅ Curso encontrado:', data.title);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Erro ao buscar curso:', error);
    return { success: false, error: error.message, data: null };
  }
};

// =============================================
// COURSES - CRIAR E EDITAR
// =============================================

export const createCourse = async (courseData) => {
  try {
    console.log('📝 Criando novo curso...');
    
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        detailed_description: courseData.detailed_description,
        duration: courseData.duration,
        level: courseData.level,
        price: courseData.price,
        original_price: courseData.original_price,
        instructor: courseData.instructor,
        max_students: courseData.max_students,
        image: courseData.image,
        tags: courseData.tags || [],
        is_active: courseData.is_active !== false,
        is_featured: courseData.is_featured || false,
        schedule: courseData.schedule,
        location: courseData.location,
        enrolled_students: 0,
        rating: 0.0
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar curso:', error);
      return { success: false, error: error.message, data: null };
    }

    console.log('✅ Curso criado com sucesso:', data.title);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Erro ao criar curso:', error);
    return { success: false, error: error.message, data: null };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    console.log(`📝 Atualizando curso ${courseId}...`);
    
    const { data, error } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description,
        detailed_description: courseData.detailed_description,
        duration: courseData.duration,
        level: courseData.level,
        price: courseData.price,
        original_price: courseData.original_price,
        instructor: courseData.instructor,
        max_students: courseData.max_students,
        image: courseData.image,
        tags: courseData.tags || [],
        is_active: courseData.is_active !== false,
        is_featured: courseData.is_featured || false,
        schedule: courseData.schedule,
        location: courseData.location,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar curso:', error);
      return { success: false, error: error.message, data: null };
    }

    console.log('✅ Curso atualizado com sucesso:', data.title);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Erro ao atualizar curso:', error);
    return { success: false, error: error.message, data: null };
  }
};

// =============================================
// COURSES - GERENCIAMENTO
// =============================================

export const deleteCourse = async (courseId) => {
  try {
    console.log(`🗑️ Removendo curso ${courseId}...`);
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('❌ Erro ao remover curso:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Curso removido com sucesso');
    return { success: true, message: 'Curso removido com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao remover curso:', error);
    return { success: false, error: error.message };
  }
};

export const toggleCourseStatus = async (courseId, isActive) => {
  try {
    console.log(`🔄 Alterando status do curso ${courseId} para ${isActive ? 'ativo' : 'inativo'}...`);
    
    const { data, error } = await supabase
      .from('courses')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao alterar status do curso:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Status do curso alterado com sucesso');
    return { success: true, data: data, message: `Curso ${isActive ? 'ativado' : 'desativado'} com sucesso` };
  } catch (error) {
    console.error('❌ Erro ao alterar status do curso:', error);
    return { success: false, error: error.message };
  }
};

export const toggleCourseFeatured = async (courseId, isFeatured) => {
  try {
    console.log(`⭐ Alterando destaque do curso ${courseId} para ${isFeatured ? 'destacado' : 'normal'}...`);
    
    const { data, error } = await supabase
      .from('courses')
      .update({
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao alterar destaque do curso:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Destaque do curso alterado com sucesso');
    return { success: true, data: data, message: `Curso ${isFeatured ? 'destacado' : 'removido do destaque'} com sucesso` };
  } catch (error) {
    console.error('❌ Erro ao alterar destaque do curso:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// COURSES - MATRÍCULA E AVALIAÇÃO
// =============================================

export const enrollStudent = async (courseId) => {
  try {
    console.log(`📝 Matriculando aluno no curso ${courseId}...`);
    
    // Primeiro, buscar dados atuais do curso
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('enrolled_students, max_students')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar curso:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Verificar se há vagas disponíveis
    if (course.enrolled_students >= course.max_students) {
      return { success: false, error: 'Curso lotado - não há vagas disponíveis' };
    }

    // Incrementar número de alunos matriculados
    const { data, error } = await supabase
      .from('courses')
      .update({
        enrolled_students: course.enrolled_students + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao matricular aluno:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Aluno matriculado com sucesso');
    return { success: true, data: data, message: 'Matrícula realizada com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao matricular aluno:', error);
    return { success: false, error: error.message };
  }
};

export const updateCourseRating = async (courseId, newRating) => {
  try {
    console.log(`⭐ Atualizando avaliação do curso ${courseId} para ${newRating}...`);
    
    const { data, error } = await supabase
      .from('courses')
      .update({
        rating: newRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar avaliação:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Avaliação atualizada com sucesso');
    return { success: true, data: data, message: 'Avaliação atualizada com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao atualizar avaliação:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// COURSES - ESTATÍSTICAS
// =============================================

export const getCoursesStats = async () => {
  try {
    console.log('📊 Calculando estatísticas dos cursos...');
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar cursos para estatísticas:', error);
      return { success: false, error: error.message, stats: {} };
    }

    const stats = {
      total: courses.length,
      active: courses.filter(c => c.is_active).length,
      featured: courses.filter(c => c.is_featured).length,
      total_enrolled: courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0),
      total_capacity: courses.reduce((sum, c) => sum + (c.max_students || 0), 0),
      total_revenue: courses.reduce((sum, c) => sum + (c.price * (c.enrolled_students || 0)), 0),
      average_rating: courses.length > 0 
        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
        : 0,
      occupancy_rate: courses.reduce((sum, c) => sum + (c.max_students || 0), 0) > 0
        ? ((courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0) / courses.reduce((sum, c) => sum + (c.max_students || 0), 0)) * 100).toFixed(1)
        : 0
    };

    console.log('✅ Estatísticas calculadas:', stats);
    return { success: true, stats: stats };
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return { success: false, error: error.message, stats: {} };
  }
};

// =============================================
// EXPORT DEFAULT
// =============================================

export default {
  getAllCourses,
  getActiveCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  toggleCourseFeatured,
  enrollStudent,
  updateCourseRating,
  getCoursesStats
}; 