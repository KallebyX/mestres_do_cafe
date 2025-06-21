import { supabase } from './supabase';

// Criar novo pedido
export const createOrder = async (orderData) => {
  try {
    const { user, items, subtotal, shippingCost, discountAmount, total, shippingAddress, paymentMethod, notes } = orderData;

    // Criar o pedido principal
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        status: 'pending',
        total_amount: total,
        subtotal: subtotal,
        shipping_cost: shippingCost || 0,
        discount_amount: discountAmount || 0,
        payment_method: paymentMethod,
        payment_status: 'pending',
        shipping_address: shippingAddress,
        notes: notes || ''
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return { success: false, error: orderError.message };
    }

    // Criar os itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_snapshot: {
        name: item.name,
        description: item.description,
        image: item.images?.[0] || '',
        weight: item.weight || '500g'
      }
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      // Rollback: deletar o pedido criado
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: itemsError.message };
    }

    // Atualizar estoque dos produtos
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('update_product_stock', {
        product_id: item.id,
        quantity_sold: item.quantity
      });

      if (stockError) {
        console.error('Erro ao atualizar estoque:', stockError);
      }
    }

    return { success: true, data: order, message: 'Pedido criado com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, error: error.message };
  }
};

// Buscar pedidos do usuário
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_snapshot
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Buscar pedido por ID
export const getOrderById = async (orderId, userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ADMIN: Buscar todos os pedidos
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          name,
          email
        ),
        order_items (
          *,
          product_snapshot
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos os pedidos:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ADMIN: Atualizar status do pedido
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const updates = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Se o status for entregue, adicionar data de entrega
    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Status do pedido atualizado!' };
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return { success: false, error: error.message };
  }
};

// ADMIN: Atualizar código de rastreamento
export const updateOrderTracking = async (orderId, trackingCode) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        tracking_code: trackingCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar código de rastreamento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data, message: 'Código de rastreamento atualizado!' };
  } catch (error) {
    console.error('Erro ao atualizar código de rastreamento:', error);
    return { success: false, error: error.message };
  }
};

// Cancelar pedido
export const cancelOrder = async (orderId, userId) => {
  try {
    // Verificar se o pedido pode ser cancelado
    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('status, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      return { success: false, error: 'Pedido não encontrado' };
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return { success: false, error: 'Este pedido não pode ser cancelado' };
    }

    // Cancelar o pedido
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cancelar pedido:', error);
      return { success: false, error: error.message };
    }

    // Restaurar estoque dos produtos
    for (const item of order.order_items) {
      const { error: stockError } = await supabase.rpc('restore_product_stock', {
        product_id: item.product_id,
        quantity_to_restore: item.quantity
      });

      if (stockError) {
        console.error('Erro ao restaurar estoque:', stockError);
      }
    }

    return { success: true, data, message: 'Pedido cancelado com sucesso!' };
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return { success: false, error: error.message };
  }
};

// Buscar estatísticas de pedidos para admin
export const getOrderStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message, data: null };
    }

    const stats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      confirmed: data.filter(o => o.status === 'confirmed').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      totalRevenue: data
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
      monthlyRevenue: data
        .filter(o => {
          const orderDate = new Date(o.created_at);
          const currentMonth = new Date().getMonth();
          return orderDate.getMonth() === currentMonth && o.status === 'delivered';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Buscar pedidos por status
export const getOrdersByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          name,
          email
        ),
        order_items (
          *,
          product_snapshot
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos por status:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar pedidos por status:', error);
    return { success: false, error: error.message, data: [] };
  }
}; 