import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Star, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const RestaurantCard = ({ restaurant }) => {
  const [, setLocation] = useLocation();
  
  const getRatingStars = (rating) => {
    const starRating = rating / 10; // Convert from 45 to 4.5
    return starRating.toFixed(1);
  };

  const handleViewMenu = () => {
    setLocation(`/restaurant/${restaurant.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      style={{ pointerEvents: 'auto' }}
    >
      <Card className="overflow-hidden restaurant-card" style={{ pointerEvents: 'auto' }}>
        <div className="relative h-48">
          <img
            src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=400&q=80`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-white text-gray-800">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {getRatingStars(restaurant.rating)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold font-sans">{restaurant.name}</h3>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {restaurant.location}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.tags?.map((tag, index) => (
              <Badge key={index} className="tag-badge text-white text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {restaurant.deliveryTime}
            </div>
            
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white relative z-10 cursor-pointer"
              onClick={handleViewMenu}
            >
              View Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RestaurantCard;
