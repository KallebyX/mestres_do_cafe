import React, { createContext, useContext, useState, useEffect } from 'react';
import { _useSupabaseAuth } from './SupabaseAuthContext';
import { _supabase } from '../lib/supabase';

// =============================================
// CART UTILITIES - FUNÇÕES LOCAIS E SUPABASE
// =============================================

// ✅ Função auxiliar para validar UUIDs
const _isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const _uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const _cartUtils = {
  // Funções para localStorage (fallback quando não logado)
  updateCartCount() {
    const _cartCount = this.getCartItemsCount();
    const _cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(_badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'inline-block' : 'none';
    });
  },

  getCartItemsCount() {
    const _cart = localStorage.getItem('cart');
    if (!cart) return 0;
    
    try {
      const _cartData = JSON.parse(cart);
      return cartData.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    } catch {
      return 0;
    }
  },

  saveCart(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
    this.updateCartCount();
  },

  getCart() {
    const _cart = localStorage.getItem('cart');
    if (!cart) return { items: [], total: 0 };
    
    try {
      return JSON.parse(cart);
    } catch {
      return { items: [], total: 0 };
    }
  },

  clearCart() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  },

  // Funções para Supabase
  async syncLocalCartToSupabase(userId, localCart) {
    try {
      if (!localCart.items || localCart.items.length === 0) return;

      // Limpar carrinho existente no Supabase
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      // Adicionar itens do localStorage ao Supabase
      const _cartItems = localCart.items.map(item => ({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('cart_items')
        .insert(cartItems);

      if (!error) {
        // Limpar localStorage após sync
        this.clearCart();
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    }
  },

  // Função para localStorage - adicionar item
  addToCart(product, quantity = 1) {
    const _currentCart = this.getCart();
    const _existingItem = currentCart.items.find(item => item.id === product.id);

    let newCartData;
    if (existingItem) {
      newCartData = {
        ...currentCart,
        items: currentCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      };
    } else {
      newCartData = {
        ...currentCart,
        items: [
          ...currentCart.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            quantity: quantity,
            weight: product.weight,
            category: product.category
          }
        ]
      };
    }

    this.saveCart(newCartData);
    return newCartData;
  },

  // Função para localStorage - remover item
  removeFromCart(productId) {
    const _currentCart = this.getCart();
    const _newCartData = {
      ...currentCart,
      items: currentCart.items.filter(item => item.id !== productId)
    };

    this.saveCart(newCartData);
    return newCartData;
  },

  // Função para localStorage - atualizar quantidade
  updateQuantity(productId, newQuantity) {
    const _currentCart = this.getCart();
    const _newCartData = {
      ...currentCart,
      items: currentCart.items.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    };

    this.saveCart(newCartData);
    return newCartData;
  }
};

// =============================================
// CART CONTEXT
// =============================================

const _CartContext = createContext();

export const _useCart = () => {
  const _context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export const _CartProvider = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  // Inicialização segura: carrinho APENAS para usuários logados
  useEffect(() => {
    if (user && user.id) {
      console.log('✅ Usuário logado detectado, carregando carrinho do Supabase...');
      setRequiresLogin(false);
      loadCart();
    } else {
      console.log('🔒 Usuário não logado, carrinho requer autenticação');
      setRequiresLogin(true);
      setCartItems([]);
      setCartTotal(0);
    }
  }, [user]);

  // Calcular total do carrinho sempre que os itens mudarem
  useEffect(() => {
    const _total = cartItems.reduce((sum, item) => {
      const _price = parseFloat(item.price) || 0;
      const _quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  const _loadCart = async () => {
    // 🔒 SEGURANÇA: Carrinho APENAS para usuários autenticados
    if (!user || !user.id) {
      console.log('🔒 Acesso negado: Carrinho requer autenticação');
      setCartItems([]);
      setCartTotal(0);
      setRequiresLogin(true);
      return;
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar UUID do usuário
    if (!isValidUUID(user.id)) {
      console.error('❌ User ID inválido no loadCart:', user.id);
      setCartItems([]);
      setCartTotal(0);
      setRequiresLogin(true);
      return;
    }

    setIsLoading(true);
    setRequiresLogin(false);
    
    try {
      console.log('🛒 Carregando carrinho seguro para usuário:', user.id);
      
      // 🔒 BUSCAR APENAS itens do usuário logado (isolamento de dados)
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, created_at')
        .eq('user_id', user.id); // 🔒 FILTRO OBRIGATÓRIO por usuário

      if (cartError) {
        console.error('❌ Erro ao carregar itens do carrinho:', cartError);
        setCartItems([]);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        console.log('📭 Carrinho vazio para usuário:', user.id);
        setCartItems([]);
        return;
      }

      // Buscar detalhes dos produtos
      const _productIds = cartItems.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, images, weight, category')
        .in('id', productIds)
        .eq('is_active', true); // Apenas produtos ativos

      if (productsError) {
        console.error('❌ Erro ao carregar produtos:', productsError);
        setCartItems([]);
        return;
      }

      // Combinar dados do carrinho com produtos
      const _items = cartItems.map(_cartItem => {
        const _product = products.find(p => p.id === cartItem.product_id);
        if (!product) {
          console.warn('⚠️ Produto não encontrado ou inativo:', cartItem.product_id);
          return null;
        }
        
        return {
          id: cartItem.product_id,
          cart_item_id: cartItem.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          quantity: cartItem.quantity,
          weight: product.weight,
          category: product.category
        };
      }).filter(Boolean); // Remove produtos não encontrados

      setCartItems(items);
      console.log('✅ Carrinho carregado com segurança:', items.length, 'itens para usuário', user.id);

    } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const _addToCart = async (product, quantity = 1) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      console.log('🔒 Acesso negado: Login necessário para adicionar ao carrinho');
      setRequiresLogin(true);
      return { success: false, message: 'Login necessário para adicionar produtos ao carrinho' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos UUIDs válidos
    if (!product || !product.id) {
      console.error('❌ Produto inválido ou sem ID:', product);
      return { success: false, message: 'Produto inválido' };
    }

    // ✅ Verificar formato UUID
    if (!isValidUUID(user.id)) {
      console.error('❌ User ID inválido:', user.id);
      return { success: false, message: 'ID de usuário inválido' };
    }

    if (!isValidUUID(product.id)) {
      console.error('❌ Product ID inválido:', product.id);
      return { success: false, message: 'ID de produto inválido' };
    }

    try {
      console.log('🛒 Adicionando ao carrinho (usuário:', user.id, '- produto:', product.name, '- ID:', product.id, ')');
      
      // Verificar se o item já existe no carrinho DO USUÁRIO
      // Nota: PGRST116 é ESPERADO quando o item não existe - não é um erro real
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id) // 🔒 Filtro por usuário
        .eq('product_id', product.id)
        .single();

      // ✅ PGRST116 é esperado quando item não existe no carrinho
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro inesperado ao verificar item no carrinho:', checkError);
        return { success: false, message: 'Erro ao verificar carrinho' };
      }

      // 💡 Informação para desenvolvedores sobre PGRST116
      if (checkError && checkError.code === 'PGRST116') {
        console.log('ℹ️ PGRST116 detectado: Item não existe no carrinho (comportamento normal na primeira adição)');
      }

      // Se chegou até aqui, ou temos um item existente ou o erro foi PGRST116 (normal)
      if (existingItem && !checkError) {
        // Item já existe, atualizar quantidade
        console.log('📝 Item já existe no carrinho, atualizando quantidade...');
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .eq('user_id', user.id); // 🔒 Verificação dupla de segurança

        if (updateError) {
          console.error('❌ Erro ao atualizar quantidade:', updateError);
          return { success: false, message: 'Erro ao atualizar quantidade' };
        }
        
        console.log('✅ Quantidade atualizada com sucesso');
      } else {
        // Item não existe, criar novo (checkError.code === 'PGRST116' ou não há erro)
        console.log('➕ Item novo no carrinho, criando...');
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id, // 🔒 Associar ao usuário logado
            product_id: product.id,
            quantity: quantity
          });

        if (insertError) {
          console.error('❌ Erro ao adicionar item ao carrinho:', insertError);
          return { success: false, message: 'Erro ao adicionar produto' };
        }
        
        console.log('✅ Item adicionado com sucesso');
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true, message: 'Produto adicionado ao carrinho!' };
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const _removeFromCart = async (productId) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      console.log('🔒 Acesso negado: Login necessário para remover do carrinho');
      return { success: false, message: 'Login necessário' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos UUIDs válidos
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    if (!isValidUUID(user.id)) {
      console.error('❌ User ID inválido:', user.id);
      return { success: false, message: 'ID de usuário inválido' };
    }

    if (!isValidUUID(productId)) {
      console.error('❌ Product ID inválido:', productId);
      return { success: false, message: 'ID de produto inválido' };
    }

    try {
      console.log('🗑️ Removendo do carrinho (usuário:', user.id, '- produto:', productId, ')');
      
      // Remover APENAS do carrinho do usuário logado
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id) // 🔒 Filtro por usuário
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Erro ao remover item do carrinho:', error);
        return { success: false, message: 'Erro ao remover produto' };
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true, message: 'Produto removido do carrinho!' };
      
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const _updateQuantity = async (productId, newQuantity) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      console.log('🔒 Acesso negado: Login necessário para atualizar carrinho');
      return { success: false, message: 'Login necessário' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos UUIDs válidos
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    if (!isValidUUID(user.id)) {
      console.error('❌ User ID inválido:', user.id);
      return { success: false, message: 'ID de usuário inválido' };
    }

    if (!isValidUUID(productId)) {
      console.error('❌ Product ID inválido:', productId);
      return { success: false, message: 'ID de produto inválido' };
    }

    try {
      if (newQuantity <= 0) {
        return await removeFromCart(productId);
      }

      console.log('📝 Atualizando quantidade (usuário:', user.id, '- produto:', productId, '- qtd:', newQuantity, ')');
      
      // Atualizar APENAS no carrinho do usuário logado
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id) // 🔒 Filtro por usuário
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Erro ao atualizar quantidade:', error);
        return { success: false, message: 'Erro ao atualizar quantidade' };
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const _clearCart = async () => {
    // 🔒 SEGURANÇA: Apenas usuários autenticados podem limpar carrinho
    if (!user || !user.id) {
      console.log('🔒 Acesso negado: Login necessário para limpar carrinho');
      return { success: false, message: 'Login necessário' };
    }

    try {
      console.log('🧹 Limpando carrinho (usuário:', user.id, ')');
      
      // Limpar APENAS o carrinho do usuário logado
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id); // 🔒 Filtro por usuário

      if (error) {
        console.error('❌ Erro ao limpar carrinho:', error);
        return { success: false, message: 'Erro ao limpar carrinho' };
      }
      
      setCartItems([]);
      setCartTotal(0);
      return { success: true, message: 'Carrinho limpo!' };
      
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const _getCartItemsCount = () => {
    if (!user || !user.id) return 0; // 🔒 Sem usuário = sem carrinho
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const _getCartItemsCountSafe = () => {
    // 🔒 Versão segura que sempre retorna 0 se não logado
    if (!user || !user.id) return 0;
    
    try {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Erro em getCartItemsCountSafe:', error);
      return 0;
    }
  };

  const _getTotalPrice = () => {
    if (!user || !user.id) return 0; // 🔒 Sem usuário = sem total
    return cartTotal;
  };

  const _value = {
    cartItems,
    cartTotal,
    isLoading,
    requiresLogin, // 🔒 Nova propriedade para indicar se login é necessário
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemsCount,
    getCartItemsCountSafe,
    getTotalPrice,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

