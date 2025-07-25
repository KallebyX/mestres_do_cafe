import { createContext, useContext, useEffect, useState } from 'react';
import { cartAPI } from "../services/api.js";
import analytics from '../services/analytics';
import { useAuth } from './AuthContext';

// =============================================
// CART UTILITIES - FUNÇÕES LOCAIS E SUPABASE
// =============================================

// ✅ Função auxiliar para validar UUIDs
const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const cartUtils = {
  // Funções para localStorage (fallback quando não logado)
  updateCartCount() {
    const cartCount = this.getCartItemsCount();
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'inline-block' : 'none';
    });
  },

  getCartItemsCount() {
    const cart = localStorage.getItem('cart');
    if (!cart) return 0;
    
    try {
      const cartData = JSON.parse(cart);
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
    const cart = localStorage.getItem('cart');
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

  // Funções para API Flask
  async syncLocalCartToAPI(userId, localCart) {
    try {
      if (!localCart.items || localCart.items.length === 0) return;

      // Limpar carrinho existente na API
      await cartAPI.clearCart();

      // Adicionar itens do localStorage à API
      for (const item of localCart.items) {
        await cartAPI.addToCart(item.id, item.quantity);
      }

      // Limpar localStorage após sync
      this.clearCart();
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    }
  },

  // Função para localStorage - adicionar item
  addToCart(product, quantity = 1) {
    const currentCart = this.getCart();
    const existingItem = currentCart.items.find(item => item.id === product.id);

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
    const currentCart = this.getCart();
    const newCartData = {
      ...currentCart,
      items: currentCart.items.filter(item => item.id !== productId)
    };

    this.saveCart(newCartData);
    return newCartData;
  },

  // Função para localStorage - atualizar quantidade
  updateQuantity(productId, newQuantity) {
    const currentCart = this.getCart();
    const newCartData = {
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

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  // 🔄 Inicialização híbrida: API para logados, localStorage para guests
  useEffect(() => {
    let isMounted = true;
    
    if (user && user.id && isMounted) {
      // 🔒 Usuário autenticado - usar API
      console.log('🔍 CART CONTEXT - User authenticated, loading from API');
      setRequiresLogin(false);
      loadCart();
    } else if (isMounted) {
      // 🛒 Usuário não logado - usar localStorage
      console.log('🔍 CART CONTEXT - Guest user, loading from localStorage');
      setRequiresLogin(false); // ✅ MUDANÇA: permitir carrinho para guests
      loadGuestCart();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Calcular total do carrinho sempre que os itens mudarem
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      const total = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
      setCartTotal(total);
    }
    
    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  // 🛒 Função para carregar carrinho de usuários não logados (localStorage)
  const loadGuestCart = async () => {
    console.log('🔍 CART CONTEXT - loadGuestCart called');
    setIsLoading(true);
    
    try {
      const guestCart = cartUtils.getCart();
      console.log('🔍 CART CONTEXT - Guest cart from localStorage:', guestCart);
      
      if (guestCart.items && guestCart.items.length > 0) {
        setCartItems(guestCart.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar carrinho guest:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = async () => {
    // 🔍 DIAGNÓSTICO CARRINHO - Log de acesso loadCart
    console.log('🔍 CART CONTEXT - loadCart called');
    console.log('🔍 CART CONTEXT - User state:', !!user, user?.id);
    console.log('🔍 CART CONTEXT - User object:', user);
    
    // ✅ NOVO: Usuário não logado usa localStorage
    if (!user || !user.id) {
      console.log('🔍 CART CONTEXT - User not authenticated, loading guest cart');
      await loadGuestCart();
      return;
    }

    setIsLoading(true);
    setRequiresLogin(false);
    
// 🔄 SINCRONIZAÇÃO: Verificar se há itens no localStorage para sync
    const guestCart = cartUtils.getCart();
    if (guestCart.items && guestCart.items.length > 0) {
      console.log('🔄 CART SYNC - Found guest cart items, syncing to API:', guestCart.items.length, 'items');
      await cartUtils.syncLocalCartToAPI(user.id, guestCart);
    }
    try {
      // 🔍 DIAGNÓSTICO CARRINHO - Log de chamada API
      console.log('🔍 CART CONTEXT - Attempting API call to cartAPI.getCart()');
      
      // 🔒 BUSCAR carrinho do usuário logado via API Flask
      const response = await cartAPI.getCart();
      
      console.log('🔍 CART CONTEXT - API response:', response);
      
      if (!response.success) {
        console.error('❌ Erro ao carregar carrinho:', response.error || response.message);
        console.log('🔍 CART CONTEXT - API call failed, clearing cart items');
        setCartItems([]);
        return;
      }

      // 🔧 Novo formato unified de resposta
      const cartData = response.data || {};
      const cartItems = cartData.data?.items || [];
      
      console.log('🔍 CART CONTEXT - cartData:', cartData);
      console.log('🔍 CART CONTEXT - cartData JSON:', JSON.stringify(cartData, null, 2));
      console.log('🔍 CART CONTEXT - cartItems array:', cartItems);
      console.log('🔍 CART CONTEXT - cartItems JSON:', JSON.stringify(cartItems, null, 2));
      console.log('🔍 CART CONTEXT - cartItems length:', cartItems.length);
      console.log('🔍 CART CONTEXT - cartItems type:', typeof cartItems);
      console.log('🔍 CART CONTEXT - cartItems is Array:', Array.isArray(cartItems));
      
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        console.log('🔍 CART CONTEXT - No valid items found, setting empty array');
        setCartItems([]);
        return;
      }

      // 🔧 Mapear itens para estrutura esperada pelo frontend
      const mappedItems = cartItems.map((item, index) => {
        console.log(`🔍 CART CONTEXT - Processing item ${index}:`, item);
        const mappedItem = {
          id: item.product_id, // Usar product_id como id principal
          product_id: item.product_id,
          name: item.product?.name || 'Produto sem nome',
          price: parseFloat(item.product?.price || 0),
          image: item.product?.image_url || null,
          quantity: parseInt(item.quantity || 0),
          weight: item.product?.weight || null,
          category: item.product?.category || null
        };
        console.log(`🔍 CART CONTEXT - Mapped item ${index}:`, mappedItem);
        return mappedItem;
      });

      console.log('🔍 CART CONTEXT - Final mappedItems:', mappedItems);
      setCartItems(mappedItems);
      } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, options = {}) => {
    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!product || !product.id) {
      console.error('❌ Produto inválido ou sem ID:', product);
      return { success: false, message: 'Produto inválido' };
    }

    try {
      if (user && user.id) {
        // 🔒 USUÁRIO LOGADO - Usar API com suporte a preços por peso
        console.log('🛒 Adicionando ao carrinho via API (usuário:', user.id, '- produto:', product.name, '- ID:', product.id, ')');
        console.log('🔍 Opções de peso:', options);
        
        const response = await cartAPI.add(
          product.id,
          quantity,
          options.productPriceId,
          options.weight
        );
        
        if (!response.success) {
          console.error('❌ Erro ao adicionar ao carrinho via API:', response.error || response.message);
          return { success: false, message: response.message || response.error || 'Erro ao adicionar produto' };
        }

        console.log('✅ Produto adicionado via API:', response.data);
        
        // Track analytics event com peso
        analytics.trackAddToCart(product, quantity, options.weight);
        
        // Recarregar carrinho da API
        await loadCart();
        return {
          success: true,
          message: response.message || 'Produto adicionado ao carrinho!'
        };
        
      } else {
        // 🛒 USUÁRIO GUEST - Usar localStorage (para compatibilidade, ainda sem peso)
        console.log('🛒 Adicionando ao carrinho localStorage (guest - produto:', product.name, '- ID:', product.id, ')');
        
        const updatedCart = cartUtils.addToCart(product, quantity);
        console.log('✅ Produto adicionado ao localStorage:', updatedCart);
        
        // Track analytics event
        analytics.trackAddToCart(product, quantity, options.weight);
        
        // Recarregar carrinho do localStorage
        await loadGuestCart();
        return {
          success: true,
          message: 'Produto adicionado ao carrinho!'
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const removeFromCart = async (productId) => {
    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    try {
      if (user && user.id) {
        // 🔒 USUÁRIO LOGADO - Usar API
        console.log('🗑️ Removendo do carrinho via API (usuário:', user.id, '- produto:', productId, ')');
        
        const response = await cartAPI.remove(productId);
        
        if (!response.success) {
          console.error('❌ Erro ao remover do carrinho via API:', response.error || response.message);
          return { success: false, message: response.message || response.error || 'Erro ao remover produto' };
        }

        console.log('✅ Produto removido via API:', response.data);
        
        // Track analytics event - buscar dados do produto antes de recarregar
        const removedProduct = cartItems.find(item => item.id === productId || item.product_id === productId);
        if (removedProduct) {
          analytics.trackRemoveFromCart(removedProduct, removedProduct.quantity);
        }
        
        // Recarregar carrinho da API
        await loadCart();
        return {
          success: true,
          message: response.message || 'Produto removido do carrinho!'
        };
        
      } else {
        // 🛒 USUÁRIO GUEST - Usar localStorage
        console.log('🗑️ Removendo do carrinho localStorage (guest - produto:', productId, ')');
        
        // Track analytics event antes de remover
        const removedProduct = cartItems.find(item => item.id === productId);
        if (removedProduct) {
          analytics.trackRemoveFromCart(removedProduct, removedProduct.quantity);
        }
        
        const updatedCart = cartUtils.removeFromCart(productId);
        console.log('✅ Produto removido do localStorage:', updatedCart);
        
        // Recarregar carrinho do localStorage
        await loadGuestCart();
        return {
          success: true,
          message: 'Produto removido do carrinho!'
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    try {
      if (newQuantity <= 0) {
        return await removeFromCart(productId);
      }

      if (user && user.id) {
        // 🔒 USUÁRIO LOGADO - Usar API
        console.log('📝 Atualizando quantidade via API (usuário:', user.id, '- produto:', productId, '- qtd:', newQuantity, ')');
        
        const response = await cartAPI.update(productId, newQuantity);
        
        if (!response.success) {
          console.error('❌ Erro ao atualizar quantidade via API:', response.error || response.message);
          return { success: false, message: response.message || response.error || 'Erro ao atualizar quantidade' };
        }

        console.log('✅ Quantidade atualizada via API:', response.data);
        
        // Track analytics event - buscar dados do produto antes de recarregar
        const updatedProduct = cartItems.find(item => item.id === productId || item.product_id === productId);
        if (updatedProduct) {
          analytics.trackEvent('cart_quantity_update', {
            product_id: updatedProduct.id,
            product_name: updatedProduct.name,
            product_price: updatedProduct.price,
            old_quantity: updatedProduct.quantity,
            new_quantity: newQuantity,
            quantity_change: newQuantity - updatedProduct.quantity
          });
        }
        
        // Recarregar carrinho da API
        await loadCart();
        return {
          success: true,
          message: response.message || 'Quantidade atualizada!'
        };
        
      } else {
        // 🛒 USUÁRIO GUEST - Usar localStorage
        console.log('📝 Atualizando quantidade localStorage (guest - produto:', productId, '- qtd:', newQuantity, ')');
        
        // Track analytics event antes de atualizar
        const updatedProduct = cartItems.find(item => item.id === productId);
        if (updatedProduct) {
          analytics.trackEvent('cart_quantity_update', {
            product_id: updatedProduct.id,
            product_name: updatedProduct.name,
            product_price: updatedProduct.price,
            old_quantity: updatedProduct.quantity,
            new_quantity: newQuantity,
            quantity_change: newQuantity - updatedProduct.quantity
          });
        }
        
        const updatedCart = cartUtils.updateQuantity(productId, newQuantity);
        console.log('✅ Quantidade atualizada no localStorage:', updatedCart);
        
        // Recarregar carrinho do localStorage
        await loadGuestCart();
        return {
          success: true,
          message: 'Quantidade atualizada!'
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const clearCart = async () => {
    try {
      if (user && user.id) {
        // 🔒 USUÁRIO LOGADO - Usar API
        console.log('🧹 Limpando carrinho via API (usuário:', user.id, ')');
        
        const response = await cartAPI.clear();
        
        if (!response.success) {
          console.error('❌ Erro ao limpar carrinho via API:', response.error || response.message);
          return { success: false, message: response.message || response.error || 'Erro ao limpar carrinho' };
        }
        
        console.log('✅ Carrinho limpo via API:', response.data);
        
        // Track analytics event antes de limpar estado
        const itemsCount = cartItems.length;
        const totalValue = cartTotal;
        if (itemsCount > 0) {
          analytics.trackEvent('cart_clear', {
            items_count: itemsCount,
            total_value: totalValue,
            items_removed: response.data?.items_removed || itemsCount
          });
        }
        
        // Limpar estado local imediatamente
        setCartItems([]);
        setCartTotal(0);
        
        return {
          success: true,
          message: response.message || 'Carrinho limpo!',
          itemsRemoved: response.data?.items_removed || 0
        };
        
      } else {
        // 🛒 USUÁRIO GUEST - Usar localStorage
        console.log('🧹 Limpando carrinho localStorage (guest)');
        
        // Track analytics event antes de limpar
        const itemsCount = cartItems.length;
        const totalValue = cartTotal;
        if (itemsCount > 0) {
          analytics.trackEvent('cart_clear', {
            items_count: itemsCount,
            total_value: totalValue,
            items_removed: itemsCount
          });
        }
        
        cartUtils.clearCart();
        console.log('✅ Carrinho limpo do localStorage');
        
        // Limpar estado local imediatamente
        setCartItems([]);
        setCartTotal(0);
        
        return {
          success: true,
          message: 'Carrinho limpo!',
          itemsRemoved: itemsCount
        };
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const getCartItemsCount = () => {
    // 🔍 DIAGNÓSTICO CARRINHO - Log de acesso getCartItemsCount
    console.log('🔍 CART CONTEXT - getCartItemsCount called');
    console.log('🔍 CART CONTEXT - User state:', !!user, user?.id);
    console.log('🔍 CART CONTEXT - cartItems length:', cartItems.length);
    
    if (user && user.id) {
      // 🔒 USUÁRIO LOGADO - Contar itens do estado
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      console.log('🔍 CART CONTEXT - Calculated count (logged user):', count);
      return count;
    } else {
      // 🛒 USUÁRIO GUEST - Contar itens do localStorage ou estado
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      console.log('🔍 CART CONTEXT - Calculated count (guest user):', count);
      return count;
    }
  };

  const getCartItemsCountSafe = () => {
    try {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Erro em getCartItemsCountSafe:', error);
      return 0;
    }
  };

  const getTotalPrice = () => {
    return cartTotal; // ✅ Retorna total para todos os usuários (logados e guest)
  };

  const value = {
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

export default CartProvider;

