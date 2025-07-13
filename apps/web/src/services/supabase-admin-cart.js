import { supabase } from "../lib/api.js"

// 🔐 FUNÇÕES ADMINISTRATIVAS DO CARRINHO
// Apenas usuários com role 'admin' ou 'super_admin' podem usar estas funções

/**
 * Verificar se usuário é administrador
 * @param {Object} user - Usuário logado
 * @returns {boolean} - True se for admin
 */
const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'super_admin');
};

/**
 * 🔒 ADMIN: Buscar todos os carrinhos do sistema
 * @param {Object} user - Usuário administrador
 * @returns {Object} - Lista de carrinhos com dados dos usuários
 */
export const getAllCarts = async (user) => {
  try {
    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Apenas admins
    if (!isAdmin(user)) {
      console.error('🔒 Acesso negado: Apenas administradores podem ver todos os carrinhos');
      return { success: false, error: 'Acesso negado', data: [] };
    }

    // Buscar todos os carrinhos com dados dos usuários e produtos
    const { data: carts, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        users (
          id,
          name,
          email,
          user_type
        ),
        products (
          id,
          name,
          price,
          images,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar carrinhos:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Agrupar carrinhos por usuário
    const cartsByUser = {};
    
    carts.forEach(item => {
      const userId = item.user_id;
      
      if (!cartsByUser[userId]) {
        cartsByUser[userId] = {
          user: item.users,
          items: [],
          total: 0,
          itemsCount: 0,
          lastUpdate: item.updated_at
        };
      }
      
      const cartItem = {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products,
        subtotal: item.products.price * item.quantity
      };
      
      cartsByUser[userId].items.push(cartItem);
      cartsByUser[userId].total += cartItem.subtotal;
      cartsByUser[userId].itemsCount += item.quantity;
      
      // Manter a data mais recente
      if (new Date(item.updated_at) > new Date(cartsByUser[userId].lastUpdate)) {
        cartsByUser[userId].lastUpdate = item.updated_at;
      }
    });

    const result = Object.values(cartsByUser);
    
    return { success: true, data: result };

  } catch (error) {
    console.error('❌ Erro ao buscar carrinhos (admin):', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * 🔒 ADMIN: Buscar carrinho específico de um usuário
 * @param {Object} adminUser - Usuário administrador
 * @param {string} targetUserId - ID do usuário alvo
 * @returns {Object} - Carrinho do usuário específico
 */
export const getUserCart = async (adminUser, targetUserId) => {
  try {
    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Apenas admins
    if (!isAdmin(adminUser)) {
      console.error('🔒 Acesso negado: Apenas administradores podem ver carrinhos de outros usuários');
      return { success: false, error: 'Acesso negado', data: null };
    }

    // Buscar carrinho específico do usuário
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          price,
          images,
          weight,
          category,
          is_active
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar carrinho do usuário:', error);
      return { success: false, error: error.message, data: null };
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email, user_type')
      .eq('id', targetUserId)
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError);
      return { success: false, error: userError.message, data: null };
    }

    // Calcular totais
    const items = cartItems.map(item => ({
      ...item,
      subtotal: item.products.price * item.quantity
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const result = {
      user: userData,
      items,
      total,
      itemsCount,
      lastUpdate: items.length > 0 ? items[0].updated_at : null
    };

    console.log(`✅ Admin carregou carrinho com ${itemsCount} itens (R$ ${total.toFixed(2)})`);
    return { success: true, data: result };

  } catch (error) {
    console.error('❌ Erro ao buscar carrinho do usuário (admin):', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * 🔒 ADMIN: Limpar carrinho de um usuário específico
 * @param {Object} adminUser - Usuário administrador
 * @param {string} targetUserId - ID do usuário alvo
 * @returns {Object} - Resultado da operação
 */
export const clearUserCart = async (adminUser, targetUserId) => {
  try {
    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Apenas admins
    if (!isAdmin(adminUser)) {
      console.error('🔒 Acesso negado: Apenas administradores podem limpar carrinhos');
      return { success: false, error: 'Acesso negado' };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', targetUserId);

    if (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Carrinho limpo com sucesso' };

  } catch (error) {
    console.error('❌ Erro ao limpar carrinho (admin):', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🔒 ADMIN: Estatísticas gerais dos carrinhos
 * @param {Object} adminUser - Usuário administrador
 * @returns {Object} - Estatísticas dos carrinhos
 */
export const getCartStatistics = async (adminUser) => {
  try {
    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Apenas admins
    if (!isAdmin(adminUser)) {
      console.error('🔒 Acesso negado: Apenas administradores podem ver estatísticas');
      return { success: false, error: 'Acesso negado', data: null };
    }

    // Contar carrinhos ativos
    const { data: activeCartsData, error: activeError } = await supabase
      .from('cart_items')
      .select('user_id', { count: 'exact' });

    if (activeError) {
      throw activeError;
    }

    // Contar usuários únicos com carrinho
    const uniqueUsers = new Set(activeCartsData.map(item => item.user_id)).size;

    // Calcular valor total em carrinhos
    const { data: cartsWithProducts, error: totalError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products (price)
      `);

    if (totalError) {
      throw totalError;
    }

    const totalValue = cartsWithProducts.reduce((sum, item) => {
      return sum + (item.quantity * item.products.price);
    }, 0);

    const stats = {
      totalCartItems: activeCartsData.length,
      usersWithCarts: uniqueUsers,
      totalCartValue: totalValue,
      averageCartValue: uniqueUsers > 0 ? totalValue / uniqueUsers : 0
    };

    return { success: true, data: stats };

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas (admin):', error);
    return { success: false, error: error.message, data: null };
  }
};

export default {
  getAllCarts,
  getUserCart,
  clearUserCart,
  getCartStatistics
}; 