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
      toast({
        title: "Access Denied",
        description: "You need to register as a restaurant owner to access this page. Please create a new account with restaurant owner role.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    // Check if user already has a restaurant
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantOwnerApi.getUserRestaurant();
        const restaurant = response.data;
        
        // If user has a restaurant, redirect to dashboard
        if (restaurant) {
          navigate(`/restaurant-dashboard/${restaurant.id}`);
          return;
        }
        
        // No restaurant found, show registration form
        setExistingRestaurants([]);
        setShowRegistrationForm(true);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        // For any error, assume no restaurant and show registration form
        // The backend will handle validation when they try to register
        setExistingRestaurants([]);
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
      
      // Add tags as array
      if (finalData.tags) {
        const tagsArray = finalData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tagsArray.length > 0) {
          tagsArray.forEach((tag, index) => {
            formDataObj.append(`tags[${index}]`, tag);
          });
        } else {
          // If no valid tags, add the original string as a single tag
          formDataObj.append('tags[0]', finalData.tags.trim());
        }
      }
      
      // Add files if they exist
      if (finalData.logo && finalData.logo.length > 0) {
        formDataObj.append('logo', finalData.logo[0]);
      }
      
      if (finalData.cover_image && finalData.cover_image.length > 0) {
        formDataObj.append('cover_image', finalData.cover_image[0]);
      }
      
      // FormData is ready for submission
      
      // Validate required fields before sending
      const requiredFields = ['name', 'location', 'description', 'tags', 'delivery_time', 'address', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !finalData[field] || finalData[field].trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await restaurantOwnerApi.createRestaurant(formDataObj);
      
      toast({
        title: "Success!",
        description: "Your restaurant has been registered successfully.",
      });
      
      // Navigate to the restaurant management page
      navigate(`/restaurant-dashboard/${response.data.id}`);
    } catch (error) {
      console.error('Restaurant registration error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = "Error: Please check your input and try again.";
      
      // Check if this is actually a success response that was mishandled
      if (error.status === 201) {
        // This was actually a successful creation, treat it as success
        toast({
          title: "Success!",
          description: "Your restaurant has been registered successfully.",
        });
        // Navigate to dashboard if we have the restaurant data
        if (error.data && error.data.id) {
          navigate(`/restaurant-dashboard/${error.data.id}`);
        }
        return;
      }
      
      if (error.data && error.data.errors) {
        // Handle validation errors
        const errorMessages = [];
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          errorMessages.push(`${field}: ${messages.join(', ')}`);
        });
        errorMessage = errorMessages.join('\n');
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error in console for debugging
      console.error('Final error message:', errorMessage);
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
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

  // If user has a restaurant, redirect to dashboard (this should not happen due to auto-redirect)
  if (!showRegistrationForm && existingRestaurants.length > 0) {
    // This is a fallback - the useEffect should have already redirected
    navigate(`/restaurant-dashboard/${existingRestaurants[0].id}`);
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }




  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl min-h-screen bg-white dark:bg-gray-900 theme-transition">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 theme-transition">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Register Your Restaurant</CardTitle>
              <CardDescription>
                Join our platform and start serving customers online. Each account can register one restaurant.
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

      <style>{`
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