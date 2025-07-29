/**
 * Platform Context Service
 * Gathers relevant platform information to provide context to the AI chatbot
 */

import { useLocation } from 'wouter';

/**
 * Platform Context Service class
 */
class PlatformContextService {
  constructor() {
    this.currentContext = {};
  }

  /**
   * Gets the current page context based on the URL and route
   * @returns {Object} - Page context information
   */
  getCurrentPageContext() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Map routes to readable page information
    const routeMap = {
      '/': { title: 'Home', type: 'home' },
      '/browse': { title: 'Browse Restaurants', type: 'browse' },
      '/cart': { title: 'Shopping Cart', type: 'cart' },
      '/checkout': { title: 'Checkout', type: 'checkout' },
      '/login': { title: 'Login', type: 'auth' },
      '/register': { title: 'Register', type: 'auth' },
      '/restaurant-register': { title: 'Restaurant Registration', type: 'restaurant-auth' },
      '/track-order': { title: 'Track Order', type: 'order-tracking' },
      '/admin': { title: 'Admin Dashboard', type: 'admin' },
      '/restaurant-dashboard': { title: 'Restaurant Dashboard', type: 'restaurant-dashboard' }
    };

    // Handle dynamic routes
    let pageInfo = routeMap[path];
    
    if (!pageInfo) {
      if (path.startsWith('/restaurant/')) {
        const restaurantId = path.split('/')[2];
        pageInfo = { 
          title: 'Restaurant Menu', 
          type: 'restaurant-menu',
          restaurantId: restaurantId
        };
      } else {
        pageInfo = { title: 'Unknown Page', type: 'unknown' };
      }
    }

    return {
      route: path,
      title: pageInfo.title,
      type: pageInfo.type,
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gets user context from localStorage or authentication state
   * @returns {Object} - User context information
   */
  getUserContext() {
    try {
      // Check for user data in localStorage (common pattern in React apps)
      const userData = localStorage.getItem('foodify-user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.token) {
          return {
            isAuthenticated: true,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'customer',
            preferences: user.preferences || {}
          };
        }
      }
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
    }

    return {
      isAuthenticated: false,
      role: 'guest'
    };
  }

  /**
   * Gets current cart context
   * @returns {Object} - Cart context information
   */
  getCartContext() {
    try {
      // Get cart data from localStorage
      const cartData = localStorage.getItem('cart');
      
      if (cartData) {
        const cart = JSON.parse(cartData);
        return {
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.length || 0,
          restaurant: cart.restaurant || null,
          isEmpty: !cart.items || cart.items.length === 0
        };
      }
    } catch (error) {
      console.warn('Error parsing cart data from localStorage:', error);
    }

    return {
      items: [],
      total: 0,
      itemCount: 0,
      restaurant: null,
      isEmpty: true
    };
  }

