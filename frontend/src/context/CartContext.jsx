import { createContext, useContext, useEffect, useReducer } from 'react';
import { cartApi } from '@/lib/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.cart_items || [],
        subtotal: action.payload.subtotal || 0,
        deliveryFee: action.payload.delivery_fee || 0,
        total: action.payload.total || 0,
        loading: false,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    loading: false,
    error: null
  });

  // Load cart from backend on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await cartApi.getCart();
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (menuItemId, quantity = 1, specialInstructions = '') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.addItem(menuItemId, quantity, specialInstructions);
      await fetchCart(); // Refresh cart after adding
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to add item to cart:', error);
      throw error; // Re-throw so components can handle it
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.removeItem(itemId);
      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to remove item from cart:', error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.updateItem(itemId, quantity);
      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to update cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to clear cart:', error);
    }
  };

  const getCartTotal = () => {
    return state.total || 0;
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
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
