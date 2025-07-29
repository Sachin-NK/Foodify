import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';

// Mock the API module
vi.mock('../../lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn()
  }
}));

// Test component that uses authentication
const AuthTestComponent = () => {
  const { user, login, logout, isAuthenticated, loading, error } = useAuth();

  const handleLogin = async () => {
    await login('test@example.com', 'password');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated() ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should handle successful login flow', async () => {
    const mockLoginResponse = {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        isAdmin: false,
        isRestaurantOwner: false
      },
      token: 'mock-token-123'
    };

    authApi.login.mockResolvedValueOnce(mockLoginResponse);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No user');

    // Click login button
    fireEvent.click(screen.getByTestId('login-btn'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    // Verify API was called
    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');

    // Verify localStorage was updated
    const storedUser = JSON.parse(localStorage.getItem('foodify-user'));
    expect(storedUser).toEqual({
      ...mockLoginResponse.user,
      token: mockLoginResponse.token
    });
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    authApi.login.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByTestId('login-btn'));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  it('should handle logout flow', async () => {
    // Set up authenticated user
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      token: 'mock-token-123'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockResolvedValueOnce({ user: mockUser });
    authApi.logout.mockResolvedValueOnce({ message: 'Logged out' });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for initial authentication check
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-btn'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    });

    // Verify localStorage was cleared
    expect(localStorage.getItem('foodify-user')).toBeNull();
  });

  it('should restore authentication from localStorage', async () => {
    const mockUser = {
      id: 1,
      name: 'Stored User',
      email: 'stored@example.com',
      token: 'stored-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockResolvedValueOnce({ user: mockUser });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Should restore authentication from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
    });

    // Should verify token with API
    expect(authApi.getUser).toHaveBeenCalled();
  });

  it('should clear invalid stored token', async () => {
    const mockUser = {
      id: 1,
      name: 'Invalid User',
      email: 'invalid@example.com',
      token: 'invalid-token'
    };

    localStorage.setItem('foodify-user', JSON.stringify(mockUser));
    authApi.getUser.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Should clear invalid token and show not authenticated
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    });

    // Should clear localStorage
    expect(localStorage.getItem('foodify-user')).toBeNull();
  });
});