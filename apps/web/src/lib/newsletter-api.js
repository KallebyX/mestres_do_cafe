// Newsletter API service
export const newsletterAPI = {
  subscribe: async (email) => {
    try {
      return { success: true, data: { email, subscribed: true } };
    } catch (error) {
      return { success: false, error: 'Erro ao se inscrever na newsletter' };
    }
  },

  send: async (data) => {
    try {
      return { success: true, data: { sent: true } };
    } catch (error) {
      return { success: false, error: 'Erro ao enviar newsletter' };
    }
  },

  getStats: async () => {
    try {
      return { success: true, data: { subscribers: 0, sent: 0 } };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }
  }
};

// Add missing newsletter functions
export const sendCompleteNewsletter = async (data) => {
  return { success: true, data: { sent: true } };
};

export const validateNewsletterData = async (data) => {
  return { success: true, data: { valid: true } };
};

export default newsletterAPI;