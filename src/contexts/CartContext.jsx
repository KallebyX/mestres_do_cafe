import React, { createContext, useContext, useState, useEffect } from 'react';

// =============================================
// CART UTILITIES - FUNÇÕES LOCAIS
// =============================================

const cartUtils = {
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
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    try {
      const cartData = cartUtils.getCart();
      setCartItems(cartData.items || []);
      cartUtils.updateCartCount();
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }, []);

  // Calcular total do carrinho sempre que os itens mudarem
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    try {
      const currentCart = cartUtils.getCart();
      const existingItem = currentCart.items.find(item => item.id === product.id);

      let newCartData;
      if (existingItem) {
        // Atualizar quantidade do item existente
        newCartData = {
          ...currentCart,
          items: currentCart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        // Adicionar novo item
        newCartData = {
          ...currentCart,
          items: [
            ...currentCart.items,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: quantity,
              weight: product.weight,
              grind: product.grind || 'grãos'
            }
          ]
        };
      }

      cartUtils.saveCart(newCartData);
      setCartItems(newCartData.items);
      cartUtils.updateCartCount();

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      const currentCart = cartUtils.getCart();
      
      const newCartData = {
        ...currentCart,
        items: currentCart.items.filter(item => item.id !== productId)
      };

      cartUtils.saveCart({
        ...newCartData,
        total: newCartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });

      setCartItems(newCartData.items);
      cartUtils.updateCartCount();

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setIsLoading(true);
    try {
      const currentCart = cartUtils.getCart();
      
      const newCartData = {
        ...currentCart,
        items: currentCart.items.map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

      cartUtils.saveCart({
        ...newCartData,
        total: newCartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });

      setCartItems(newCartData.items);
      cartUtils.updateCartCount();

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      cartUtils.clearCart();
      setCartItems([]);
      setCartTotal(0);

      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartTotal,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemsCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

