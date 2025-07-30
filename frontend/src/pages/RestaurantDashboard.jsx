import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { restaurantOwnerApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Edit, Trash2, Plus, Store, Menu, Settings, Clock, Tag, Phone, Mail, MapPin, Image, Eye, ShoppingBag, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const RestaurantDashboard = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isRestaurantOwner } = useAuth();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Redirect if not logged in or not a restaurant owner
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!isRestaurantOwner()) {
      navigate("/");
      return;
    }
  }, [user, isRestaurantOwner, navigate]);

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantOwnerApi.getRestaurant(id);
        setRestaurant(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description,
          location: response.data.location,
          phone: response.data.phone,
          email: response.data.email,
          address: response.data.address,
          tags: response.data.tags ? response.data.tags.join(", ") : "",
          delivery_time: response.data.delivery_time,
          is_active: response.data.is_active
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load restaurant data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id, toast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        cover_image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'logo' && key !== 'cover_image' && formData[key] !== undefined) {
          if (key === 'tags' && typeof formData[key] === 'string') {
            formDataObj.append('tags', JSON.stringify(formData[key].split(',').map(tag => tag.trim())));
          } else {
            formDataObj.append(key, formData[key]);
          }
        }
      });
      
      // Add files if they exist
      if (formData.logo && typeof formData.logo !== 'string') {
        formDataObj.append('logo', formData.logo);
      }
      
      if (formData.cover_image && typeof formData.cover_image !== 'string') {
        formDataObj.append('cover_image', formData.cover_image);
      }
      
      const response = await restaurantOwnerApi.updateRestaurant(id, formDataObj);
      
      setRestaurant(response.data);
      setEditMode(false);
      
      toast({
        title: "Success!",
        description: "Restaurant information updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !restaurant.is_active;
      
      // Create FormData object
      const formDataObj = new FormData();
      formDataObj.append('is_active', newStatus);
      
      const response = await restaurantOwnerApi.updateRestaurant(id, formDataObj);
      
      setRestaurant(response.data);
      setFormData(prev => ({
        ...prev,
        is_active: newStatus
      }));
      
      toast({
        title: "Success!",
        description: `Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigateToMenuManagement = () => {
    navigate(`/restaurant-menu/${id}`);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await restaurantOwnerApi.getRestaurantOrders(id);
      setOrders(response.orders || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await restaurantOwnerApi.updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast({
        title: "Success!",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'out_for_delivery': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Clock className="h-4 w-4" />;
      case 'out_for_delivery': return <ShoppingBag className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!window.confirm('Are you sure you want to delete your restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      await restaurantOwnerApi.deleteRestaurant(id);
      
      toast({
        title: "Success!",
        description: "Restaurant deleted successfully.",
      });
      
      // Redirect to registration page since they no longer have a restaurant
      navigate("/restaurant-register");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete restaurant. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-white dark:bg-gray-900 theme-transition">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 theme-transition">{restaurant?.name || 'Restaurant Dashboard'}</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition">
              {restaurant?.is_active ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={restaurant?.is_active}
              onCheckedChange={handleToggleStatus}
            />
          </div>
          <Button onClick={() => navigate(`/restaurant/${id}`)} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Public Page
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <Store className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" onClick={fetchOrders}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="menu" onClick={navigateToMenuManagement}>
            <Menu className="h-4 w-4 mr-2" />
            Menu Management
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Restaurant Information</CardTitle>
                  <CardDescription>Manage your restaurant details</CardDescription>
                </div>
                <Button 
                  variant={editMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel" : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            id="location"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="delivery_time">Delivery Time</Label>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            id="delivery_time"
                            name="delivery_time"
                            value={formData.delivery_time || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., 30-45 min"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Cuisine Types (comma separated)</Label>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          id="tags"
                          name="tags"
                          value={formData.tags || ''}
                          onChange={handleInputChange}
                          placeholder="Italian, Pizza, Fast Food"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo">Restaurant Logo</Label>
                      <Input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Preview:</p>
                          <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-md" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cover_image">Cover Image</Label>
                      <Input
                        id="cover_image"
                        name="cover_image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                      {coverPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Preview:</p>
                          <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded-md" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? <LoadingSpinner /> : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-gray-600">{restaurant?.description || 'No description provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Location</h3>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-600">{restaurant?.location || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Delivery Time</h3>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-600">{restaurant?.delivery_time || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Cuisine Types</h3>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-600">
                          {restaurant?.tags && restaurant.tags.length > 0 
                            ? restaurant.tags.join(', ') 
                            : 'No cuisine types specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Address</h3>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-600">{restaurant?.address || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Phone</h3>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-600">{restaurant?.phone || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Email</h3>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-600">{restaurant?.email || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Logo</h3>
                        {restaurant?.logo ? (
                          <img 
                            src={restaurant.logo.startsWith('http') 
                              ? restaurant.logo 
                              : `/storage/${restaurant.logo}`} 
                            alt="Restaurant logo" 
                            className="w-32 h-32 object-cover rounded-md mt-2" 
                          />
                        ) : (
                          <p className="text-gray-600">No logo uploaded</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Cover Image</h3>
                        {restaurant?.cover_image ? (
                          <img 
                            src={restaurant.cover_image.startsWith('http') 
                              ? restaurant.cover_image 
                              : `/storage/${restaurant.cover_image}`} 
                            alt="Restaurant cover" 
                            className="w-full h-32 object-cover rounded-md mt-2" 
                          />
                        ) : (
                          <p className="text-gray-600">No cover image uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-100 theme-transition">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 theme-transition">Manage your restaurant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={navigateToMenuManagement}>
                  <Menu className="h-4 w-4 mr-2" />
                  Manage Menu
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => navigate(`/restaurant-categories/${id}`)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 theme-transition">Restaurant Status</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 theme-transition">
                      {restaurant?.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={restaurant?.is_active}
                      onCheckedChange={handleToggleStatus}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 theme-transition">
                    {restaurant?.is_active 
                      ? 'Your restaurant is visible to customers' 
                      : 'Your restaurant is hidden from customers'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-100 theme-transition">Restaurant Orders</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 theme-transition">Manage incoming orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No orders yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Orders from customers will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                            <CardDescription>
                              {order.customer_name} • {order.customer_phone}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Delivery Address</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Order Details</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total: Rs. {order.restaurant_subtotal}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ordered: {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>Rs. {item.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {order.special_instructions && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Special Instructions</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.special_instructions}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Confirm Order
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              >
                                Cancel Order
                              </Button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'preparing')}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Ready for Delivery
                            </Button>
                          )}
                          {order.status === 'out_for_delivery' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="menu">
          {/* Menu content is handled by navigating to a different page */}
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">Menu Management</h2>
            <p className="text-gray-600 mb-4">Redirecting to menu management...</p>
            <LoadingSpinner />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-100 theme-transition">Restaurant Settings</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 theme-transition">Manage your restaurant settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 theme-transition">Danger Zone</h3>
                  <p className="text-gray-600 dark:text-gray-400 theme-transition">These actions cannot be undone</p>
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  onClick={handleDeleteRestaurant}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Restaurant
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboard;