import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { restaurantOwnerApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Edit, Trash2, Plus, ArrowLeft, DollarSign, Tag, Image, Check, X } from "lucide-react";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const [, navigate] = useLocation();
  const { user, isRestaurantOwner } = useAuth();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_vegetarian: false,
    is_spicy: false,
    is_available: true
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

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

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant data
        const restaurantResponse = await restaurantOwnerApi.getRestaurant(restaurantId);
        setRestaurant(restaurantResponse.data);
        
        // Fetch menu items
        const menuResponse = await restaurantOwnerApi.getMenuItems(restaurantId);
        setMenuItems(menuResponse.data);
        
        // Fetch categories
        const categoryResponse = await restaurantOwnerApi.getCategories(restaurantId);
        setCategories(categoryResponse.data);
        
        // Extract unique categories from menu items if no categories exist
        if (!categoryResponse.data || categoryResponse.data.length === 0) {
          const uniqueCategories = [...new Set(menuResponse.data.map(item => item.category))];
          setCategories(uniqueCategories.map(name => ({ name })));
        }
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

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId, toast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      is_vegetarian: false,
      is_spicy: false,
      is_available: true
    });
    setImagePreview(null);
    setCurrentItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      is_vegetarian: item.is_vegetarian,
      is_spicy: item.is_spicy,
      is_available: item.is_available
    });
    
    if (item.image) {
      setImagePreview(item.image.startsWith('http') ? item.image : `/storage/${item.image}`);
    } else {
      setImagePreview(null);
    }
    
    setShowEditDialog(true);
  };

  const openDeleteDialog = (item) => {
    setCurrentItem(item);
    setShowDeleteDialog(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Add image if it exists
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }
      
      const response = await restaurantOwnerApi.createMenuItem(restaurantId, formDataObj);
      
      // Add new item to the list
      setMenuItems(prev => [...prev, response.data]);
      
      // Close dialog and reset form
      setShowAddDialog(false);
      resetForm();
      
      toast({
        title: "Success!",
        description: "Menu item added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Add image if it exists and is a File object
      if (formData.image && typeof formData.image !== 'string') {
        formDataObj.append('image', formData.image);
      }
      
      const response = await restaurantOwnerApi.updateMenuItem(restaurantId, currentItem.id, formDataObj);
      
      // Update item in the list
      setMenuItems(prev => prev.map(item => 
        item.id === currentItem.id ? response.data : item
      ));
      
      // Close dialog and reset form
      setShowEditDialog(false);
      resetForm();
      
      toast({
        title: "Success!",
        description: "Menu item updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    setSaving(true);

    try {
      await restaurantOwnerApi.deleteMenuItem(restaurantId, currentItem.id);
      
      // Remove item from the list
      setMenuItems(prev => prev.filter(item => item.id !== currentItem.id));
      
      // Close dialog and reset form
      setShowDeleteDialog(false);
      resetForm();
      
      toast({
        title: "Success!",
        description: "Menu item deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await restaurantOwnerApi.toggleMenuItemAvailability(restaurantId, item.id);
      
      // Update item in the list
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, is_available: response.data.is_available } : menuItem
      ));
      
      toast({
        title: "Success!",
        description: `Item ${response.data.is_available ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate(`/restaurant-dashboard/${restaurantId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">{restaurant?.name} - Menu Management</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                <SelectItem key={index} value={category.name}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {filteredMenuItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-xl font-medium mb-2">No Menu Items Found</h2>
            <p className="text-gray-600 mb-4">
              {selectedCategory === "all" 
                ? "You haven't added any menu items yet." 
                : `No items found in the "${selectedCategory}" category.`}
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Menu Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map(item => (
            <Card key={item.id} className={!item.is_available ? "opacity-70" : ""}>
              <div className="relative">
                {item.image ? (
                  <img 
                    src={item.image.startsWith('http') ? item.image : `/storage/${item.image}`} 
                    alt={item.name} 
                    className="w-full h-48 object-cover rounded-t-lg" 
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white hover:bg-gray-100"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {!item.is_available && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="font-bold text-green-600">${parseFloat(item.price).toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{item.category}</span>
                  {item.is_vegetarian && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Vegetarian</span>
                  )}
                  {item.is_spicy && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Spicy</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex items-center">
                  <span className="text-sm mr-2">Available</span>
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={() => handleToggleAvailability(item)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                  Edit Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to your restaurant menu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((category, index) => (
                        <option key={index} value={category.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Item Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => handleSwitchChange('is_vegetarian', checked)}
                  />
                  <Label htmlFor="is_vegetarian">Vegetarian</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_spicy"
                    checked={formData.is_spicy}
                    onCheckedChange={(checked) => handleSwitchChange('is_spicy', checked)}
                  />
                  <Label htmlFor="is_spicy">Spicy</Label>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleSwitchChange('is_available', checked)}
                />
                <Label htmlFor="is_available">Available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <LoadingSpinner /> : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of your menu item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditItem}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="edit-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                      list="edit-categories"
                    />
                    <datalist id="edit-categories">
                      {categories.map((category, index) => (
                        <option key={index} value={category.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-image">Item Image</Label>
                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_vegetarian"
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => handleSwitchChange('is_vegetarian', checked)}
                  />
                  <Label htmlFor="edit-is_vegetarian">Vegetarian</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_spicy"
                    checked={formData.is_spicy}
                    onCheckedChange={(checked) => handleSwitchChange('is_spicy', checked)}
                  />
                  <Label htmlFor="edit-is_spicy">Spicy</Label>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleSwitchChange('is_available', checked)}
                />
                <Label htmlFor="edit-is_available">Available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <LoadingSpinner /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentItem && (
              <div className="flex items-center space-x-4">
                {currentItem.image ? (
                  <img 
                    src={currentItem.image.startsWith('http') ? currentItem.image : `/storage/${currentItem.image}`} 
                    alt={currentItem.name} 
                    className="w-16 h-16 object-cover rounded-md" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{currentItem.name}</h3>
                  <p className="text-sm text-gray-600">${parseFloat(currentItem.price).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteItem}
              disabled={saving}
            >
              {saving ? <LoadingSpinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantMenu;