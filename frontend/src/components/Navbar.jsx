import { Link, useLocation } from 'wouter';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Shield, MessageCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [location] = useLocation();
  const { getCartItemCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin, isRestaurantOwner } = useAuth();
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 theme-transition"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <motion.h1 
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="text-2xl font-bold text-orange-500 font-sans cursor-pointer"
              >
                Foodify
              </motion.h1>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`transition-colors button-bounce ${location === '/' ? 'text-orange-500 text-glow' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}>
                Home
              </a>
            </Link>
            <Link href="/browse">
              <a className={`transition-colors button-bounce ${location === '/browse' ? 'text-orange-500 text-glow' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}>
                Restaurants
              </a>
            </Link>
            {isAuthenticated() && (
              <Link href="/track-order">
                <a className={`transition-colors button-bounce ${location.startsWith('/track-order') ? 'text-orange-500 text-glow' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}>
                  Orders
                </a>
              </Link>
            )}
            {isRestaurantOwner() && (
              <Link href="/restaurant-register">
                <a className={`transition-colors button-bounce ${location.startsWith('/restaurant') ? 'text-orange-500 text-glow' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}>
                  My Restaurant
                </a>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="ghost" className="relative p-2 text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 button-bounce interactive-bounce">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white cart-badge">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {isAuthenticated() ? (
              <div className="flex items-center space-x-2">
                {isAdmin() && (
                  <Link href="/admin">
                    <Button variant="ghost" className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 button-bounce interactive-bounce">
                      <Shield className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {isRestaurantOwner() && (
                  <Link href="/restaurant-register">
                    <Button variant="ghost" className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 button-bounce interactive-bounce">
                      <Store className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="hidden md:block text-sm">{user.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 button-bounce interactive-bounce"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 button-bounce special-button">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden md:block">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
