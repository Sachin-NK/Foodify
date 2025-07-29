/**
 * Unit tests for PlatformContextService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PlatformContextService from '../platformContextService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
delete window.location;
window.location = {
  pathname: '/',
  search: '',
  href: 'http://localhost:3000/'
};

describe('PlatformContextService', () => {
  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    fetch.mockClear();
    
    // Reset window location
    window.location.pathname = '/';
    window.location.search = '';
    
    // Clear service context
    PlatformContextService.clearContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentPageContext', () => {
    it('should return home page context', () => {
      window.location.pathname = '/';
      
      const context = PlatformContextService.getCurrentPageContext();
      
      expect(context.route).toBe('/');
      expect(context.title).toBe('Home');
      expect(context.type).toBe('home');
      expect(context.timestamp).toBeDefined();
    });

    it('should return browse page context', () => {
      window.location.pathname = '/browse';
      
      const context = PlatformContextService.getCurrentPageContext();
      
      expect(context.route).toBe('/browse');
      expect(context.title).toBe('Browse Restaurants');
      expect(context.type).toBe('browse');
    });

    it('should handle restaurant menu page', () => {
      window.location.pathname = '/restaurant/123';
      
      const context = PlatformContextService.getCurrentPageContext();
      
      expect(context.route).toBe('/restaurant/123');
      expect(context.title).toBe('Restaurant Menu');
      expect(context.type).toBe('restaurant-menu');
      expect(context.restaurantId).toBe('123');
    });

    it('should handle search parameters', () => {
      window.location.pathname = '/browse';
      window.location.search = '?cuisine=italian&location=colombo';
      
      const context = PlatformContextService.getCurrentPageContext();
      
      expect(context.searchParams).toEqual({
        cuisine: 'italian',
        location: 'colombo'
      });
    });

    it('should handle unknown routes', () => {
      window.location.pathname = '/unknown-route';
      
      const context = PlatformContextService.getCurrentPageContext();
      
      expect(context.title).toBe('Unknown Page');
      expect(context.type).toBe('unknown');
    });
  });

  describe('getUserContext', () => {
    it('should return authenticated user context', () => {
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer'
      };
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(userData);
        if (key === 'token') return 'valid-token';
        return null;
      });
      
      const context = PlatformContextService.getUserContext();
      
      expect(context.isAuthenticated).toBe(true);
      expect(context.name).toBe('John Doe');
      expect(context.email).toBe('john@example.com');
      expect(context.role).toBe('customer');
    });

    it('should return guest context when not authenticated', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const context = PlatformContextService.getUserContext();
      
      expect(context.isAuthenticated).toBe(false);
      expect(context.role).toBe('guest');
    });

    it('should handle invalid user data in localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return 'invalid-json';
        if (key === 'token') return 'valid-token';
        return null;
      });
      
      const context = PlatformContextService.getUserContext();
      
      expect(context.isAuthenticated).toBe(false);
      expect(context.role).toBe('guest');
    });
  });

  describe('getCartContext', () => {
    it('should return cart with items', () => {
      const cartData = {
        items: [
          { id: 1, name: 'Pizza', price: 1200 },
          { id: 2, name: 'Burger', price: 800 }
        ],
        total: 2000,
        restaurant: { id: 1, name: 'Pizza Palace' }
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cartData));
      
      const context = PlatformContextService.getCartContext();
      
      expect(context.items).toHaveLength(2);
      expect(context.total).toBe(2000);
      expect(context.itemCount).toBe(2);
      expect(context.restaurant.name).toBe('Pizza Palace');
      expect(context.isEmpty).toBe(false);
    });

    it('should return empty cart context', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const context = PlatformContextService.getCartContext();
      
      expect(context.items).toEqual([]);
      expect(context.total).toBe(0);
      expect(context.itemCount).toBe(0);
      expect(context.restaurant).toBe(null);
      expect(context.isEmpty).toBe(true);
    });

    it('should handle invalid cart data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const context = PlatformContextService.getCartContext();
      
      expect(context.isEmpty).toBe(true);
    });
  });

  describe('getRestaurantContext', () => {
    it('should return cached restaurant data', async () => {
      const restaurantData = {
        id: '123',
        name: 'Pizza Palace',
        cuisine: 'Italian',
        rating: 4.5,
        deliveryTime: '30-45 min',
        isOpen: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(restaurantData));
      
      const context = await PlatformContextService.getRestaurantContext('123');
      
      expect(context.name).toBe('Pizza Palace');
      expect(context.cuisine).toBe('Italian');
      expect(context.rating).toBe(4.5);
    });

    it('should fetch restaurant data from API when not cached', async () => {
      const restaurantData = {
        id: '123',
        name: 'Burger King',
        cuisine: 'Fast Food',
        rating: 4.2,
        deliveryTime: '20-30 min',
        isOpen: true
      };
      
      localStorageMock.getItem.mockReturnValue(null);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => restaurantData
      });
      
      const context = await PlatformContextService.getRestaurantContext('123');
      
      expect(context.name).toBe('Burger King');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'restaurant_123',
        JSON.stringify(restaurantData)
      );
    });

    it('should return null when API fails', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      const context = await PlatformContextService.getRestaurantContext('123');
      
      expect(context).toBe(null);
    });

    it('should get restaurant ID from current page', async () => {
      window.location.pathname = '/restaurant/456';
      
      const restaurantData = {
        id: '456',
        name: 'Sushi Bar',
        cuisine: 'Japanese'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(restaurantData));
      
      const context = await PlatformContextService.getRestaurantContext();
      
      expect(context.name).toBe('Sushi Bar');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('restaurant_456');
    });
  });

  describe('getRecentOrdersContext', () => {
    it('should return empty array for unauthenticated user', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const orders = await PlatformContextService.getRecentOrdersContext();
      
      expect(orders).toEqual([]);
    });

    it('should return cached orders when available and fresh', async () => {
      const userData = { id: '123', name: 'John' };
      const ordersData = {
        data: [
          { id: 1, status: 'delivered', total: 1500 },
          { id: 2, status: 'preparing', total: 2000 }
        ],
        timestamp: Date.now() - 30 * 60 * 1000 // 30 minutes ago
      };
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(userData);
        if (key === 'token') return 'valid-token';
        if (key === 'recent_orders_123') return JSON.stringify(ordersData);
        return null;
      });
      
      const orders = await PlatformContextService.getRecentOrdersContext();
      
      expect(orders).toHaveLength(2);
      expect(orders[0].status).toBe('delivered');
    });

    it('should fetch fresh orders when cache is stale', async () => {
      const userData = { id: '123', name: 'John' };
      const staleOrdersData = {
        data: [],
        timestamp: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
      };
      const freshOrders = [
        { id: 3, status: 'delivered', total: 1800, restaurant: 'Pizza Place', createdAt: '2023-01-01' }
      ];
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(userData);
        if (key === 'token') return 'valid-token';
        if (key === 'recent_orders_123') return JSON.stringify(staleOrdersData);
        return null;
      });
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => freshOrders
      });
      
      const orders = await PlatformContextService.getRecentOrdersContext();
      
      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(3);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recent_orders_123',
        expect.stringContaining('"data"')
      );
    });
  });

  describe('getFullPlatformContext', () => {
    it('should return comprehensive context', async () => {
      window.location.pathname = '/browse';
      
      const userData = { id: '123', name: 'John' };
      const cartData = { items: [], total: 0 };
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(userData);
        if (key === 'token') return 'valid-token';
        if (key === 'cart') return JSON.stringify(cartData);
        return null;
      });
      
      const context = await PlatformContextService.getFullPlatformContext({
        includeOrders: false,
        includeRestaurant: false
      });
      
      expect(context.page.type).toBe('browse');
      expect(context.user.isAuthenticated).toBe(true);
      expect(context.cart.isEmpty).toBe(true);
      expect(context.timestamp).toBeDefined();
    });
  });

  describe('getContextualQuickActions', () => {
    it('should return home page actions', () => {
      window.location.pathname = '/';
      
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.some(action => action.label === 'Find Restaurants')).toBe(true);
      expect(actions.some(action => action.label === 'Popular Dishes')).toBe(true);
    });

    it('should return browse page actions', () => {
      window.location.pathname = '/browse';
      
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.some(action => action.label === 'Filter Options')).toBe(true);
      expect(actions.some(action => action.label === 'Nearby Restaurants')).toBe(true);
    });

    it('should return restaurant menu actions', () => {
      window.location.pathname = '/restaurant/123';
      
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.some(action => action.label === 'Menu Recommendations')).toBe(true);
      expect(actions.some(action => action.label === 'Delivery Info')).toBe(true);
    });

    it('should include auth actions for unauthenticated users', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.some(action => action.label === 'Login Help')).toBe(true);
      expect(actions.some(action => action.label === 'Sign Up Help')).toBe(true);
    });

    it('should include account actions for authenticated users', () => {
      const userData = { id: '123', name: 'John' };
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(userData);
        if (key === 'token') return 'valid-token';
        return null;
      });
      
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.some(action => action.label === 'Account Help')).toBe(true);
      expect(actions.some(action => action.label === 'Order History')).toBe(true);
    });

    it('should limit actions to 6 items', () => {
      const actions = PlatformContextService.getContextualQuickActions();
      
      expect(actions.length).toBeLessThanOrEqual(6);
    });
  });

  describe('context management', () => {
    it('should update cached context', () => {
      const updates = { customData: 'test' };
      
      PlatformContextService.updateContext(updates);
      
      expect(PlatformContextService.currentContext.customData).toBe('test');
      expect(PlatformContextService.currentContext.timestamp).toBeDefined();
    });

    it('should clear cached context', () => {
      PlatformContextService.currentContext = { test: 'data' };
      
      PlatformContextService.clearContext();
      
      expect(PlatformContextService.currentContext).toEqual({});
    });
  });
});