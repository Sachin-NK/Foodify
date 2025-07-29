import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cartApi, restaurantOwnerApi } from '../../lib/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('Protected Routes Authentication Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cart API (requires authentication)', () => {
    it('should include Authorization header when accessing cart with token', async () => {
      // Set up authenticated user
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        name: 'Test User',
        token: 'valid-auth-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          items: [],
          total: 0
        })
      });

      await cartApi.getCart();

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/cart',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          })
        })
      );
    });

    it('should fail when accessing cart without token', async () => {
      localStorage.clear();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Unauthenticated.'
        })
      });

      await expect(cartApi.getCart())
        .rejects.toThrow('You need to log in to access this feature.');
    });

    it('should add item to cart with authentication', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'valid-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'Item added to cart',
          item: { id: 1, quantity: 2 }
        })
      });

      await cartApi.addItem(1, 2, 'Extra spicy');

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/cart',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          }),
          body: JSON.stringify({
            menu_item_id: 1,
            quantity: 2,
            special_instructions: 'Extra spicy'
          })
        })
      );
    });
  });

  describe('Restaurant Owner API (requires authentication)', () => {
    it('should access owned restaurants with authentication', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        name: 'Restaurant Owner',
        token: 'owner-token',
        isRestaurantOwner: true
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          restaurants: [
            { id: 1, name: 'Test Restaurant' }
          ]
        })
      });

      await restaurantOwnerApi.getOwnedRestaurants();

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/restaurants/owned',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer owner-token'
          })
        })
      );
    });

    it('should fail to access restaurant management without authentication', async () => {
      localStorage.clear();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Unauthenticated.'
        })
      });

      await expect(restaurantOwnerApi.getOwnedRestaurants())
        .rejects.toThrow('You need to log in to access this feature.');
    });
  });

  describe('Token expiration handling', () => {
    it('should handle expired token gracefully', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'expired-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Token has expired'
        })
      });

      await expect(cartApi.getCart())
        .rejects.toThrow('You need to log in to access this feature.');
    });

    it('should handle invalid token format', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'invalid-token-format'
      }));

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          message: 'Invalid token format'
        })
      });

      await expect(cartApi.getCart())
        .rejects.toThrow('You need to log in to access this feature.');
    });
  });

  describe('Public routes (no authentication required)', () => {
    it('should access public restaurant list without token', async () => {
      localStorage.clear();

      const { restaurantApi } = await import('../../lib/api');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'Public Restaurant' }
        ])
      });

      await restaurantApi.getAll();

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/restaurants',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });

    it('should access restaurant details without token', async () => {
      localStorage.clear();

      const { restaurantApi } = await import('../../lib/api');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'Test Restaurant',
          menu: []
        })
      });

      await restaurantApi.getById(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/restaurants/1',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });
});