import { API_BASE_URL } from '../config/api.js';

let csrfToken = null;

async function getCsrfToken() {
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
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));

    if (csrfCookie) {
      csrfToken = decodeURIComponent(csrfCookie.split('=')[1]);
      return csrfToken;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

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

    if (response.status === 419 || response.status === 403) {
      csrfToken = null;
      const newToken = await getCsrfToken();
      if (newToken && fetchOptions.headers) {
        fetchOptions.headers['X-XSRF-TOKEN'] = newToken;
        const retryResponse = await fetch(url, fetchOptions);
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
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
  register: (name, email, password, passwordConfirmation) => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
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

export default {
  restaurant: restaurantApi,
  cart: cartApi,
  auth: authApi,
  order: orderApi
};