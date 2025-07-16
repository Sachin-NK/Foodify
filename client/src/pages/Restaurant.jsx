import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FoodItemCard from '@/components/FoodItemCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const Restaurant = () => {
  const { id } = useParams();
  
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['/api/restaurants', id],
  });

  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ['/api/restaurants', id, 'menu'],
    enabled: !!id,
  });

  const isLoading = restaurantLoading || menuLoading;
  const error = restaurantError || menuError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-red-500 text-lg">Failed to load restaurant. Please try again later.</p>
            <Link href="/browse">
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                Back to Restaurants
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRatingStars = (rating) => {
    const starRating = rating / 10;
    return starRating.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Restaurant Header */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&h=600&q=80"
          alt="Restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-6"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {restaurant.name.charAt(0)}
                  </span>
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-white font-sans">
                  {restaurant.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">
                      {getRatingStars(restaurant.rating)}
                    </span>
                  </div>
                  <span className="text-white">•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-white" />
                    <span className="text-white">{restaurant.location}</span>
                  </div>
                  <span className="text-white">•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-white" />
                    <span className="text-white">{restaurant.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold font-sans text-gray-800">Our Menu</h2>
            <p className="text-gray-600 mt-2">
              {restaurant.tags?.join(', ')} cuisine
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {restaurant.tags?.map((tag, index) => (
                <Badge key={index} className="tag-badge text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <Link href="/browse">
            <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Restaurants
            </Button>
          </Link>
        </motion.div>
        
        {/* Menu Items Grid */}
        {menuItems && menuItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FoodItemCard item={item} restaurant={restaurant} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-gray-500 text-lg">No menu items available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Restaurant;
