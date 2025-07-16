import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/components/RestaurantCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState('all');

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['/api/restaurants'],
  });

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    return restaurants.filter(restaurant => {
      // Search filter
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
                             restaurant.tags?.some(tag => tag.toLowerCase() === categoryFilter.toLowerCase());

      // Rating filter
      const matchesRating = ratingFilter === 'all' || 
                           (ratingFilter === '4.5' && restaurant.rating >= 45) ||
                           (ratingFilter === '4.0' && restaurant.rating >= 40) ||
                           (ratingFilter === '3.5' && restaurant.rating >= 35);

      // Delivery time filter
      const matchesDeliveryTime = deliveryTimeFilter === 'all' ||
                                 (deliveryTimeFilter === '20' && restaurant.deliveryTime.includes('15-20')) ||
                                 (deliveryTimeFilter === '30' && (restaurant.deliveryTime.includes('20-30') || restaurant.deliveryTime.includes('25-35'))) ||
                                 (deliveryTimeFilter === '45' && restaurant.deliveryTime.includes('30-40'));

      return matchesSearch && matchesCategory && matchesRating && matchesDeliveryTime;
    });
  }, [restaurants, searchQuery, categoryFilter, ratingFilter, deliveryTimeFilter]);

  if (isLoading) {
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
            <p className="text-red-500 text-lg">Failed to load restaurants. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800 mb-4 md:mb-0">
            Browse Restaurants
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 button-bounce focus:shadow-lg transition-all duration-300"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold font-sans">Filter by:</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="fast food">Fast Food</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="pizza">Pizza</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="sri lankan">Sri Lankan</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <Select value={deliveryTimeFilter} onValueChange={setDeliveryTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="20">Under 20 min</SelectItem>
                  <SelectItem value="30">Under 30 min</SelectItem>
                  <SelectItem value="45">Under 45 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setCategoryFilter('all');
                  setRatingFilter('all');
                  setDeliveryTimeFilter('all');
                  setSearchQuery('');
                }}
                variant="outline"
                className="w-full button-bounce interactive-bounce"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Restaurant Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>
        
        {filteredRestaurants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-gray-500 text-lg">No restaurants found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setCategoryFilter('all');
                    setRatingFilter('all');
                    setDeliveryTimeFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 button-bounce special-button"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Browse;
