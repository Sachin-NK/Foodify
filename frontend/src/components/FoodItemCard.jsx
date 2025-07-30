import { motion } from 'framer-motion';
import { Plus, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { getConsistentFoodImage } from '../utils/foodImages';
import ImageWithFallback from './ImageWithFallback';

const FoodItemCard = ({ item, restaurant }) => {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart.",
        variant: "default",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="ml-2"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Button>
        ),
      });
      return;
    }

    try {
      // Prepare item data for optimistic update
      const itemData = {
        name: item.name,
        price: item.price,
        restaurant_id: restaurant?.id,
        restaurant_name: restaurant?.name,
        image_url: item.image_url || getConsistentFoodImage(item.name, item.category || restaurant?.cuisine)
      };
      
      await addToCart(item.id, 1, '', itemData);
      toast({
        title: "Added to cart!",
        description: `${item.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
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
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={item.image_url || getConsistentFoodImage(item.name, item.category || restaurant?.cuisine)}
            fallbackSrc={getConsistentFoodImage('default food', 'default')}
            alt={item.name}
            className="transition-transform duration-300 hover:scale-105"
          />
          {item.is_popular && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              Popular
            </div>
          )}
          {item.is_vegetarian && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              Veg
            </div>
          )}
          {item.discount && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
              {item.discount}% OFF
            </div>
          )}
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
