import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex items-center justify-between py-4 border-b slide-in-left"
    >
      <div className="flex items-center space-x-4">
        <img
          src={`https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=200&h=150&q=80`}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-gray-600">{formatPrice(item.price)} each</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            className="w-8 h-8 rounded-full p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <Button
            onClick={handleIncrease}
            className="w-8 h-8 rounded-full p-0 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-lg">{formatPrice(item.price * item.quantity)}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
