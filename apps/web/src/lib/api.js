// Re-export services for compatibility with existing imports
export * from '../services/api.js';
export { supabase } from './supabase.js';

// Compatibility functions for legacy imports
export const getAllProducts = async () => {
  const { productsAPI } = await import('../services/api.js');
  return productsAPI.getAll();
};

export const getProductById = async (id) => {
  const { productsAPI } = await import('../services/api.js');
  return productsAPI.getById(id);
};

export const getAllCourses = async () => {
  // Mock function for courses
  return {
    success: true,
    data: []
  };
};

export const getActiveCourses = async () => {
  // Mock function for active courses
  return {
    success: true,
    data: []
  };
};

export const adminAPI = {
  getStats: async () => ({ success: true, data: {} }),
  getReports: async () => ({ success: true, data: [] }),
};

export const createUserAdmin = async (userData) => {
  // Mock function
  return { success: true, data: userData };
};

export const updateUserAdmin = async (id, userData) => {
  // Mock function
  return { success: true, data: userData };
};

export const getFiltered = async (filters = {}) => {
  // Mock function for filtered data
  return { success: true, data: [] };
};

export const getFeaturedTestimonials = async () => {
  // Mock function for testimonials
  return { 
    success: true, 
    data: [
      {
        id: 1,
        name: "Maria Silva",
        rating: 5,
        comment: "Café excepcional! O melhor que já experimentei.",
        image_url: null,
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        name: "João Santos", 
        rating: 5,
        comment: "Qualidade impressionante e entrega rápida. Recomendo!",
        image_url: null,
        created_at: "2024-01-10T14:20:00Z",
      }
    ] 
  };
};

export const getAllBlogPosts = async () => {
  // Mock function for blog posts
  return { success: true, data: [] };
};

export const getBlogCategories = async () => {
  // Mock function for blog categories
  return { success: true, data: [] };
};

export const getBlogPostBySlug = async (slug) => {
  // Mock function for blog post by slug
  return { success: true, data: null };
};

export const incrementPostViews = async (postId) => {
  // Mock function
  return { success: true, data: null };
};

export const togglePostLike = async (postId) => {
  // Mock function
  return { success: true, data: null };
};

export const addCustomerInteraction = async (customerId, interaction) => {
  // Mock function
  return { success: true, data: interaction };
};

export const addCustomerTask = async (customerId, task) => {
  // Mock function
  return { success: true, data: task };
};

export const getCustomerDetails = async (customerId) => {
  // Mock function
  return { success: true, data: null };
};

export const resetCustomerPassword = async (customerId) => {
  // Mock function
  return { success: true, data: null };
};

export const updateCustomerNotes = async (customerId, notes) => {
  // Mock function
  return { success: true, data: null };
};

export const getById = async (collection, id) => {
  // Mock function
  return { success: true, data: null };
};

export const checkUserLiked = async (postId, userId) => {
  // Mock function
  return { success: true, data: false };
};

export const addComment = async (postId, comment) => {
  // Mock function
  return { success: true, data: comment };
};

export const getPostComments = async (postId) => {
  // Mock function
  return { success: true, data: [] };
};

export const deleteComment = async (commentId) => {
  // Mock function
  return { success: true, data: null };
};

export const recordShare = async (postId, platform) => {
  // Mock function
  return { success: true, data: null };
};

export const getProductCategories = async () => {
  // Mock function
  return { success: true, data: [] };
};

export const getRoastLevels = async () => {
  // Mock function
  return { success: true, data: [] };
};

export const validateProductData = async (productData) => {
  // Mock function
  return { success: true, data: { valid: true } };
};