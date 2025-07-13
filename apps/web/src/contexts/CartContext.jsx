import { createContext, useContext, useEffect, useState } from 'react';
import { cartAPI } from "../lib/api.js";
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

  // Inicialização segura: carrinho APENAS para usuários logados
  useEffect(() => {
    let isMounted = true;
    
    if (user && user.id && isMounted) {
      setRequiresLogin(false);
      loadCart();
    } else if (isMounted) {
      setRequiresLogin(true);
      setCartItems([]);
      setCartTotal(0);
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

  const loadCart = async () => {
    // 🔒 SEGURANÇA: Carrinho APENAS para usuários autenticados
    if (!user || !user.id) {
      setCartItems([]);
      setCartTotal(0);
      setRequiresLogin(true);
      return;
    }

    setIsLoading(true);
    setRequiresLogin(false);
    
    try {
      // 🔒 BUSCAR carrinho do usuário logado via API Flask
      const response = await cartAPI.getCart();
      
      if (!response.success) {
        console.error('❌ Erro ao carregar carrinho:', response.message);
        setCartItems([]);
        return;
      }

      const cartItems = response.data.items || [];
      
      if (cartItems.length === 0) {
        setCartItems([]);
        return;
      }

      setCartItems(cartItems);
      } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      setRequiresLogin(true);
      return { success: false, message: 'Login necessário para adicionar produtos ao carrinho' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!product || !product.id) {
      console.error('❌ Produto inválido ou sem ID:', product);
      return { success: false, message: 'Produto inválido' };
    }

    try {
      console.log('🛒 Adicionando ao carrinho (usuário:', user.id, '- produto:', product.name, '- ID:', product.id, ')');
      
      // Adicionar via API Flask
      const response = await cartAPI.add(product.id, quantity);
      
      if (!response.success) {
        console.error('❌ Erro ao adicionar ao carrinho:', response.message);
        return { success: false, message: response.message || 'Erro ao adicionar produto' };
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true, message: 'Produto adicionado ao carrinho!' };
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const removeFromCart = async (productId) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      return { success: false, message: 'Login necessário' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    try {
      console.log('🗑️ Removendo do carrinho (usuário:', user.id, '- produto:', productId, ')');
      
      // Remover via API Flask
      const response = await cartAPI.remove(productId);
      
      if (!response.success) {
        console.error('❌ Erro ao remover do carrinho:', response.message);
        return { success: false, message: response.message || 'Erro ao remover produto' };
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true, message: 'Produto removido do carrinho!' };
      
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // 🔒 SEGURANÇA: Verificações rigorosas antes de qualquer operação
    if (!user || !user.id) {
      return { success: false, message: 'Login necessário' };
    }

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se temos produto válido
    if (!productId) {
      console.error('❌ Product ID não fornecido');
      return { success: false, message: 'ID de produto não fornecido' };
    }

    try {
      if (newQuantity <= 0) {
        return await removeFromCart(productId);
      }

      console.log('📝 Atualizando quantidade (usuário:', user.id, '- produto:', productId, '- qtd:', newQuantity, ')');
      
      // Atualizar via API Flask
      const response = await cartAPI.update(productId, newQuantity);
      
      if (!response.success) {
        console.error('❌ Erro ao atualizar quantidade:', response.message);
        return { success: false, message: response.message || 'Erro ao atualizar quantidade' };
      }

      // Recarregar carrinho
      await loadCart();
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const clearCart = async () => {
    // 🔒 SEGURANÇA: Apenas usuários autenticados podem limpar carrinho
    if (!user || !user.id) {
      return { success: false, message: 'Login necessário' };
    }

    try {
      console.log('🧹 Limpando carrinho (usuário:', user.id, ')');
      
      // Limpar via API Flask
      const response = await cartAPI.clear();
      
      if (!response.success) {
        console.error('❌ Erro ao limpar carrinho:', response.message);
        return { success: false, message: response.message || 'Erro ao limpar carrinho' };
      }
      
      setCartItems([]);
      setCartTotal(0);
      return { success: true, message: 'Carrinho limpo!' };
      
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      return { success: false, message: 'Erro interno' };
    }
  };

  const getCartItemsCount = () => {
    if (!user || !user.id) return 0; // 🔒 Sem usuário = sem carrinho
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItemsCountSafe = () => {
    // 🔒 Versão segura que sempre retorna 0 se não logado
    if (!user || !user.id) return 0;
    
    try {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Erro em getCartItemsCountSafe:', error);
      return 0;
    }
  };

  const getTotalPrice = () => {
    if (!user || !user.id) return 0; // 🔒 Sem usuário = sem total
    return cartTotal;
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

