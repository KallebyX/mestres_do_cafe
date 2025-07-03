const express = require('express');
const _router = express.Router();
const _fs = require('fs');
const _path = require('path');
const { validateAdmin } = require('../middleware/auth');

// Funções de banco JSON (copiadas do server.js)
const _DB_FILE = path.join(__dirname, '../data/db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Criar arquivo inicial se não existir
      const _initialData = { users: [], products: [], orders: [] };
      writeDB(initialData);
      return initialData;
    }
    const _data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco JSON:', error);
    return { users: [], products: [], orders: [] };
  }
}

function writeDB(_data) {
  try {
    const _dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao escrever banco JSON:', error);
  }
}

// Validar CPF/CNPJ
const _validateDocument = (document, type) => {
  if (!document) return false;
  
  if (type === 'cliente_pf') {
    // Validação básica CPF (11 dígitos)
    const _cpf = document.replace(/\D/g, '');
    return cpf.length === 11 && !/^(\d)\1{10}$/.test(cpf);
  } else if (type === 'cliente_pj') {
    // Validação básica CNPJ (14 dígitos)
    const _cnpj = document.replace(/\D/g, '');
    return cnpj.length === 14 && !/^(\d)\1{13}$/.test(cnpj);
  }
  
  return false;
};

// Criar cliente manual pelo admin
router.post('/create-customer', validateAdmin, async (req, res) => {
  const {
    name, email, user_type, phone, cpf_cnpj,
    address, city, state, zip_code, company_name, company_segment,
    observacao
  } = req.body;
  
  const _adminId = req.user.userId;
  
  try {
    // Validações básicas
    if (!name || !email || !user_type) {
      return res.status(400).json({ 
        error: 'Nome, email e tipo de usuário são obrigatórios' 
      });
    }
    
    if (!['cliente_pf', 'cliente_pj'].includes(user_type)) {
      return res.status(400).json({ 
        error: 'Tipo de usuário deve ser cliente_pf ou cliente_pj' 
      });
    }
    
    // Validar documento
    if (cpf_cnpj && !validateDocument(cpf_cnpj, user_type)) {
      return res.status(400).json({ 
        error: user_type === 'cliente_pf' ? 'CPF inválido' : 'CNPJ inválido' 
      });
    }
    
    const _database = readDB();
    
    // Verificar se email já existe
    const _existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Já existe um cliente cadastrado com este email' 
      });
    }
    
    // Verificar se CPF/CNPJ já existe (se fornecido)
    if (cpf_cnpj) {
      const _existingDoc = database.users.find(u => u.cpf_cnpj === cpf_cnpj);
      if (existingDoc) {
        return res.status(400).json({ 
          error: `Já existe um cliente cadastrado com este ${user_type === 'cliente_pf' ? 'CPF' : 'CNPJ'}` 
        });
      }
    }
    
    // Gerar ID único para o cliente
    const _customerId = require('crypto').randomUUID();
    
    // Inserir cliente com status pendente de ativação
    const _customer = {
      id: customerId,
      name,
      email,
      user_type,
      phone,
      cpf_cnpj,
      address,
      city,
      state,
      zip_code,
      company_name,
      company_segment,
      criado_por_admin: true,
      pendente_ativacao: true,
      created_by_admin_id: adminId,
      observacao,
      points: 100,
      level: 'Bronze',
      role: 'customer',
      permissions: JSON.stringify(['read']),
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    database.users.push(customer);
    writeDB(database);
    
    res.json({
      success: true,
      message: 'Cliente criado com sucesso! O cliente precisará definir uma senha no primeiro acesso.',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        user_type: customer.user_type,
        phone: customer.phone,
        cpf_cnpj: customer.cpf_cnpj,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zip_code,
        company_name: customer.company_name,
        observacao: customer.observacao,
        criado_por_admin: true,
        pendente_ativacao: true,
        admin_name: null,
        created_at: customer.created_at
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar cliente manual:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao criar cliente' 
    });
  }
});

