/**
 * Authentication Context
 * Manages user authentication state, login/logout functionality,
 * and role-based access control for the application
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

// Create authentication context
const AuthContext = createContext();

/**
 * AuthProvider component - Provides authentication context to the app
 * Handles user session management, token validation, and auth state
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication on component mount
  // Load user from localStorage and verify token validity
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('foodify-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Verify token is still valid by fetching current user data
          if (userData.token) {
            try {
              const currentUser = await authApi.getUser();
              setUser({ ...currentUser.user, token: userData.token });
            } catch (error) {
              // Token is invalid, clear stored data
              console.warn('Stored token is invalid, clearing auth data:', error.message);
              localStorage.removeItem('foodify-user');
              setUser(null);
            }
          } else {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Don't set error state for initialization failures, just log them
        console.warn('Authentication initialization failed, continuing without auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('foodify-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foodify-user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(email, password);
      const userData = { ...response.user, token: response.token };
      setUser(userData);
      
      // Trigger a custom event to notify other components about login
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userData }));
      
      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, passwordConfirmation, role = 'customer') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(name, email, password, passwordConfirmation, role);
      const userData = { ...response.user, token: response.token };
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.token) {
        await authApi.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      setUser(null);
      localStorage.removeItem('foodify-user');
      localStorage.removeItem('foodify-cart');
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = () => {
    return user !== null && user.token;
  };

  const isAdmin = () => {
    return user?.isAdmin || false;
  };
  
  const isRestaurantOwner = () => {
    return user?.isRestaurantOwner || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      isRestaurantOwner,
      loading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
