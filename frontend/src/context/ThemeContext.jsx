import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // Function to get system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Function to calculate effective theme
  const calculateEffectiveTheme = (currentTheme) => {
    if (currentTheme === 'system') {
      return getSystemPreference();
    }
    return currentTheme;
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('foodify-theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
      setEffectiveTheme(calculateEffectiveTheme(savedTheme));
    } else {
      // Default to system preference
      const systemTheme = getSystemPreference();
      setThemeState('system');
      setEffectiveTheme(systemTheme);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        if (theme === 'system') {
          setEffectiveTheme(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);

  // Apply theme to document root with performance optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    // Add theme-switching class for performance optimization
    root.classList.add('theme-switching');
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current effective theme class
    root.classList.add(effectiveTheme);
    
    // Update theme-color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', effectiveTheme === 'dark' ? '#050505' : '#ffffff');
    }
    
    // Remove theme-switching class after transition completes
    const timer = setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [effectiveTheme]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('foodify-theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
      setEffectiveTheme(calculateEffectiveTheme(newTheme));
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, toggle to opposite of current effective theme
      setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      effectiveTheme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};