// Listar clientes criados pelo admin
router.get('/admin-customers', validateAdmin, async (req, res) => {
  const { page = 1, limit = 20, search, status = 'all' } = req.query;
  const _offset = (page - 1) * limit;
  
  try {
    const _database = readDB();
    
    // Filtrar clientes criados pelo admin
    let _customers = database.users.filter(user => user.criado_por_admin === true);
    
    // Filtro por busca
    if (search) {
      const _searchTerm = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por status
    if (status === 'pending') {
      customers = customers.filter(customer => customer.pendente_ativacao === true);
    } else if (status === 'active') {
      customers = customers.filter(customer => customer.pendente_ativacao !== true);
    }
    
    // Aplicar paginação
    const _total = customers.length;
    const _pages = Math.ceil(total / limit);
    const _paginatedCustomers = customers.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      customers: paginatedCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        user_type: customer.user_type,
        phone: customer.phone,
        cpf_cnpj: customer.cpf_cnpj,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zip_code,
        company_name: customer.company_name,
        observacao: customer.observacao,
        criado_por_admin: !!customer.criado_por_admin,
        pendente_ativacao: !!customer.pendente_ativacao,
        data_ativacao: customer.data_ativacao,
        admin_name: customer.created_by_admin_id ? null : customer.name,
        admin_email: customer.created_by_admin_id ? null : customer.email,
        orders_count: customer.orders_count || 0,
        total_spent: parseFloat(customer.total_spent) || 0,
        points: customer.points,
        level: customer.level,
        is_active: !!customer.is_active,
        created_at: customer.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar clientes criados pelo admin:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao buscar clientes' 
    });
  }
});

// Editar cliente criado pelo admin
router.put('/edit-customer/:customerId', validateAdmin, async (req, res) => {
  const { customerId } = req.params;
  const {
    name, phone, cpf_cnpj, address, city, state, zip_code,
    company_name, company_segment, observacao, is_active
  } = req.body;
  
  try {
    const _database = readDB();
    
    // Verificar se o cliente existe e foi criado pelo admin
    const _customerIndex = database.users.findIndex(u => u.id === customerId && u.criado_por_admin);
    
    if (customerIndex === -1) {
      return res.status(404).json({ 
        error: 'Cliente não encontrado ou não foi criado pelo admin' 
      });
    }
    
    const _customer = database.users[customerIndex];
    
    // Validar documento se fornecido
    if (cpf_cnpj && !validateDocument(cpf_cnpj, customer.user_type)) {
      return res.status(400).json({ 
        error: customer.user_type === 'cliente_pf' ? 'CPF inválido' : 'CNPJ inválido' 
      });
    }
    
    // Verificar se CPF/CNPJ já existe em outro cliente (se alterado)
    if (cpf_cnpj && cpf_cnpj !== customer.cpf_cnpj) {
      const _existingDoc = database.users.find(u => u.cpf_cnpj === cpf_cnpj && u.id !== customerId);
      if (existingDoc) {
        return res.status(400).json({ 
          error: `Já existe outro cliente com este ${customer.user_type === 'cliente_pf' ? 'CPF' : 'CNPJ'}` 
        });
      }
    }
    
    // Atualizar cliente
    const _updatedCustomer = {
      ...customer,
      name: name || customer.name,
      phone: phone || customer.phone,
      cpf_cnpj: cpf_cnpj || customer.cpf_cnpj,
      address: address || customer.address,
      city: city || customer.city,
      state: state || customer.state,
      zip_code: zip_code || customer.zip_code,
      company_name: company_name || customer.company_name,
      company_segment: company_segment || customer.company_segment,
      observacao: observacao || customer.observacao,
      is_active: is_active !== undefined ? is_active : customer.is_active,
      updated_at: new Date().toISOString()
    };
    
    database.users[customerIndex] = updatedCustomer;
    writeDB(database);
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao editar cliente' 
    });
  }
});

// Ativar/desativar cliente
router.patch('/toggle-status/:customerId', validateAdmin, async (req, res) => {
  const { customerId } = req.params;
  const { is_active } = req.body;
  
  try {
    const _database = readDB();
    
    const _customerIndex = database.users.findIndex(u => u.id === customerId && u.criado_por_admin);
    
    if (customerIndex === -1) {
      return res.status(404).json({ 
        error: 'Cliente não encontrado ou não foi criado pelo admin' 
      });
    }
    
    // Atualizar status
    database.users[customerIndex].is_active = is_active;
    database.users[customerIndex].updated_at = new Date().toISOString();
    
    writeDB(database);
    
    res.json({
      success: true,
      message: `Cliente ${is_active ? 'ativado' : 'desativado'} com sucesso!`
    });
    
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao alterar status' 
    });
  }
});

