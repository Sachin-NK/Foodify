import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { cartApi } from '@/lib/api';

const CartContext = createContext();
const CART_STORAGE_KEY = 'foodify_cart';

const saveCartToStorage = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
    return null;
  }
};

const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear cart from localStorage:', error);
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      const cartData = {
        items: action.payload.cart_items || action.payload.items || [],
        subtotal: action.payload.subtotal || 0,
        deliveryFee: action.payload.delivery_fee || action.payload.deliveryFee || 0,
        total: action.payload.total || 0,
        restaurantId: action.payload.restaurant_id || action.payload.restaurantId || null,
        loading: false,
        error: null
      };
      
      saveCartToStorage(cartData);
      
      return {
        ...state,
        ...cartData
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

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'OPTIMISTIC_ADD_ITEM':
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.menu_item_id === newItem.menu_item_id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, newItem];
      }
      
      const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newTotal = newSubtotal + state.deliveryFee;
      
      const optimisticCart = {
        ...state,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newTotal,
        restaurantId: newItem.restaurant_id || state.restaurantId
      };
      
      saveCartToStorage(optimisticCart);
      return optimisticCart;

    case 'OPTIMISTIC_UPDATE_QUANTITY':
      const { itemId, quantity } = action.payload;
      const updatedItemsForQuantity = quantity > 0 
        ? state.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
        : state.items.filter(item => item.id !== itemId);
      
      const subtotalAfterUpdate = updatedItemsForQuantity.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalAfterUpdate = subtotalAfterUpdate + state.deliveryFee;
      
      const updatedCartForQuantity = {
        ...state,
        items: updatedItemsForQuantity,
        subtotal: subtotalAfterUpdate,
        total: totalAfterUpdate
      };
      
      saveCartToStorage(updatedCartForQuantity);
      return updatedCartForQuantity;

    case 'OPTIMISTIC_REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload.itemId);
      const subtotalAfterRemove = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalAfterRemove = subtotalAfterRemove + state.deliveryFee;
      
      const cartAfterRemove = {
        ...state,
        items: filteredItems,
        subtotal: subtotalAfterRemove,
        total: totalAfterRemove
      };
      
      saveCartToStorage(cartAfterRemove);
      return cartAfterRemove;

    case 'CLEAR_CART':
      clearCartFromStorage();
      return {
        ...state,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        restaurantId: null
      };

    case 'LOAD_FROM_STORAGE':
      const storedCart = action.payload;
      return {
        ...state,
        ...storedCart,
        loading: false,
        error: null
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
    restaurantId: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    const storedCart = loadCartFromStorage();
    if (storedCart) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: storedCart });
    }
    fetchCart();
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await cartApi.getCart();
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      
      const storedCart = loadCartFromStorage();
      if (storedCart && storedCart.items && storedCart.items.length > 0) {
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: storedCart });
      } else {
        dispatch({ type: 'SET_CART', payload: { cart_items: [], subtotal: 0, delivery_fee: 0, total: 0 } });
      }
    }
  }, []);

  const addToCart = async (menuItemId, quantity = 1, specialInstructions = '', itemData = null) => {
    // Clear any previous errors
    dispatch({ type: 'CLEAR_ERROR' });
    
    if (state.items.length > 0 && itemData && state.restaurantId && itemData.restaurant_id !== state.restaurantId) {
      const error = 'Cannot add items from different restaurants to the same cart.';
      dispatch({ type: 'SET_ERROR', payload: error });
      throw new Error(error);
    }

    if (itemData) {
      const optimisticItem = {
        id: `temp_${Date.now()}`,
        menu_item_id: menuItemId,
        name: itemData.name,
        price: itemData.price,
        quantity: quantity,
        special_instructions: specialInstructions,
        restaurant_id: itemData.restaurant_id,
        restaurant_name: itemData.restaurant_name,
        image_url: itemData.image_url
      };
      
      dispatch({ type: 'OPTIMISTIC_ADD_ITEM', payload: optimisticItem });
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.addItem(menuItemId, quantity, specialInstructions);
      await fetchCart();
    } catch (error) {
      if (itemData) {
        await fetchCart();
      }
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    // Optimistic update - remove item immediately
    dispatch({ type: 'OPTIMISTIC_REMOVE_ITEM', payload: { itemId } });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.removeItem(itemId);
      await fetchCart(); // Refresh cart after removing to get real data
    } catch (error) {
      // Revert optimistic update on error
      await fetchCart(); // Reload from server to revert optimistic changes
      dispatch({ type: 'SET_ERROR', payload: error.message });
      console.error('Failed to remove item from cart:', error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    // Optimistic update - update quantity immediately
    dispatch({ type: 'OPTIMISTIC_UPDATE_QUANTITY', payload: { itemId, quantity } });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.updateItem(itemId, quantity);
      await fetchCart(); // Refresh cart after updating to get real data
    } catch (error) {
      // Revert optimistic update on error
      await fetchCart(); // Reload from server to revert optimistic changes
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
