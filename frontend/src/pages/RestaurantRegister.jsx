import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { restaurantOwnerApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Store, Plus, Settings, Eye } from "lucide-react";

const RestaurantRegister = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { toast } = useToast();
  const { user, isRestaurantOwner } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [formData, setFormData] = useState({});
  const [existingRestaurants, setExistingRestaurants] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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

    // Check if user already has restaurants
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantOwnerApi.getOwnedRestaurants();
        setExistingRestaurants(response.data || []);
        setShowRegistrationForm(response.data.length === 0);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setShowRegistrationForm(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [user, isRestaurantOwner, navigate]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    }
  };

  const handleNextStep = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data) => {
    const finalData = { ...formData, ...data };
    setLoading(true);

    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all text fields
      Object.keys(finalData).forEach(key => {
        if (key !== 'logo' && key !== 'cover_image' && finalData[key] !== undefined) {
          formDataObj.append(key, finalData[key]);
        }
      });
      
      // Add tags as JSON string
      if (finalData.tags) {
        formDataObj.append('tags', JSON.stringify(finalData.tags.split(',').map(tag => tag.trim())));
      }
      
      // Add files if they exist
      if (finalData.logo && finalData.logo.length > 0) {
        formDataObj.append('logo', finalData.logo[0]);
      }
      
      if (finalData.cover_image && finalData.cover_image.length > 0) {
        formDataObj.append('cover_image', finalData.cover_image[0]);
      }
      
      const response = await restaurantOwnerApi.createRestaurant(formDataObj);
      
      toast({
        title: "Success!",
        description: "Your restaurant has been registered successfully.",
      });
      
      // Navigate to the restaurant management page
      navigate(`/restaurant-dashboard/${response.data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to register restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show existing restaurants dashboard if user has restaurants
  if (!showRegistrationForm && existingRestaurants.length > 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Restaurants</h1>
            <p className="text-gray-600">Manage your restaurants and menus</p>
          </div>
          <Button onClick={() => setShowRegistrationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Restaurant
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {existingRestaurants.map(restaurant => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                {restaurant.cover_image ? (
                  <img 
                    src={restaurant.cover_image.startsWith('http') 
                      ? restaurant.cover_image 
                      : `/storage/${restaurant.cover_image}`} 
                    alt={restaurant.name} 
                    className="w-full h-48 object-cover rounded-t-lg" 
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <Store className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo.startsWith('http') 
                        ? restaurant.logo 
                        : `/storage/${restaurant.logo}`} 
                      alt={`${restaurant.name} logo`} 
                      className="w-8 h-8 object-cover rounded-full mr-2" 
                    />
                  ) : (
                    <Store className="h-8 w-8 text-gray-400 mr-2" />
                  )}
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{restaurant.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {restaurant.tags && restaurant.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {restaurant.tags && restaurant.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{restaurant.tags.length - 3} more</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/restaurant-dashboard/${restaurant.id}`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Register Your Restaurant</CardTitle>
              <CardDescription>
                Join our platform and start serving customers online
              </CardDescription>
            </div>
            {existingRestaurants.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowRegistrationForm(false)}
              >
                Back to My Restaurants
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
              <div className={`step-number ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
              <div className="step-label">Basic Info</div>
            </div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
              <div className={`step-number ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
              <div className="step-label">Contact Details</div>
            </div>
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
              <div className={`step-number ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
              <div className="step-label">Images & Finish</div>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit(handleNextStep)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter restaurant name"
                  {...register("name", { required: "Restaurant name is required" })}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your restaurant"
                  rows={4}
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  {...register("location", { required: "Location is required" })}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Cuisine Types (comma separated) *</Label>
                <Input
                  id="tags"
                  placeholder="Italian, Pizza, Fast Food"
                  {...register("tags", { required: "At least one cuisine type is required" })}
                />
                {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_time">Estimated Delivery Time *</Label>
                <Input
                  id="delivery_time"
                  placeholder="e.g., 30-45 min"
                  {...register("delivery_time", { required: "Delivery time is required" })}
                />
                {errors.delivery_time && <p className="text-red-500 text-sm">{errors.delivery_time.message}</p>}
              </div>

              <div className="flex justify-end">
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleNextStep)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  rows={3}
                  {...register("address", { required: "Address is required" })}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  {...register("phone", { 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Please enter a valid phone number"
                    }
                  })}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Restaurant Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="restaurant@example.com"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>Previous</Button>
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Restaurant Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  {...register("logo")}
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
                  type="file"
                  accept="image/*"
                  {...register("cover_image")}
                  onChange={handleCoverChange}
                />
                {coverPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded-md" />
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Registration Summary</h3>
                <p><span className="font-medium">Restaurant Name:</span> {formData.name}</p>
                <p><span className="font-medium">Location:</span> {formData.location}</p>
                <p><span className="font-medium">Cuisine Types:</span> {formData.tags}</p>
                <p><span className="font-medium">Delivery Time:</span> {formData.delivery_time}</p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>Previous</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner /> : "Register Restaurant"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-gray-500">
            * Required fields
          </p>
          <p className="text-sm text-gray-500 mt-1">
            By registering your restaurant, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>

      <style jsx>{`
        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100px;
        }
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .step-label {
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default RestaurantRegister;