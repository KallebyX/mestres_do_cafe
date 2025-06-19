const fs = require('fs');
const path = require('path');

// Mock do banco de dados para testes
const TEST_DB_FILE = './test_users.json';

// Setup antes de todos os testes
beforeAll(() => {
  // Criar arquivo de teste limpo
  const testData = {
    users: [
      {
        id: 1,
        name: 'Admin Teste',
        email: 'admin@test.com',
        password: '$2b$12$RZOiTGstHxg27izW7bRPR.WAjMYPjZv4WopklVPsGNxP2TO3.LUeK', // admin123
        user_type: 'admin',
        phone: '(11) 99999-9999',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Cliente Teste',
        email: 'cliente@test.com',
        password: '$2b$12$RZOiTGstHxg27izW7bRPR.WAjMYPjZv4WopklVPsGNxP2TO3.LUeK', // admin123
        user_type: 'cliente_pf',
        phone: '(11) 99999-0000',
        cpf_cnpj: '12345678901',
        points: 100,
        level: 'aprendiz',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    points_history: []
  };
  
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE);
  }
  fs.writeFileSync(TEST_DB_FILE, JSON.stringify(testData, null, 2));
});

// Cleanup após todos os testes
afterAll(() => {
  // Remover arquivo de teste
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE);
  }
});

// Reset do banco para cada teste
beforeEach(() => {
  const testData = {
    users: [
      {
        id: 1,
        name: 'Admin Teste',
        email: 'admin@test.com',
        password: '$2b$12$RZOiTGstHxg27izW7bRPR.WAjMYPjZv4WopklVPsGNxP2TO3.LUeK',
        user_type: 'admin',
        phone: '(11) 99999-9999',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Cliente Teste',
        email: 'cliente@test.com',
        password: '$2b$12$RZOiTGstHxg27izW7bRPR.WAjMYPjZv4WopklVPsGNxP2TO3.LUeK',
        user_type: 'cliente_pf',
        phone: '(11) 99999-0000',
        cpf_cnpj: '12345678901',
        points: 100,
        level: 'aprendiz',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    points_history: []
  };
  
  fs.writeFileSync(TEST_DB_FILE, JSON.stringify(testData, null, 2));
});

// Mock do console para testes mais limpos
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

module.exports = {
  TEST_DB_FILE
}; 