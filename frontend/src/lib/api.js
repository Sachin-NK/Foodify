// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api'
  : 'http://127.0.0.1:8000/api';

let csrfToken = null;
let csrfTokenPromise = null;

async function getCsrfToken() {
  // If we already have a token, return it
  if (csrfToken) {
    return csrfToken;
  }

  // If we're already fetching a token, wait for that request
  if (csrfTokenPromise) {
    return await csrfTokenPromise;
  }

  // Start fetching the token
  csrfTokenPromise = fetchCsrfToken();
  const token = await csrfTokenPromise;
  csrfTokenPromise = null;
  return token;
}

async function fetchCsrfToken() {
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Referer': window.location.origin
      }
    });

    if (!csrfResponse.ok) {
      console.warn('Failed to fetch CSRF cookie');
      return null;
    }

    // Wait a bit for the cookie to be set
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to get XSRF token from cookies
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    
    if (xsrfCookie) {
      const tokenValue = xsrfCookie.split('XSRF-TOKEN=')[1];
      if (tokenValue) {
        csrfToken = decodeURIComponent(tokenValue);
        return csrfToken;
      }
    }

    console.warn('CSRF token not found in cookies');
    return null;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add authentication token if available
  const user = JSON.parse(localStorage.getItem('foodify-user') || 'null');
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  // Only add CSRF token for state-changing requests
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-XSRF-TOKEN'] = token;
    }
  }

  const defaultOptions = {
    headers,
    credentials: 'include',
  };

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

    // Handle CSRF token mismatch errors
    if (response.status === 419 || (response.status === 403 && response.statusText.includes('CSRF'))) {
      console.log('CSRF token mismatch, refreshing token and retrying...');
      csrfToken = null;
      
      // Get fresh CSRF token
      const newToken = await getCsrfToken();
      if (newToken) {
        // Update headers with new token
        fetchOptions.headers['X-XSRF-TOKEN'] = newToken;
        
        // Retry the request
        const retryResponse = await fetch(url, fetchOptions);
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `API error: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        
        return await retryResponse.json();
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
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
    return apiRequest(`/restaurants${queryString}`);
  },
  getById: (id) => apiRequest(`/restaurants/${id}`),
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

export const cartApi = {
  getCart: () => apiRequest('/cart'),
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
  updateItem: (itemId, quantity) => {
    return apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },
  removeItem: (itemId) => {
    return apiRequest(`/cart/${itemId}`, {
      method: 'DELETE'
    });
  },
  clearCart: () => {
    return apiRequest('/cart', {
      method: 'DELETE'
    });
  },
  getCount: () => apiRequest('/cart/count')
};

export const authApi = {
  login: (email, password) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    });
  },
  register: (name, email, password, passwordConfirmation, role = 'customer') => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role
      })
    });
  },
  getUser: () => apiRequest('/user'),
  logout: () => {
    return apiRequest('/logout', {
      method: 'POST'
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

// Initialize CSRF token when the module loads
export const initializeCsrfToken = async () => {
  try {
    await getCsrfToken();
  } catch (error) {
    console.warn('Failed to initialize CSRF token:', error);
  }
};

export default {
  restaurant: restaurantApi,
  cart: cartApi,
  auth: authApi,
  order: orderApi,
  restaurantOwner: restaurantOwnerApi,
  initializeCsrfToken
};