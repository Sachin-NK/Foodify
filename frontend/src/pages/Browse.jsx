import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/components/RestaurantCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { restaurantApi } from '@/lib/api';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  
  // Fetch restaurants from Laravel API
  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery, categoryFilter, ratingFilter, deliveryTimeFilter]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const params = {};
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      if (deliveryTimeFilter !== 'all') params.delivery_time = deliveryTimeFilter;
      
      const data = await restaurantApi.getAll(params);
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Button 
              onClick={fetchRestaurants}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800 dark:text-gray-100 theme-transition mb-4 md:mb-0">
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
          className="bg-gray-50 dark:bg-gray-800 theme-transition rounded-lg p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300 theme-transition" />
            <h3 className="text-lg font-semibold font-sans text-gray-800 dark:text-gray-100 theme-transition">Filter by:</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Indian">Indian</SelectItem>
                  <SelectItem value="Fast Food">Fast Food</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Pizza">Pizza</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Mexican">Mexican</SelectItem>
                  <SelectItem value="Sri Lankan">Sri Lankan</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="Desserts">Desserts</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition mb-2">Rating</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition mb-2">Delivery Time</label>
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
          {restaurants.map((restaurant, index) => (
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
        
        {restaurants.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
              <CardContent className="pt-6">
                <p className="text-gray-500 dark:text-gray-400 theme-transition text-lg">No restaurants found matching your criteria.</p>
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