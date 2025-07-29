import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authApi } from '../../lib/api';

// Mock the API
vi.mock('../../lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn()
  }
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.name : 'No user'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{auth.error || 'No error'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated() ? 'Authenticated' : 'Not authenticated'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial state with no user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });
  });

  it('should load user from localStorage on initialization', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      token: 'test-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    
    // Mock successful user verification
    authApi.getUser.mockResolvedValueOnce({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(authApi.getUser).toHaveBeenCalled();
  });

  it('should clear invalid token from localStorage', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      token: 'invalid-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    
    // Mock failed user verification (invalid token)
    authApi.getUser.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });

    expect(localStorage.getItem('foodify-user')).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      },
      token: 'new-token'
    };

    authApi.login.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(JSON.parse(localStorage.getItem('foodify-user'))).toEqual({
      ...mockResponse.user,
      token: mockResponse.token
    });
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    authApi.login.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });
  });

  it('should handle successful logout', async () => {
    // Set up authenticated user
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      token: 'test-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockResolvedValueOnce({ user: mockUser });
    authApi.logout.mockResolvedValueOnce({ message: 'Logged out' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(localStorage.getItem('foodify-user')).toBeNull();
  });

  it('should handle logout even when API call fails', async () => {
    // Set up authenticated user
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      token: 'test-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockResolvedValueOnce({ user: mockUser });
    authApi.logout.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });

    expect(localStorage.getItem('foodify-user')).toBeNull();
  });

  it('should determine user roles correctly', async () => {
    const TestRoleComponent = () => {
      const auth = useAuth();
      return (
        <div>
          <div data-testid="is-admin">{auth.isAdmin() ? 'Admin' : 'Not admin'}</div>
          <div data-testid="is-restaurant-owner">{auth.isRestaurantOwner() ? 'Restaurant owner' : 'Not restaurant owner'}</div>
        </div>
      );
    };

    const mockUser = {
      id: 1,
      name: 'Restaurant Owner',
      email: 'owner@example.com',
      token: 'test-token',
      isAdmin: false,
      isRestaurantOwner: true
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockResolvedValueOnce({ user: mockUser });

    render(
      <AuthProvider>
        <TestRoleComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('Not admin');
      expect(screen.getByTestId('is-restaurant-owner')).toHaveTextContent('Restaurant owner');
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const TestComponentOutsideProvider = () => {
      useAuth();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});