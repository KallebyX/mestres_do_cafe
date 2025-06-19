import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI, cartUtils } from '../lib/api';

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload
      };
    }
    
    case 'SET_ITEMS': {
      const items = action.payload;
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        items,
        total,
        loading: false
      };
    }
    
    case 'ADD_ITEM': {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      let updatedItems;
      
      if (existingItemIndex >= 0) {
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...newItem, quantity: newItem.quantity || 1 }];
      }
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        total
      };
    }
    
    case 'REMOVE_ITEM': {
      const itemId = action.payload;
      const updatedItems = state.items.filter(item => item.id !== itemId);
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        total
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      const updatedItems = state.items.map(item => 
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0);
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        total
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        total: 0
      };
    }
    
    case 'APPLY_DISCOUNT': {
      const discount = action.payload;
      return {
        ...state,
        discount,
        discountedTotal: state.total - discount
      };
    }
    
    default:
      return state;
  }
}

const initialState = {
  items: [],
  total: 0,
  itemsCount: 0,
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cartData = await productsAPI.getCart();
      dispatch({ type: 'SET_ITEMS', payload: cartData });
      cartUtils.updateCartCount();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addToCart = async (productId, quantity = 1, weightOption = null) => {
    try {
      await productsAPI.addToCart({
        product_id: productId,
        quantity,
        weight_option: weightOption
      });
      await loadCart(); // Recarregar carrinho do servidor
      cartUtils.updateCartCount();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await productsAPI.updateCartItem(itemId, { quantity });
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
        cartUtils.updateCartCount();
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await productsAPI.removeFromCart(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      cartUtils.updateCartCount();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await productsAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      cartUtils.updateCartCount();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

