// API client for communicating with the Laravel backend

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Generic API request function with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default options for fetch
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Important for cookies/session
  };
  
  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Restaurant API functions
 */
export const restaurantApi = {
  // Get all restaurants with optional filters
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/restaurants${queryString}`);
  },
  
  // Get a specific restaurant by ID
  getById: (id) => apiRequest(`/restaurants/${id}`),
  
  // Get menu items for a restaurant
  getMenu: (id, filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/restaurants/${id}/menu${queryString}`);
  }
};

/**
 * Cart API functions
 */
export const cartApi = {
  // Get cart contents
  getCart: () => apiRequest('/cart'),
  
  // Add item to cart
  addItem: (menuItemId, quantity, specialInstructions = '') => {
    return apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({
        menu_item_id: menuItemId,
        quantity,
        special_instructions: specialInstructions
      })
    });
  },
  
  // Update cart item quantity
  updateItem: (itemId, quantity) => {
    return apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },
  
  // Remove item from cart
  removeItem: (itemId) => {
    return apiRequest(`/cart/${itemId}`, {
      method: 'DELETE'
    });
  },
  
  // Clear entire cart
  clearCart: () => {
    return apiRequest('/cart', {
      method: 'DELETE'
    });
  },
  
  // Get cart item count
  getCount: () => apiRequest('/cart/count')
};

/**
 * Order API functions
 */
export const orderApi = {
  // Place a new order
  placeOrder: (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  
  // Get order details by order number
  getOrder: (orderNumber) => apiRequest(`/orders/${orderNumber}`),
  
  // Track order status
  trackOrder: (orderNumber) => apiRequest(`/orders/${orderNumber}/track`)
};

export default {
  restaurant: restaurantApi,
  cart: cartApi,
  order: orderApi
};