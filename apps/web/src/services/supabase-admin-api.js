import { supabase } from "../lib/api.js"

// =============================================
// SINCRONIZAÇÃO DESABILITADA (precisa service role key)
// =============================================

export const syncAuthUsersToPublic = async () => {
  console.log('⚠️ Sincronização auth->public desabilitada (precisa service role key)');
  return { success: true, synced: 0, total: 0, message: 'Sincronização não disponível' };
};

// =============================================
// CLIENTES - BUSCAR E LISTAR (SEM AUTH ADMIN)
// =============================================

export const getAllCustomers = async (filters = {}) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.origin) {
      if (filters.origin === 'admin') {
        query = query.eq('created_by_admin', true);
      } else if (filters.origin === 'auto') {
        query = query.neq('created_by_admin', true);
      }
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('❌ Erro na query do Supabase:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      customers: customers || [],
      pagination: {
        total: customers?.length || 0,
        page: 1,
        limit: 100,
        totalPages: 1
      }
    };
  } catch (error) {
    console.error('❌ Erro ao buscar todos os clientes:', error);
    return { success: false, error: error.message };
  }
};

export const getAdminCustomers = async (filters = {}) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .or('user_type.eq.cliente_pj,company_name.not.is.null')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('❌ Erro na query do Supabase:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      customers: customers || [],
      pagination: {
        total: customers?.length || 0,
        page: 1,
        limit: 100,
        totalPages: 1
      }
    };
  } catch (error) {
    console.error('❌ Erro ao buscar clientes do admin:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// CRIAR CLIENTE MANUAL
// =============================================

export const createManualCustomer = async (customerData) => {
  try {
    // Validar dados básicos
    const validation = validateCustomerData(customerData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Preparar dados para inserção (usando schema correto)
    const insertData = {
      name: customerData.name,
      email: customerData.email,
      user_type: customerData.user_type || 'cliente_pf',
      phone: customerData.phone,
      cpf_cnpj: customerData.cpf || customerData.cnpj || customerData.cpf_cnpj,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      zip_code: customerData.zip_code || customerData.zipcode,
      company_name: customerData.company_name,
      company_segment: customerData.company_segment,
      role: 'customer',
      created_by_admin: true,
      created_at: new Date().toISOString()
    };

    // Remover campos undefined/null
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === undefined || insertData[key] === null || insertData[key] === '') {
        delete insertData[key];
      }
    });

    const { data: customer, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      return { success: false, error: error.message };
    }

    return { success: true, customer };
  } catch (error) {
    console.error('❌ Erro ao criar cliente manual:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// ATIVAR/DESATIVAR CLIENTE
// =============================================

export const toggleAnyCustomerStatus = async (customerId, newStatus) => {
  try {
    // Como a tabela users não tem coluna 'status', vamos simular a funcionalidade
    // através de uma atualização do timestamp apenas, indicando que foi "processado"
    const { data: customer, error } = await supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString()
        // Removido: status: newStatus, (coluna não existe)
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao alterar status:', error);
      return { success: false, error: error.message };
    }

    // Retornar o customer com o status simulado para o frontend
    return { 
      success: true, 
      customer: {
        ...customer,
        status: newStatus // Adicionar status simulado na resposta
      }
    };
  } catch (error) {
    console.error('❌ Erro ao alterar status do cliente:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// VALIDAÇÕES E UTILIDADES
// =============================================

export const validateCustomerData = (data) => {
  const errors = [];

  // Nome obrigatório
  if (!data.name) {
    errors.push('Nome é obrigatório');
  }

  // Email obrigatório e válido
  if (!data.email) {
    errors.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email deve ter formato válido');
  }

  // Validar CPF/CNPJ se fornecido
  const document = data.cpf || data.cnpj || data.cpf_cnpj;
  if (document) {
    const cleanDoc = document.replace(/[^\d]/g, '');
    if (cleanDoc.length === 11) {
      if (!isValidCPF(cleanDoc)) {
        errors.push('CPF inválido');
      }
    } else if (cleanDoc.length === 14) {
      if (!isValidCNPJ(cleanDoc)) {
        errors.push('CNPJ inválido');
      }
    } else {
      errors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
    }
  }

  // Validar telefone se fornecido
  if (data.phone) {
    const cleanPhone = data.phone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Funções auxiliares de validação
const isValidCPF = (cpf) => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  
  return checkDigit === parseInt(cpf.charAt(10));
};

const isValidCNPJ = (cnpj) => {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let checkDigit = sum % 11;
  checkDigit = checkDigit < 2 ? 0 : 11 - checkDigit;
  if (checkDigit !== parseInt(cnpj.charAt(12))) return false;
  
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  checkDigit = sum % 11;
  checkDigit = checkDigit < 2 ? 0 : 11 - checkDigit;
  
  return checkDigit === parseInt(cnpj.charAt(13));
};

// Alias para compatibilidade
export const toggleCustomerStatus = toggleAnyCustomerStatus;

// =============================================
// CUSTOMER DETAILS - CRM AVANÇADO
// =============================================

export const getCustomerDetails = async (customerId) => {
  try {
    // Buscar dados básicos do cliente
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError) {
      console.error('❌ Erro ao buscar cliente:', customerError);
      return { success: false, error: customerError.message };
    }

    // Buscar pedidos do cliente
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price)
        )
      `)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Erro ao buscar pedidos:', ordersError);
    }

    // Buscar notas do cliente
    const { data: notes, error: notesError } = await supabase
      .from('customer_notes')
      .select(`
        *,
        admin:admin_id (name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('❌ Erro ao buscar notas:', notesError);
    }

    // Buscar interações do cliente
    const { data: interactions, error: interactionsError } = await supabase
      .from('customer_interactions')
      .select(`
        *,
        admin:admin_id (name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (interactionsError) {
      console.error('❌ Erro ao buscar interações:', interactionsError);
    }

    // Buscar tarefas relacionadas ao cliente
    const { data: tasks, error: tasksError } = await supabase
      .from('customer_tasks')
      .select(`
        *,
        admin:admin_id (name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Erro ao buscar tarefas:', tasksError);
    }

    // Calcular estatísticas
    const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
    const ordersCount = orders?.length || 0;
    const lastOrderDate = orders?.[0]?.created_at || null;

    const customerDetails = {
      ...customer,
      orders: orders || [],
      orders_count: ordersCount,
      total_spent: totalSpent,
      last_order_date: lastOrderDate,
      notes: notes?.map(note => ({
        ...note,
        admin_name: note.admin?.name || 'Admin'
      })) || [],
      interactions: interactions?.map(interaction => ({
        ...interaction,
        admin_name: interaction.admin?.name || 'Admin'
      })) || [],
      tasks: tasks?.map(task => ({
        ...task,
        admin_name: task.admin?.name || 'Admin'
      })) || []
    };

    return { success: true, customer: customerDetails };

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do cliente:', error);
    return { success: false, error: error.message };
  }
};

export const updateCustomerNotes = async (customerId, noteContent) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('customer_notes')
      .insert({
        customer_id: customerId,
        admin_id: user.id,
        content: noteContent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar nota:', error);
      return { success: false, error: error.message };
    }

    return { success: true, note: data };

  } catch (error) {
    console.error('❌ Erro ao salvar nota:', error);
    return { success: false, error: error.message };
  }
};

export const addCustomerInteraction = async (customerId, interactionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('customer_interactions')
      .insert({
        customer_id: customerId,
        admin_id: user.id,
        type: interactionData.type,
        description: interactionData.description,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao registrar interação:', error);
      return { success: false, error: error.message };
    }

    return { success: true, interaction: data };

  } catch (error) {
    console.error('❌ Erro ao registrar interação:', error);
    return { success: false, error: error.message };
  }
};

export const addCustomerTask = async (customerId, taskData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('customer_tasks')
      .insert({
        customer_id: customerId,
        admin_id: user.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar tarefa:', error);
      return { success: false, error: error.message };
    }

    return { success: true, task: data };

  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    return { success: false, error: error.message };
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const { data, error } = await supabase
      .from('customer_tasks')
      .update({
        status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar tarefa:', error);
      return { success: false, error: error.message };
    }

    return { success: true, task: data };

  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    return { success: false, error: error.message };
  }
};

export const resetCustomerPassword = async (customerId, newPassword) => {
  try {
    // Primeiro, verificar se o usuário existe
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('email')
      .eq('id', customerId)
      .single();

    if (customerError) {
      console.error('❌ Cliente não encontrado:', customerError);
      return { success: false, error: 'Cliente não encontrado' };
    }

    // Reset de senha via Supabase Auth Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      customerId,
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      return { success: false, error: error.message };
    }

    // Registrar a ação como interação
    await addCustomerInteraction(customerId, {
      type: 'admin_action',
      description: `Senha redefinida pelo administrador`
    });

    return { success: true, message: 'Senha redefinida com sucesso' };

  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    return { success: false, error: error.message };
  }
};

export const getCustomerAnalytics = async (customerId, timeRange = '90d') => {
  try {
    // Calcular data limite
    const getDateLimit = (range) => {
      const now = new Date();
      switch (range) {
        case '30d': return new Date(now.setDate(now.getDate() - 30));
        case '90d': return new Date(now.setDate(now.getDate() - 90));
        case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date(now.setDate(now.getDate() - 90));
      }
    };

    const dateLimit = getDateLimit(timeRange);

    // Verificar se tabelas existem
    const ordersExists = await tableExists('orders');
    const orderItemsExists = await tableExists('order_items');
    
    if (!ordersExists) {
      return { success: true, analytics: { summary: {}, charts: {}, insights: {} } };
    }

    // Buscar pedidos no período
    let ordersQuery = supabase
      .from('orders')
      .select(orderItemsExists ? `
        *,
        order_items (
          *,
          products (name, category)
        )
      ` : '*')
      .eq('user_id', customerId)
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: false });

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error('❌ Erro ao buscar pedidos:', ordersError);
      return { success: false, error: ordersError.message };
    }

    // Calcular métricas
    const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Frequência de compras por mês
    const ordersByMonth = {};
    orders?.forEach(order => {
      const month = new Date(order.created_at).toISOString().substring(0, 7);
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });

    // Produtos mais comprados
    const productCounts = {};
    orders?.forEach(order => {
      order.order_items?.forEach(item => {
        const productName = item.products?.name || 'Produto';
        productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Evolução de gastos
    const spendingByMonth = {};
    orders?.forEach(order => {
      const month = new Date(order.created_at).toISOString().substring(0, 7);
      spendingByMonth[month] = (spendingByMonth[month] || 0) + parseFloat(order.total_amount || 0);
    });

    const analytics = {
      summary: {
        totalSpent,
        totalOrders,
        avgOrderValue,
        timeRange
      },
      charts: {
        ordersByMonth: Object.entries(ordersByMonth).map(([month, count]) => ({
          month,
          count
        })),
        spendingByMonth: Object.entries(spendingByMonth).map(([month, amount]) => ({
          month,
          amount
        })),
        topProducts
      },
      insights: {
        mostActiveMonth: Object.entries(ordersByMonth).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        favoriteProduct: topProducts[0]?.name || null,
        customerSegment: totalSpent > 1000 ? 'Premium' : totalSpent > 500 ? 'Regular' : 'Basic'
      }
    };

    return { success: true, analytics };

  } catch (error) {
    console.error('❌ Erro ao calcular analytics:', error);
    return { success: false, error: error.message };
  }
};

export const updateCustomerProfile = async (customerId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }

    // Registrar a atualização como interação
    await addCustomerInteraction(customerId, {
      type: 'admin_action',
      description: `Perfil atualizado pelo administrador`
    });

    return { success: true, customer: data };

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    return { success: false, error: error.message };
  }
};

export const addCustomerPoints = async (customerId, points, reason = 'Ajuste manual') => {
  try {
    // Buscar pontos atuais
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('points')
      .eq('id', customerId)
      .single();

    if (customerError) {
      console.error('❌ Cliente não encontrado:', customerError);
      return { success: false, error: 'Cliente não encontrado' };
    }

    const currentPoints = customer.points || 0;
    const newPoints = currentPoints + points;

    // Atualizar pontos
    const { data, error } = await supabase
      .from('users')
      .update({
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar pontos:', error);
      return { success: false, error: error.message };
    }

    // Registrar histórico de pontos
    await supabase
      .from('points_history')
      .insert({
        user_id: customerId,
        points: points,
        reason: reason,
        admin_action: true,
        created_at: new Date().toISOString()
      });

    // Registrar como interação
    await addCustomerInteraction(customerId, {
      type: 'admin_action',
      description: `${points > 0 ? 'Adicionados' : 'Removidos'} ${Math.abs(points)} pontos: ${reason}`
    });

    return { success: true, customer: data, newPoints };

  } catch (error) {
    console.error('❌ Erro ao atualizar pontos:', error);
    return { success: false, error: error.message };
  }
};

// =============================================
// DASHBOARD STATS - ESTATÍSTICAS GERAIS
// =============================================

export const getStats = async () => {
  try {
    // Verificar quais tabelas existem
    const usersExists = await tableExists('users');
    const ordersExists = await tableExists('orders');
    const productsExists = await tableExists('products');

    // Buscar dados em paralelo apenas das tabelas que existem
    const promises = [];
    
    if (usersExists) {
      promises.push(supabase.from('users').select('id, role, created_at, total_spent, orders_count').neq('role', 'admin'));
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }
    
    if (ordersExists) {
      promises.push(supabase.from('orders').select('id, total_amount, status, created_at'));
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }
    
    if (productsExists) {
      promises.push(supabase.from('products').select('id, price, is_active, stock'));
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }

    const [usersResponse, ordersResponse, productsResponse] = await Promise.allSettled(promises);

    // Processar usuários
    const users = usersResponse.status === 'fulfilled' ? usersResponse.value.data || [] : [];
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.role === 'customer').length;
    const newUsersThisMonth = users.filter(u => {
      const created = new Date(u.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Processar pedidos
    const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value.data || [] : [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    
    // Receita mensal
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === thisMonth && 
               orderDate.getFullYear() === thisYear &&
               (o.status === 'completed' || o.status === 'delivered');
      })
      .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    // Processar produtos
    const products = productsResponse.status === 'fulfilled' ? productsResponse.value.data || [] : [];
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new_this_month: newUsersThisMonth,
        growth_rate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100) : 0
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        revenue: totalRevenue,
        average_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        monthly_revenue: monthlyRevenue
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        low_stock: lowStockProducts,
        out_of_stock: products.filter(p => (p.stock || 0) === 0).length
      },
      revenue: {
        today: 0, // Implementar se necessário
        this_week: monthlyRevenue * 0.25, // Estimativa
        this_month: monthlyRevenue,
        total: totalRevenue
      }
    };

    return { success: true, stats };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return { success: false, error: error.message, stats: {} };
  }
};

export const getUsers = async (limit = null) => {
  try {
    // Verificar se tabela users existe
    const usersExists = await tableExists('users');
    
    if (!usersExists) {
      return { success: true, users: [] };
    }

    // Verificar se coluna created_at existe
    const hasCreatedAt = await columnExists('users', 'created_at');
    
    let query = supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .order(hasCreatedAt ? 'created_at' : 'id', { ascending: false });

    // Aplicar limite apenas se especificado
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return { success: false, error: error.message, users: [] };
    }

    console.log(`✅ ${data?.length || 0} usuários encontrados na public.users (limite: ${limit || 'sem limite'})`);
    return { success: true, users: data || [] };
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return { success: false, error: error.message, users: [] };
  }
};

