// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api'
  : 'http://127.0.0.1:8000/api';

// CSRF token handling removed as per requirements

// Enhanced error handling with user-friendly messages
function getErrorMessage(error, status) {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  
  // HTTP status specific messages
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You need to log in to access this feature.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

// Retry mechanism for failed requests
async function retryRequest(requestFn, maxRetries = 2, delay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx) except 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const { retries = 2, timeout = 10000, ...fetchOptions } = options;

  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add authentication token if available
  const user = JSON.parse(localStorage.getItem('foodify-user') || 'null');
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  // CSRF token handling removed as per requirements

  const defaultOptions = {
    headers,
  };

  // Add credentials if specified
  if (fetchOptions.credentials) {
    defaultOptions.credentials = fetchOptions.credentials;
  }

  const finalOptions = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...(fetchOptions.headers || {}),
    },
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  finalOptions.signal = controller.signal;

  const makeRequest = async () => {
    try {
      const response = await fetch(url, finalOptions);

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      // CSRF token mismatch handling removed as per requirements

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(getErrorMessage(errorData, response.status));
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Enhance error with status if not already present
      if (!error.status && error.name !== 'AbortError' && error.name !== 'TypeError') {
        error.status = 0; // Network error
      }
      
      console.error('API request failed:', {
        url,
        method: finalOptions.method || 'GET',
        error: error.message,
        status: error.status
      });
      
      // Transform error message for better user experience
      const transformedError = new Error(getErrorMessage(error, error.status));
      transformedError.status = error.status;
      transformedError.data = error.data;
      throw transformedError;
    }
  };

  // Use retry mechanism for GET requests and safe operations
  if (!fetchOptions.method || fetchOptions.method === 'GET') {
    return retryRequest(makeRequest, retries);
  }
  
  // For state-changing operations, don't retry automatically
  return makeRequest();
}

export const restaurantApi = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/restaurants${queryString}`, { retries: 3 });
  },
  getById: (id) => {
    if (!id) {
      return Promise.reject(new Error('Restaurant ID is required'));
    }
    return apiRequest(`/restaurants/${id}`, { retries: 2 });
  },
  getMenu: (id, filters = {}) => {
    if (!id) {
      return Promise.reject(new Error('Restaurant ID is required'));
    }
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/restaurants/${id}/menu${queryString}`, { retries: 2 });
  }
};

export const cartApi = {
  getCart: () => apiRequest('/cart', { retries: 2 }),
  addItem: (menuItemId, quantity, specialInstructions = '') => {
    if (!menuItemId || !quantity || quantity <= 0) {
      return Promise.reject(new Error('Invalid item or quantity'));
    }
    if (quantity > 99) {
      return Promise.reject(new Error('Maximum quantity is 99 items'));
    }
    if (specialInstructions && specialInstructions.length > 255) {
      return Promise.reject(new Error('Special instructions are too long (max 255 characters)'));
    }
    return apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({
        menu_item_id: menuItemId,
        quantity: parseInt(quantity),
        special_instructions: specialInstructions.trim()
      }),
      retries: 1
    });
  },
  updateItem: (itemId, quantity) => {
    if (!itemId || quantity < 0) {
      return Promise.reject(new Error('Invalid item ID or quantity'));
    }
    if (quantity > 99) {
      return Promise.reject(new Error('Maximum quantity is 99 items'));
    }
    return apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: parseInt(quantity) }),
      retries: 1
    });
  },
  removeItem: (itemId) => {
    if (!itemId) {
      return Promise.reject(new Error('Item ID is required'));
    }
    return apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
      retries: 1
    });
  },
  clearCart: () => {
    return apiRequest('/cart', {
      method: 'DELETE',
      retries: 1
    });
  },
  getCount: () => apiRequest('/cart/count', { retries: 2 })
};

export const authApi = {
  login: (email, password) => {
    if (!email || !password) {
      return Promise.reject(new Error('Email and password are required'));
    }
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password
      }),
      retries: 1
    });
  },
  register: (name, email, password, passwordConfirmation, role = 'customer') => {
    if (!name || !email || !password || !passwordConfirmation) {
      return Promise.reject(new Error('All fields are required'));
    }
    if (password !== passwordConfirmation) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role
      }),
      retries: 1
    });
  },
  getUser: () => apiRequest('/user', { retries: 2 }),
  logout: () => {
    return apiRequest('/logout', {
      method: 'POST',
      retries: 1
    });
  }
};

export const orderApi = {
  placeOrder: (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  getOrder: (orderNumber) => apiRequest(`/orders/${orderNumber}`),
  trackOrder: (orderNumber) => apiRequest(`/orders/${orderNumber}/track`)
};

export const restaurantOwnerApi = {
  getOwnedRestaurants: () => apiRequest('/restaurants/owned'),
  createRestaurant: (formData) => {
    const options = {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it with boundary for FormData
    };
    delete options.headers['Content-Type'];
    return apiRequest('/restaurants', options);
  },
  getRestaurant: (id) => apiRequest(`/restaurants/${id}/manage`),
  updateRestaurant: (id, formData) => {
    const options = {
      method: 'PUT',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    };
    delete options.headers['Content-Type'];
    return apiRequest(`/restaurants/${id}`, options);
  },
  deleteRestaurant: (id) => apiRequest(`/restaurants/${id}`, { method: 'DELETE' }),
  
  // Menu management
  getMenuItems: (restaurantId) => apiRequest(`/restaurants/${restaurantId}/menu/manage`),
  createMenuItem: (restaurantId, formData) => {
    const options = {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    };
    delete options.headers['Content-Type'];
    return apiRequest(`/restaurants/${restaurantId}/menu`, options);
  },
  getMenuItem: (restaurantId, itemId) => apiRequest(`/restaurants/${restaurantId}/menu/${itemId}`),
  updateMenuItem: (restaurantId, itemId, formData) => {
    const options = {
      method: 'PUT',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    };
    delete options.headers['Content-Type'];
    return apiRequest(`/restaurants/${restaurantId}/menu/${itemId}`, options);
  },
  deleteMenuItem: (restaurantId, itemId) => apiRequest(`/restaurants/${restaurantId}/menu/${itemId}`, { method: 'DELETE' }),
  toggleMenuItemAvailability: (restaurantId, itemId) => apiRequest(`/restaurants/${restaurantId}/menu/${itemId}/toggle`, { method: 'PATCH' }),
  
  // Category management
  getCategories: (restaurantId) => apiRequest(`/restaurants/${restaurantId}/categories`),
  createCategory: (restaurantId, categoryData) => {
    return apiRequest(`/restaurants/${restaurantId}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },
  getCategory: (restaurantId, categoryId) => apiRequest(`/restaurants/${restaurantId}/categories/${categoryId}`),
  updateCategory: (restaurantId, categoryId, categoryData) => {
    return apiRequest(`/restaurants/${restaurantId}/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },
  deleteCategory: (restaurantId, categoryId, options = {}) => {
    return apiRequest(`/restaurants/${restaurantId}/categories/${categoryId}`, {
      method: 'DELETE',
      body: JSON.stringify(options)
    });
  },
  updateCategorySortOrder: (restaurantId, sortData) => {
    return apiRequest(`/restaurants/${restaurantId}/categories/sort`, {
      method: 'POST',
      body: JSON.stringify({ categories: sortData })
    });
  }
};

// CSRF token initialization removed as per requirements

export default {
  restaurant: restaurantApi,
  cart: cartApi,
  auth: authApi,
  order: orderApi,
  restaurantOwner: restaurantOwnerApi
};