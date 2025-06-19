const request = require('supertest');
const app = require('../../../server/server');

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment', 'development');
      expect(response.body).toHaveProperty('version', '1.0.0');
      
      // Verificar se timestamp é uma data válida
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('deve retornar timestamp atual', async () => {
      const before = new Date();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const after = new Date();
      const responseTime = new Date(response.body.timestamp);
      
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('GET /', () => {
    it('deve retornar informações da API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toMatchObject({
        message: '☕ Mestres do Café API',
        status: 'Online',
        version: '1.0.0'
      });
      
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
      expect(response.body.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('404 Handler', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app)
        .get('/api/rota-inexistente')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Endpoint não encontrado',
        path: '/api/rota-inexistente'
      });
    });
  });
}); 