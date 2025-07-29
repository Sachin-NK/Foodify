import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, cartApi, restaurantOwnerApi } from '../../lib/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('Authentication Requirements Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  describe('Requirement 4.1: Authentication flow with proper token management', () => {
    it('should authenticate users and provide access tokens', async () => {
      const mockLoginResponse = {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        token: 'auth-token-123'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLoginResponse)
      });

      const result = await authApi.login('test@example.com', 'password');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should include authentication tokens in subsequent requests', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'valid-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: {} })
      });

      await authApi.getUser();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          })
        })
      );
    });
  });

  describe('Requirement 4.2: Protected routes work correctly with authentication', () => {
    it('should allow access to protected routes with valid token', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'valid-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] })
      });

      await cartApi.getCart();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          })
        })
      );
    });

    it('should deny access to protected routes without token', async () => {
      localStorage.clear();

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthenticated' })
      });

      await expect(cartApi.getCart())
        .rejects.toThrow('You need to log in to access this feature.');
    });

    it('should handle restaurant owner protected routes', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'owner-token',
        isRestaurantOwner: true
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ restaurants: [] })
      });

      await restaurantOwnerApi.getOwnedRestaurants();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/restaurants/owned'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer owner-token'
          })
        })
      );
    });
  });

  describe('Requirement 5.3: API communication issues are resolved', () => {
    it('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(authApi.login('test@example.com', 'password'))
        .rejects.toThrow('Unable to connect to the server. Please check your internet connection and try again.');
    });

    it('should handle server errors with appropriate messages', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
      });

      await expect(authApi.login('test@example.com', 'password'))
        .rejects.toThrow('Server error. Please try again later.');
    });

    it('should handle validation errors properly', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({
          message: 'Validation failed',
          errors: { email: ['Invalid email format'] }
        })
      });

      await expect(authApi.login('invalid-email', 'password'))
        .rejects.toThrow('Please check your input and try again.');
    });
  });

  describe('Requirement 5.4: Authentication-related API communication works correctly', () => {
    it('should register users successfully', async () => {
      const mockResponse = {
        user: { id: 1, name: 'New User', email: 'new@example.com' },
        token: 'new-token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authApi.register('New User', 'new@example.com', 'password', 'password');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'New User',
            email: 'new@example.com',
            password: 'password',
            password_confirmation: 'password',
            role: 'customer'
          })
        })
      );
    });

    it('should logout users successfully', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'valid-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Logged out successfully' })
      });

      const result = await authApi.logout();

      expect(result).toHaveProperty('message');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/logout'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          })
        })
      );
    });

    it('should handle token expiration gracefully', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'expired-token'
      }));

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Token expired' })
      });

      await expect(authApi.getUser())
        .rejects.toThrow('You need to log in to access this feature.');
    });
  });

  describe('Token Management', () => {
    it('should not include Authorization header for public routes', async () => {
      localStorage.clear();

      const { restaurantApi } = await import('../../lib/api');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await restaurantApi.getAll();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });

    it('should handle malformed tokens gracefully', async () => {
      localStorage.setItem('foodify-user', JSON.stringify({
        id: 1,
        token: 'malformed.token.here'
      }));

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid token' })
      });

      await expect(authApi.getUser())
        .rejects.toThrow('You need to log in to access this feature.');
    });
  });
});