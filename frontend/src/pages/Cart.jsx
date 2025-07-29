import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const { items, subtotal, deliveryFee, total, loading, error } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-red-500 text-lg">Failed to load cart. Please try again.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 theme-transition mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 theme-transition mb-2">Your Cart is Empty</h1>
              <p className="text-gray-600 dark:text-gray-300 theme-transition">Add some delicious food to get started!</p>
            </motion.div>
            
            <Link href="/browse">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 button-bounce special-button">
                Browse Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800 dark:text-gray-100 theme-transition">Your Cart</h1>
          <Link href="/browse">
            <Button variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 theme-transition button-bounce interactive-bounce">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
        
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold font-sans mb-6">
                Your Cart Items
              </h2>
              
              <div className="space-y-0">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CartItem item={item} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CardContent>
          
          {/* Cart Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 theme-transition p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(total)}</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <Link href="/checkout">
                <Button className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 special-button button-bounce">
                  Proceed to Checkout
                </Button>
              </Link>
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Cart;
