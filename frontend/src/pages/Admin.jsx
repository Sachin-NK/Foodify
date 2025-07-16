import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: '',
    location: '',
    tags: '',
    deliveryTime: '',
    rating: 45
  });
  
  const [menuItemFormData, setMenuItemFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: ''
  });
  
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/restaurants'],
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery({
    queryKey: ['/api/menu-items'],
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (restaurantData) => {
      const response = await apiRequest('POST', '/api/restaurants', restaurantData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      toast({
        title: "Restaurant added successfully!",
        description: "The restaurant has been created and is now available.",
      });
      setRestaurantFormData({
        name: '',
        location: '',
        tags: '',
        deliveryTime: '',
        rating: 45
      });
    },
    onError: () => {
      toast({
        title: "Failed to add restaurant",
        description: "There was an error creating the restaurant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/restaurants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      toast({
        title: "Restaurant updated successfully!",
      });
      setEditingRestaurant(null);
    },
    onError: () => {
      toast({
        title: "Failed to update restaurant",
        variant: "destructive",
      });
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest('DELETE', `/api/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      toast({
        title: "Restaurant deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete restaurant",
        variant: "destructive",
      });
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (menuItemData) => {
      const response = await apiRequest('POST', '/api/menu-items', menuItemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Menu item added successfully!",
      });
      setMenuItemFormData({
        restaurantId: '',
        name: '',
        description: '',
        price: ''
      });
    },
    onError: () => {
      toast({
        title: "Failed to add menu item",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/menu-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Menu item updated successfully!",
      });
      setEditingMenuItem(null);
    },
    onError: () => {
      toast({
        title: "Failed to update menu item",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest('DELETE', `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Menu item deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  const handleRestaurantSubmit = (e) => {
    e.preventDefault();
    
    if (!restaurantFormData.name || !restaurantFormData.location || !restaurantFormData.tags || !restaurantFormData.deliveryTime) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = restaurantFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    createRestaurantMutation.mutate({
      ...restaurantFormData,
      tags: tagsArray,
      rating: parseInt(restaurantFormData.rating)
    });
  };

  const handleMenuItemSubmit = (e) => {
    e.preventDefault();
    
    if (!menuItemFormData.restaurantId || !menuItemFormData.name || !menuItemFormData.description || !menuItemFormData.price) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMenuItemMutation.mutate({
      ...menuItemFormData,
      restaurantId: parseInt(menuItemFormData.restaurantId),
      price: parseInt(menuItemFormData.price)
    });
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant({
      ...restaurant,
      tags: restaurant.tags?.join(', ') || ''
    });
  };

  const handleUpdateRestaurant = () => {
    const tagsArray = editingRestaurant.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    updateRestaurantMutation.mutate({
      id: editingRestaurant.id,
      data: {
        ...editingRestaurant,
        tags: tagsArray,
        rating: parseInt(editingRestaurant.rating)
      }
    });
  };

  const handleEditMenuItem = (menuItem) => {
    setEditingMenuItem(menuItem);
  };

  const handleUpdateMenuItem = () => {
    updateMenuItemMutation.mutate({
      id: editingMenuItem.id,
      data: {
        ...editingMenuItem,
        price: parseInt(editingMenuItem.price)
      }
    });
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getRatingStars = (rating) => {
    return (rating / 10).toFixed(1);
  };

  if (restaurantsLoading || menuItemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800">Admin Panel</h1>
          <Link href="/browse">
            <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Restaurant Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-sans">Add Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName">Restaurant Name *</Label>
                    <Input
                      id="restaurantName"
                      value={restaurantFormData.name}
                      onChange={(e) => setRestaurantFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="restaurantLocation">Location *</Label>
                    <Input
                      id="restaurantLocation"
                      value={restaurantFormData.location}
                      onChange={(e) => setRestaurantFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                      placeholder="Enter location"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="restaurantTags">Tags (comma-separated) *</Label>
                    <Input
                      id="restaurantTags"
                      value={restaurantFormData.tags}
                      onChange={(e) => setRestaurantFormData(prev => ({ ...prev, tags: e.target.value }))}
                      required
                      placeholder="e.g., Indian, Spicy, Curry"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryTime">Delivery Time *</Label>
                    <Input
                      id="deliveryTime"
                      value={restaurantFormData.deliveryTime}
                      onChange={(e) => setRestaurantFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      required
                      placeholder="e.g., 25-35 min"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rating">Rating (0-50)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="50"
                      value={restaurantFormData.rating}
                      onChange={(e) => setRestaurantFormData(prev => ({ ...prev, rating: e.target.value }))}
                      placeholder="45"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={createRestaurantMutation.isPending}
                  >
                    {createRestaurantMutation.isPending ? <LoadingSpinner size="sm" /> : 'Add Restaurant'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Add Menu Item Form */}
            <Card className="shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-2xl font-sans">Add Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="menuRestaurant">Restaurant *</Label>
                    <Select
                      value={menuItemFormData.restaurantId}
                      onValueChange={(value) => setMenuItemFormData(prev => ({ ...prev, restaurantId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants?.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={menuItemFormData.name}
                      onChange={(e) => setMenuItemFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter item name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="itemDescription">Description *</Label>
                    <Textarea
                      id="itemDescription"
                      value={menuItemFormData.description}
                      onChange={(e) => setMenuItemFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      placeholder="Enter description"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="itemPrice">Price (Rs.) *</Label>
                    <Input
                      id="itemPrice"
                      type="number"
                      value={menuItemFormData.price}
                      onChange={(e) => setMenuItemFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={createMenuItemMutation.isPending}
                  >
                    {createMenuItemMutation.isPending ? <LoadingSpinner size="sm" /> : 'Add Menu Item'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Current Restaurants */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-sans">Current Restaurants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants?.map((restaurant) => (
                    <div key={restaurant.id} className="border rounded-lg p-4">
                      {editingRestaurant?.id === restaurant.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              value={editingRestaurant.name}
                              onChange={(e) => setEditingRestaurant(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Restaurant name"
                            />
                            <Input
                              value={editingRestaurant.location}
                              onChange={(e) => setEditingRestaurant(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Location"
                            />
                          </div>
                          <Input
                            value={editingRestaurant.tags}
                            onChange={(e) => setEditingRestaurant(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Tags (comma-separated)"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              value={editingRestaurant.deliveryTime}
                              onChange={(e) => setEditingRestaurant(prev => ({ ...prev, deliveryTime: e.target.value }))}
                              placeholder="Delivery time"
                            />
                            <Input
                              type="number"
                              value={editingRestaurant.rating}
                              onChange={(e) => setEditingRestaurant(prev => ({ ...prev, rating: e.target.value }))}
                              placeholder="Rating"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={handleUpdateRestaurant}
                              className="bg-green-500 hover:bg-green-600"
                              disabled={updateRestaurantMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {updateRestaurantMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save'}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setEditingRestaurant(null)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRestaurant(restaurant)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRestaurantMutation.mutate(restaurant.id)}
                                className="text-red-600 hover:text-red-800"
                                disabled={deleteRestaurantMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">Location: {restaurant.location}</p>
                          <p className="text-gray-600 text-sm mb-2">Rating: {getRatingStars(restaurant.rating)} stars</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {restaurant.tags?.map((tag, index) => (
                              <Badge key={index} className="bg-orange-500 text-white text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            🕐 {restaurant.deliveryTime} delivery
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
