// Newsletter API service
export const newsletterAPI = {
  subscribe: async (email) => {
    try {
      // Mock implementation
      return { success: true, data: { email, subscribed: true } };
    } catch (error) {
      return { success: false, error: 'Erro ao se inscrever na newsletter' };
    }
  },

  send: async (data) => {
    try {
      // Mock implementation
      return { success: true, data: { sent: true } };
    } catch (error) {
      return { success: false, error: 'Erro ao enviar newsletter' };
    }
  },

  getStats: async () => {
    try {
      // Mock implementation
      return { success: true, data: { subscribers: 0, sent: 0 } };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }
  }
};

export default newsletterAPI;