/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../../../server/server');

// Função para gerar CPF válido único baseado em timestamp
function generateUniqueCPF(timestamp) {
  const base = timestamp.toString().slice(-9);
  let cpf = base.padStart(9, '1');
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 10 ? remainder : 0;
  
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  sum += digit1 * 2;
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 10 ? remainder : 0;
  
  return cpf + digit1 + digit2;
}

// Função para gerar CNPJ válido único baseado em timestamp
function generateUniqueCNPJ(timestamp) {
  const base = timestamp.toString().slice(-8);
  let cnpj = base.padStart(8, '1') + '0001';
  
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt((cnpj + digit1).charAt(i)) * weights[i];
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return cnpj + digit1 + digit2;
}

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestrescafe.com.br',
          password: 'admin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@mestrescafe.com.br');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestrescafe.com.br',
          password: 'senhaerrada'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Email ou senha incorretos');
    });

    it('deve rejeitar email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@test.com',
          password: 'admin123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Email ou senha incorretos');
    });

    it('deve rejeitar login sem email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email e senha são obrigatórios');
    });

    it('deve rejeitar login sem senha', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestrescafe.com.br'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email e senha são obrigatórios');
    });
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário PF com dados válidos', async () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'Novo Usuario',
        email: `novo.pf.${timestamp}@test.com`,
        password: '123456',
        user_type: 'cliente_pf',
        phone: `(11) 99999-${timestamp.toString().slice(-4)}`,
        cpf_cnpj: generateUniqueCPF(timestamp),
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('pontos de boas-vindas');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('welcome_points', 100);
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).toHaveProperty('points', 100);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve registrar novo usuário PJ com dados válidos', async () => {
      const timestamp = Date.now() + 1; // +1 para garantir timestamp diferente
      const newUser = {
        name: 'João Silva',
        email: `empresa.pj.${timestamp}@test.com`,
        password: '123456',
        user_type: 'cliente_pj',
        phone: `(11) 99999-${timestamp.toString().slice(-4)}`,
        cpf_cnpj: generateUniqueCNPJ(timestamp),
        company_name: 'Empresa Teste LTDA',
        company_segment: 'Tecnologia',
        address: 'Av. Comercial, 456',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('user_type', 'cliente_pj');
      expect(response.body.user).toHaveProperty('company_name', newUser.company_name);
    });

    it('deve rejeitar registro com email duplicado', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Teste',
          email: 'admin@mestrescafe.com.br',
          password: '123456',
          user_type: 'cliente_pf',
          cpf_cnpj: '12345678909'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email já está em uso');
    });

    it('deve rejeitar registro sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incompleto@test.com',
          password: '123456'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Nome, email e senha são obrigatórios');
    });

    it('deve rejeitar senha muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Teste',
          email: 'senha-curta@test.com',
          password: '123',
          user_type: 'cliente_pf',
          cpf_cnpj: '22233344456'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar CPF inválido para PF', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Teste',
          email: 'cpf-invalido@test.com',
          password: '123456',
          user_type: 'cliente_pf',
          cpf_cnpj: '12345678900'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'CPF inválido');
    });

    it('deve rejeitar PJ sem nome da empresa', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'pj-sem-empresa@test.com',
          password: '123456',
          user_type: 'cliente_pj',
          cpf_cnpj: '11444777000161'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Nome da empresa é obrigatório para pessoa jurídica');
    });
  });

  describe('GET /api/auth/verify-token', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestrescafe.com.br',
          password: 'admin123'
        });
      authToken = loginResponse.body.access_token;
    });

    it('deve verificar token válido', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@mestrescafe.com.br');
    });

    it('deve rejeitar requisição sem token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token de acesso requerido');
    });

    it('deve rejeitar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', 'Bearer token-invalido')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Token inválido ou expirado');
    });
  });
}); 