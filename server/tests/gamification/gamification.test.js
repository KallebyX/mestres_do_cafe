/* eslint-disable no-undef, no-unused-vars */
const request = require('supertest');
const app = require('../../server.js');

// Função para gerar CPF válido único baseado em timestamp
function generateUniqueCPF(timestamp) {
  // Usar timestamp para gerar números únicos
  const base = timestamp.toString().slice(-9); // Pegar últimos 9 dígitos
  let cpf = base.padStart(9, '1'); // Preencher com 1s se necessário
  
  // Calcular dígitos verificadores
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

describe('Gamification API', () => {
  let userToken;
  let adminToken;
  let testEmail;
  let testCpf;

  beforeEach(async () => {
    // Gerar dados únicos para cada execução de teste
    const timestamp = Date.now();
    testEmail = `cliente.teste.${timestamp}@test.com`;
    testCpf = generateUniqueCPF(timestamp);
    
    // Primeiro registrar um usuário de teste
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cliente Teste',
        email: testEmail,
        password: '123456',
        user_type: 'cliente_pf',
        cpf_cnpj: testCpf,
        phone: `(11) 99999-${timestamp.toString().slice(-4)}`
      });

    // Verificar se o registro foi bem-sucedido
    if (registerResponse.status !== 201) {
      console.error('Erro no registro:', registerResponse.body);
      console.error('CPF usado:', testCpf);
      console.error('Email usado:', testEmail);
      throw new Error(`Falha no registro: ${registerResponse.status}`);
    }

    // Login como cliente
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: '123456'
      });

    if (userLogin.status !== 200) {
      console.error('Erro no login:', userLogin.body);
      throw new Error(`Falha no login: ${userLogin.status}`);
    }

    userToken = userLogin.body.access_token;

    // Login como admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@mestrescafe.com.br',
        password: 'admin123'
      });
    adminToken = adminLogin.body.access_token;
  });

  describe('GET /api/gamification/profile', () => {
    it('deve retornar perfil de gamificação do usuário', async () => {
      const response = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('level');
      expect(response.body.level).toHaveProperty('name');
      expect(response.body.level).toHaveProperty('number');
      expect(response.body.level).toHaveProperty('discount');
      expect(response.body).toHaveProperty('total_spent');
      expect(response.body).toHaveProperty('orders_count');
    });

    it('deve calcular nível corretamente baseado nos pontos', async () => {
      const response = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { points, level } = response.body;

      if (points >= 5000) {
        expect(level.name).toBe('lenda');
        expect(level.number).toBe(5);
        expect(level.discount).toBe(25);
      } else if (points >= 3000) {
        expect(level.name).toBe('mestre');
        expect(level.number).toBe(4);
        expect(level.discount).toBe(20);
      } else if (points >= 1500) {
        expect(level.name).toBe('especialista');
        expect(level.number).toBe(3);
        expect(level.discount).toBe(15);
      } else if (points >= 500) {
        expect(level.name).toBe('conhecedor');
        expect(level.number).toBe(2);
        expect(level.discount).toBe(10);
      } else {
        expect(level.name).toBe('aprendiz');
        expect(level.number).toBe(1);
        expect(level.discount).toBe(5);
      }
    });

    it('deve mostrar próximo nível se não for o máximo', async () => {
      const response = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      if (response.body.level.number < 5) {
        expect(response.body).toHaveProperty('next_level');
        expect(response.body.next_level).toHaveProperty('name');
        expect(response.body.next_level).toHaveProperty('points_needed');
        expect(response.body.next_level.points_needed).toBeGreaterThan(0);
      } else {
        expect(response.body.next_level).toBeNull();
      }
    });

    it('deve rejeitar acesso sem token', async () => {
      const response = await request(app)
        .get('/api/gamification/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token de acesso requerido');
    });
  });

  describe('POST /api/gamification/add-points', () => {
    it('deve adicionar pontos com motivo válido', async () => {
      const pointsToAdd = 50;
      const reason = 'Avaliação de produto';

      const response = await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: pointsToAdd,
          reason: reason
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(`${pointsToAdd} pontos adicionados`);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('points');
      expect(response.body.user).toHaveProperty('level');
    });

    it('deve rejeitar pontos negativos ou zero', async () => {
      const response = await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: -10,
          reason: 'Teste inválido'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Pontos devem ser um número positivo');
    });

    it('deve rejeitar sem motivo', async () => {
      const response = await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: 50
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Motivo é obrigatório');
    });

    it('deve atualizar nível se necessário', async () => {
      // Obter pontos atuais
      const profileBefore = await request(app)
        .get('/api/gamification/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const currentPoints = profileBefore.body.points;
      const currentLevel = profileBefore.body.level.number;

      // Adicionar pontos suficientes para subir de nível
      let pointsToAdd = 500; // Suficiente para ir de aprendiz para conhecedor
      
      if (currentLevel === 1 && currentPoints < 500) {
        pointsToAdd = 500 - currentPoints + 10; // +10 para garantir que passe dos 500
      } else {
        pointsToAdd = 50; // Apenas teste padrão
      }

      const response = await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: pointsToAdd,
          reason: 'Teste de subida de nível'
        })
        .expect(200);

      expect(response.body.user.points).toBe(currentPoints + pointsToAdd);
      
      // Verificar se o nível foi recalculado
      const newPoints = response.body.user.points;
      if (newPoints >= 500 && currentLevel === 1) {
        expect(response.body.user.level.number).toBeGreaterThan(currentLevel);
      }
    });
  });

  describe('GET /api/gamification/points-history', () => {
    it('deve retornar histórico de pontos do usuário', async () => {
      const response = await request(app)
        .get('/api/gamification/points-history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('deve retornar histórico ordenado por data decrescente', async () => {
      // Adicionar alguns pontos primeiro
      await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: 25,
          reason: 'Primeiro teste'
        });

      await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: 25,
          reason: 'Segundo teste'
        });

      const response = await request(app)
        .get('/api/gamification/points-history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      if (response.body.history.length > 1) {
        for (let i = 0; i < response.body.history.length - 1; i++) {
          const currentDate = new Date(response.body.history[i].created_at);
          const nextDate = new Date(response.body.history[i + 1].created_at);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });

    it('deve conter estrutura correta no histórico', async () => {
      // Adicionar pontos para garantir que há histórico
      await request(app)
        .post('/api/gamification/add-points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          points: 30,
          reason: 'Teste estrutura'
        });

      const response = await request(app)
        .get('/api/gamification/points-history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      if (response.body.history.length > 0) {
        const entry = response.body.history[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('user_id');
        expect(entry).toHaveProperty('points');
        expect(entry).toHaveProperty('reason');
        expect(entry).toHaveProperty('created_at');
        expect(typeof entry.points).toBe('number');
        expect(typeof entry.reason).toBe('string');
      }
    });
  });

  describe('GET /api/gamification/leaderboard', () => {
    it('deve retornar leaderboard dos usuários', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      expect(response.body).toHaveProperty('leaderboard');
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });

    it('deve retornar usuários ordenados por pontos decrescente', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      const leaderboard = response.body.leaderboard;
      
      if (leaderboard.length > 1) {
        for (let i = 0; i < leaderboard.length - 1; i++) {
          expect(leaderboard[i].points).toBeGreaterThanOrEqual(leaderboard[i + 1].points);
        }
      }
    });

    it('deve retornar máximo 10 usuários', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      expect(response.body.leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('deve não incluir admins no leaderboard', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      response.body.leaderboard.forEach(user => {
        // Verificamos que o nome não é "Administrador" (nosso admin de teste)
        expect(user.name).not.toBe('Administrador');
      });
    });

    it('deve conter estrutura correta para cada usuário', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .expect(200);

      if (response.body.leaderboard.length > 0) {
        const user = response.body.leaderboard[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('points');
        expect(user).toHaveProperty('level');
        expect(user.level).toHaveProperty('name');
        expect(user.level).toHaveProperty('number');
        expect(user.level).toHaveProperty('discount');
        
        // Verificar que apenas o primeiro nome é mostrado (privacidade)
        expect(user.name.split(' ').length).toBe(1);
      }
    });
  });
}); 