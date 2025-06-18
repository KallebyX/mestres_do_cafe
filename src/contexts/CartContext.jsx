import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI, cartUtils } from '../lib/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload.cart_items || [],
        total: action.payload.total || 0,
        itemsCount: action.payload.items_count || 0,
        loading: false 
      };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id && 
                item.weight_option === action.payload.weight_option
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newTotal = newItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemsCount: newCount
      };
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const updatedTotal = updatedItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );
      const updatedCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedTotal,
        itemsCount: updatedCount
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredTotal = filteredItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );
      const filteredCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        total: filteredTotal,
        itemsCount: filteredCount
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemsCount: 0
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

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
      dispatch({ type: 'SET_CART', payload: cartData });
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
        dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
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

