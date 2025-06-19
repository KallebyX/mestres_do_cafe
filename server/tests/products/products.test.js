/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../../server.js');

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('deve retornar lista de produtos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('deve retornar apenas produtos ativos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      response.body.products.forEach(product => {
        expect(product).toHaveProperty('is_active', true);
      });
    });

    it('deve retornar produtos com estrutura correta', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('is_active');
      }
    });
  });

  describe('GET /api/products/:id', () => {
    it('deve retornar produto específico', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id', '1');
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('price');
    });

    it('deve retornar 404 para produto inexistente', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Produto não encontrado');
    });
  });

  describe('GET /api/products/featured', () => {
    it('deve retornar produtos em destaque', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.products)).toBe(true);
      
      if (response.body.products.length > 0) {
        response.body.products.forEach(product => {
          expect(product).toHaveProperty('is_featured', true);
        });
      }
    });
  });

  describe('Admin Products API', () => {
    let adminToken;

    beforeEach(async () => {
      // Login como admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestrescafe.com.br',
          password: 'admin123'
        });
      adminToken = loginResponse.body.access_token;
    });

    describe('GET /api/admin/products', () => {
      it('deve retornar todos os produtos para admin', async () => {
        const response = await request(app)
          .get('/api/admin/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('total');
        expect(Array.isArray(response.body.products)).toBe(true);
      });

      it('deve rejeitar acesso sem token admin', async () => {
        const response = await request(app)
          .get('/api/admin/products')
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Token de autorização necessário');
      });
    });

    describe('POST /api/admin/products', () => {
      it('deve criar novo produto com dados válidos', async () => {
        const newProduct = {
          name: 'Café Teste',
          description: 'Descrição do café teste',
          price: 39.90,
          original_price: 49.90,
          category: 'especial',
          stock_quantity: 50,
          is_featured: true
        };

        const response = await request(app)
          .post('/api/admin/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newProduct)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Produto criado com sucesso');
        expect(response.body).toHaveProperty('product');
        expect(response.body.product).toHaveProperty('name', newProduct.name);
        expect(response.body.product).toHaveProperty('price', newProduct.price);
      });

      it('deve rejeitar criação sem campos obrigatórios', async () => {
        const incompleteProduct = {
          name: 'Café Incompleto'
        };

        const response = await request(app)
          .post('/api/admin/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(incompleteProduct)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('obrigatórios');
      });
    });

    describe('PUT /api/admin/products/:id', () => {
      it('deve atualizar produto existente', async () => {
        const updatedData = {
          name: 'Café Atualizado',
          description: 'Descrição atualizada',
          price: 45.90,
          category: 'especial',
          stock_quantity: 30,
          is_featured: false
        };

        const response = await request(app)
          .put('/api/admin/products/1')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updatedData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Produto atualizado com sucesso');
        expect(response.body.product).toHaveProperty('name', updatedData.name);
      });

      it('deve retornar 404 para produto inexistente', async () => {
        const response = await request(app)
          .put('/api/admin/products/999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Teste',
            description: 'Teste',
            price: 10,
            category: 'teste',
            stock_quantity: 1
          })
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Produto não encontrado');
      });
    });

    describe('DELETE /api/admin/products/:id', () => {
      it('deve excluir produto existente', async () => {
        const response = await request(app)
          .delete('/api/admin/products/1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Produto excluído com sucesso');
      });

      it('deve retornar 404 para produto inexistente', async () => {
        const response = await request(app)
          .delete('/api/admin/products/999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Produto não encontrado');
      });
    });
  });
}); 