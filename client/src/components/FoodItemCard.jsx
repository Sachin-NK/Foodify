import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';

const FoodItemCard = ({ item, restaurant }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(item, restaurant.id, restaurant.name);
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden food-card">
        <div className="relative h-48">
          <img
            src={`https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=400&q=80`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-xl font-semibold font-sans mb-2">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-500">
              {formatPrice(item.price)}
            </span>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleAddToCart}
                className="bg-orange-500 hover:bg-orange-600 text-white button-bounce interactive-bounce"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FoodItemCard;