  /**
   * Gets restaurant context for the current page
   * @param {string} restaurantId - Optional restaurant ID
   * @returns {Promise<Object>} - Restaurant context information
   */
  async getRestaurantContext(restaurantId = null) {
    try {
      // If no restaurantId provided, try to get it from current page
      if (!restaurantId) {
        const pageContext = this.getCurrentPageContext();
        restaurantId = pageContext.restaurantId;
      }

      if (!restaurantId) {
        return null;
      }

      // Try to get restaurant data from API or localStorage cache
      const cachedRestaurant = localStorage.getItem(`restaurant_${restaurantId}`);
      
      if (cachedRestaurant) {
        const restaurant = JSON.parse(cachedRestaurant);
        return {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          deliveryTime: restaurant.deliveryTime,
          minimumOrder: restaurant.minimumOrder,
          isOpen: restaurant.isOpen,
          categories: restaurant.categories || []
        };
      }

      // If not cached, make API call
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}`);
      if (response.ok) {
        const restaurant = await response.json();
        
        // Cache the restaurant data
        localStorage.setItem(`restaurant_${restaurantId}`, JSON.stringify(restaurant));
        
        return {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          deliveryTime: restaurant.deliveryTime,
          minimumOrder: restaurant.minimumOrder,
          isOpen: restaurant.isOpen,
          categories: restaurant.categories || []
        };
      }
    } catch (error) {
      console.warn('Error fetching restaurant context:', error);
    }

    return null;
  }

  /**
   * Gets recent orders context for the user
   * @returns {Promise<Array>} - Recent orders information
   */
  async getRecentOrdersContext() {
    try {
      const userContext = this.getUserContext();
      
      if (!userContext.isAuthenticated) {
        return [];
      }

      // Try to get recent orders from localStorage cache first
      const cachedOrders = localStorage.getItem(`recent_orders_${userContext.id}`);
      
      if (cachedOrders) {
        const orders = JSON.parse(cachedOrders);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        // Return cached orders if they're less than an hour old
        if (orders.timestamp > oneHourAgo) {
          return orders.data.slice(0, 5); // Return last 5 orders
        }
      }

      // Fetch from API
      const response = await fetch('http://127.0.0.1:8000/api/orders/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        
        // Cache the orders
        localStorage.setItem(`recent_orders_${userContext.id}`, JSON.stringify({
          data: orders,
          timestamp: Date.now()
        }));
        
        return orders.slice(0, 5).map(order => ({
          id: order.id,
          status: order.status,
          total: order.total,
          restaurant: order.restaurant,
          createdAt: order.createdAt,
          estimatedDelivery: order.estimatedDelivery
        }));
      }
    } catch (error) {
      console.warn('Error fetching recent orders:', error);
    }

    return [];
  }

  /**
   * Gets comprehensive platform context
   * @param {Object} options - Options for context gathering
   * @returns {Promise<Object>} - Complete platform context
   */
  async getFullPlatformContext(options = {}) {
    const { includeOrders = true, includeRestaurant = true } = options;
    
    const context = {
      page: this.getCurrentPageContext(),
      user: this.getUserContext(),
      cart: this.getCartContext(),
      timestamp: new Date().toISOString()
    };

    // Add restaurant context if on restaurant page or if requested
    if (includeRestaurant) {
      context.currentRestaurant = await this.getRestaurantContext();
    }

    // Add recent orders if user is authenticated and requested
    if (includeOrders && context.user.isAuthenticated) {
      context.recentOrders = await this.getRecentOrdersContext();
    }

    // Cache the context for quick access
    this.currentContext = context;
    
    return context;
  }

  /**
   * Gets quick context for immediate use (synchronous)
   * @returns {Object} - Basic platform context
   */
  getQuickContext() {
    return {
      page: this.getCurrentPageContext(),
      user: this.getUserContext(),
      cart: this.getCartContext(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Updates cached context when user performs actions
   * @param {Object} updates - Context updates
   */
  updateContext(updates) {
    this.currentContext = {
      ...this.currentContext,
      ...updates,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clears cached context
   */
  clearContext() {
    this.currentContext = {};
  }

  /**
   * Gets context-aware quick actions based on current state
   * @returns {Array} - Array of quick action objects
   */
  getContextualQuickActions() {
    const context = this.getQuickContext();
    const actions = [];

    // Page-specific actions
    switch (context.page.type) {
      case 'home':
        actions.push(
          { id: 'browse', label: 'Find Restaurants', action: 'navigate', data: '/browse' },
          { id: 'popular', label: 'Popular Dishes', action: 'search', data: 'popular' }
        );
        break;
        
      case 'browse':
        actions.push(
          { id: 'filter', label: 'Filter Options', action: 'show_filters' },
          { id: 'nearby', label: 'Nearby Restaurants', action: 'location_search' }
        );
        break;
        
      case 'restaurant-menu':
        actions.push(
          { id: 'menu_help', label: 'Menu Recommendations', action: 'menu_help' },
          { id: 'delivery_info', label: 'Delivery Info', action: 'delivery_info' }
        );
        break;
        
      case 'cart':
        if (!context.cart.isEmpty) {
          actions.push(
            { id: 'checkout_help', label: 'Checkout Help', action: 'checkout_help' },
            { id: 'modify_order', label: 'Modify Order', action: 'modify_order' }
          );
        }
        break;
        
      case 'order-tracking':
        actions.push(
          { id: 'track_order', label: 'Track My Order', action: 'track_order' },
          { id: 'contact_delivery', label: 'Contact Delivery', action: 'contact_delivery' }
        );
        break;
    }

    // User-specific actions
    if (!context.user.isAuthenticated) {
      actions.push(
        { id: 'login_help', label: 'Login Help', action: 'login_help' },
        { id: 'register_help', label: 'Sign Up Help', action: 'register_help' }
      );
    } else {
      actions.push(
        { id: 'account_help', label: 'Account Help', action: 'account_help' },
        { id: 'order_history', label: 'Order History', action: 'order_history' }
      );
    }

    // General actions
    actions.push(
      { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      { id: 'faq', label: 'FAQ', action: 'faq' }
    );

    return actions.slice(0, 6); // Limit to 6 actions
  }
}

// Export singleton instance
export default new PlatformContextService();