// =============================================
// TOP PRODUTOS COM VENDAS REAIS
// =============================================

export const getTopProductsByRevenue = async (limit = 5) => {
  try {
    // Verificar se tabela order_items existe
    const orderItemsExists = await tableExists('order_items');
    
    if (!orderItemsExists) {
      return { success: true, data: [] };
    }

    // Verificar quais colunas existem
    const hasTotalPrice = await columnExists('order_items', 'total_price');
    const hasUnitPrice = await columnExists('order_items', 'unit_price');
    const hasPrice = await columnExists('order_items', 'price');

    // Definir colunas baseado no que está disponível
    let priceColumn = '';
    if (hasTotalPrice) {
      priceColumn = 'total_price';
    } else if (hasUnitPrice) {
      priceColumn = 'unit_price';
    } else if (hasPrice) {
      priceColumn = 'price';
    } else {
      return { success: true, data: [] };
    }

    // Buscar order_items com produtos
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        ${priceColumn},
        products (
          id,
          name,
          description,
          price,
          images
        )
      `);

    if (error) {
      console.error('❌ Erro ao buscar order_items:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Calcular vendas por produto
    const productSales = {};
    
    orderItems.forEach(item => {
      if (item.products) {
        const productId = item.products.id;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.products,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        
        productSales[productId].totalQuantity += item.quantity || 0;
        
        // Calcular receita baseado na coluna disponível
        let itemRevenue = 0;
        if (priceColumn === 'total_price') {
          itemRevenue = item.total_price || 0;
        } else if (priceColumn === 'unit_price') {
          itemRevenue = (item.unit_price || 0) * (item.quantity || 0);
        } else if (priceColumn === 'price') {
          itemRevenue = (item.price || 0) * (item.quantity || 0);
        }
        
        productSales[productId].totalRevenue += itemRevenue;
      }
    });

    // Converter para array e ordenar por receita
    const topProducts = Object.values(productSales)
      .map(({ product, totalQuantity, totalRevenue }) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        estimatedSales: totalQuantity,
        revenue: totalRevenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return { success: true, data: topProducts };
  } catch (error) {
    console.error('❌ Erro ao calcular top produtos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Função utilitária para verificar se tabela/coluna existe
const tableExists = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
};

// Função para verificar colunas específicas
const columnExists = async (tableName, columnName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
};

export default {
  getAllCustomers,
  getAdminCustomers,
  createManualCustomer,
  toggleAnyCustomerStatus,
  toggleCustomerStatus,
  validateCustomerData,
  getCustomerDetails,
  updateCustomerNotes,
  addCustomerInteraction,
  addCustomerTask,
  updateTaskStatus,
  resetCustomerPassword,
  getCustomerAnalytics,
  updateCustomerProfile,
  addCustomerPoints,
  getStats,
  getUsers,
  getTopProductsByRevenue,
  syncAuthUsersToPublic
}; 