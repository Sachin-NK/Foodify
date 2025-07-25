import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const ThemeToggle = () => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const buttonRef = useRef(null);

  const iconVariants = {
    initial: { 
      scale: 0, 
      rotate: -180,
      opacity: 0 
    },
    animate: { 
      scale: 1, 
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { 
      scale: 0, 
      rotate: 180,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  // Performance optimization: Use will-change for smooth transitions
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.willChange = 'transform, opacity';
      
      // Clean up will-change after transition
      const timer = setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.willChange = 'auto';
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [effectiveTheme]);

  return (
    <div className="relative group">
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          onKeyDown={handleKeyDown}
          className="relative p-2 text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 theme-button-bounce theme-toggle-glow transition-colors duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          role="switch"
          tabIndex={0}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute"
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute"
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Subtle glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-md bg-orange-500/20 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 rounded-md bg-orange-500/30"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ 
              scale: 1.5, 
              opacity: [0, 0.5, 0],
              transition: { duration: 0.3 }
            }}
          />
        </Button>
      </motion.div>
      
      {/* Enhanced Tooltip with better accessibility */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
        initial={{ y: 5, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        role="tooltip"
        id="theme-toggle-tooltip"
      >
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
      </motion.div>
      
      {/* Screen reader only text for better accessibility */}
      <span className="sr-only">
        Current theme: {isDark ? 'dark' : 'light'} mode. Press Enter or Space to toggle.
      </span>
    </div>
  );
};

export default ThemeToggle;