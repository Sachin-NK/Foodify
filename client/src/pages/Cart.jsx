import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { items, getCartTotal, getCartItemCount, restaurantName } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = 200;
  const serviceFee = 150;
  const total = subtotal + deliveryFee + serviceFee;

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
              <p className="text-gray-600">Add some delicious food to get started!</p>
            </motion.div>
            
            <Link href="/browse">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                Browse Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800">Your Cart</h1>
          <Link href="/browse">
            <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
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
                Items from {restaurantName}
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
          <div className="bg-gray-50 p-6 border-t">
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
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>{formatPrice(serviceFee)}</span>
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
                <Button className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 pulse-button">
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
