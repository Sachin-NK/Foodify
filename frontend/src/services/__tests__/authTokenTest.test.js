import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authApi } from '../../lib/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('Token-Based Authentication Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should login successfully and include token in subsequent requests', async () => {
    // Mock successful login response
    const mockLoginResponse = {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        isAdmin: false,
        isRestaurantOwner: false
      },
      token: 'test-auth-token-123',
      message: 'Login successful'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse)
    });

    const result = await authApi.login('test@example.com', 'password');

    expect(result).toEqual(mockLoginResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      })
    );
  });

  it('should include Authorization header when token is available', async () => {
    // Set up user with token in localStorage
    localStorage.setItem('foodify-user', JSON.stringify({
      id: 1,
      name: 'Test User',
      token: 'test-token-123'
    }));

    // Mock successful user response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      })
    });

    await authApi.getUser();

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123'
        })
      })
    );
  });

  it('should not include Authorization header when no token is available', async () => {
    localStorage.clear();

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthenticated' })
    });

    try {
      await authApi.getUser();
    } catch (error) {
      // Expected to fail
    }

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/user',
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'Authorization': expect.any(String)
        })
      })
    );
  });

  it('should handle 401 unauthorized responses correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        message: 'Unauthenticated.'
      })
    });

    await expect(authApi.getUser())
      .rejects.toThrow('You need to log in to access this feature.');
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetch.mockRejectedValueOnce(networkError);

    await expect(authApi.login('test@example.com', 'password'))
      .rejects.toThrow('Unable to connect to the server. Please check your internet connection and try again.');
  });

  it('should handle server errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        message: 'Internal server error'
      })
    });

    await expect(authApi.login('test@example.com', 'password'))
      .rejects.toThrow('Server error. Please try again later.');
  });

  it('should logout successfully', async () => {
    // Set up authenticated user
    localStorage.setItem('foodify-user', JSON.stringify({
      id: 1,
      token: 'valid-token'
    }));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        message: 'Logged out successfully'
      })
    });

    const result = await authApi.logout();

    expect(result).toEqual({
      message: 'Logged out successfully'
    });
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-token'
        })
      })
    );
  });

  it('should register successfully', async () => {
    const mockResponse = {
      user: {
        id: 1,
        name: 'New User',
        email: 'newuser@example.com',
        role: 'customer',
        isAdmin: false,
        isRestaurantOwner: false
      },
      token: 'new-user-token',
      message: 'Registration successful'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await authApi.register(
      'New User',
      'newuser@example.com',
      'password123',
      'password123'
    );

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          role: 'customer'
        })
      })
    );
  });
});