// Listar TODOS os clientes do sistema (admin + auto-cadastrados)
router.get('/all-customers', validateAdmin, async (req, res) => {
  const { page = 1, limit = 20, search, source = 'all', status = 'all' } = req.query;
  const _offset = (page - 1) * limit;
  
  try {
    console.log('Carregando todos os clientes...');
    
    const _database = readDB();
    console.log('Total de usuários no banco:', database.users.length);
    
    // Filtrar apenas clientes (não admins)
    let _customers = database.users.filter(user => 
      user.user_type && 
      user.user_type !== 'admin' && 
      ['cliente_pf', 'cliente_pj'].includes(user.user_type)
    );
    
    console.log('Clientes após filtrar admins:', customers.length);
    
    // Filtro por origem
    if (source === 'admin') {
      customers = customers.filter(customer => customer.criado_por_admin === true);
    } else if (source === 'auto') {
      customers = customers.filter(customer => customer.criado_por_admin !== true);
    }
    
    // Filtro por busca
    if (search) {
      const _searchTerm = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por status
    if (status === 'active') {
      customers = customers.filter(customer => customer.is_active !== false);
    } else if (status === 'inactive') {
      customers = customers.filter(customer => customer.is_active === false);
    }
    
    // Aplicar paginação
    const _total = customers.length;
    const _pages = Math.ceil(total / limit);
    const _paginatedCustomers = customers.slice(offset, offset + parseInt(limit));
    
    console.log('Clientes após filtros e paginação:', paginatedCustomers.length);
    
    res.json({
      success: true,
      customers: paginatedCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        user_type: customer.user_type || 'cliente_pf',
        phone: customer.phone,
        cpf_cnpj: customer.cpf_cnpj,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zip_code,
        company_name: customer.company_name,
        observacao: customer.observacao || null,
        criado_por_admin: !!customer.criado_por_admin,
        pendente_ativacao: !!customer.pendente_ativacao,
        data_ativacao: customer.data_ativacao,
        admin_name: null,
        admin_email: null,
        orders_count: customer.orders_count || 0,
        total_spent: customer.total_spent || 0,
        points: customer.points || 0,
        level: customer.level || 'Bronze',
        is_active: customer.is_active !== false,
        created_at: customer.created_at,
        customer_source: customer.criado_por_admin ? 'admin' : 'auto'
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: pages
      },
      stats: {
        total_customers: customers.length,
        admin_created: customers.filter(c => c.criado_por_admin).length,
        auto_registered: customers.filter(c => !c.criado_por_admin).length,
        active: customers.filter(c => c.is_active !== false).length,
        inactive: customers.filter(c => c.is_active === false).length
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar todos os clientes:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao buscar clientes',
      details: error.message 
    });
  }
});

// Ativar/desativar qualquer cliente (admin ou auto-cadastrado)
router.patch('/toggle-any-customer-status/:customerId', validateAdmin, async (req, res) => {
  const { customerId } = req.params;
  const { is_active } = req.body;
  
  try {
    const _database = readDB();
    
    const _customerIndex = database.users.findIndex(u => u.id === customerId);
    
    if (customerIndex === -1) {
      return res.status(404).json({ 
        error: 'Cliente não encontrado' 
      });
    }
    
    // Atualizar status
    database.users[customerIndex].is_active = is_active;
    database.users[customerIndex].updated_at = new Date().toISOString();
    
    writeDB(database);
    
    res.json({
      success: true,
      message: `Cliente ${is_active ? 'ativado' : 'desativado'} com sucesso!`
    });
    
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao alterar status' 
    });
  }
});

// Teste simples para ver se a rota está funcionando
router.get('/test', async (req, res) => {
  try {
    console.log('Teste de rota funcionando');
    res.json({ success: true, message: 'Rota funcionando!' });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({ error: 'Erro no teste' });
  }
});

// Teste simples para buscar clientes sem validação de admin
router.get('/test-customers', async (req, res) => {
  try {
    console.log('Testando busca de clientes...');
    
    const _database = readDB();
    console.log('Banco carregado, total de usuários:', database.users.length);
    
    // Filtrar apenas clientes (não admins)
    const _customers = database.users.filter(user => 
      user.user_type && user.user_type !== 'admin'
    );
    
    console.log('Clientes encontrados:', customers.length);
    
    res.json({
      success: true,
      count: customers.length,
      customers: customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        user_type: customer.user_type,
        phone: customer.phone,
        created_at: customer.created_at,
        criado_por_admin: !!customer.criado_por_admin
      }))
    });
    
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router; 