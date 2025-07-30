import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Clock, CreditCard, Smartphone, Banknote, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
  const [, setLocation] = useLocation();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    delivery_address: '',
    special_instructions: '',
    paymentMethod: 'cash'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.delivery_address) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Ensure cart is synced with backend before placing order
      console.log('Current cart items:', items);
      console.log('Cart total:', total);
      
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        special_instructions: formData.special_instructions
      };

      console.log('Placing order with data:', orderData);
      const response = await orderApi.placeOrder(orderData);
      console.log('Order response:', response);
      
      // Show success animation
      setOrderSuccess(true);
      setOrderNumber(response.order_number);
      
      // Wait for animation to complete before redirecting
      setTimeout(async () => {
        toast({
          title: "Order placed successfully!",
          description: `Your order #${response.order_number} has been confirmed.`,
        });
        
        await clearCart();
        setLocation(`/track-order/${response.order_number}`);
      }, 2000);
      
    } catch (error) {
      console.error('Order placement error:', error);
      
      let errorMessage = "There was an error placing your order. Please try again.";
      
      if (error.message) {
        if (error.message.includes('Cart is empty')) {
          errorMessage = "Your cart is empty. Please add items to your cart before placing an order.";
        } else if (error.message.includes('validation')) {
          errorMessage = "Please check all required fields and try again.";
        } else if (error.message.includes('authentication') || error.message.includes('Unauthenticated')) {
          errorMessage = "Please log in to place an order.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">Please log in to place an order</p>
              <Link href="/login">
                <Button className="bg-orange-500 hover:bg-orange-600 mr-4">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">
                  Register
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <Link href="/browse">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Browse Restaurants
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8 relative overflow-hidden">
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-center">Order Placed!</p>
              <p className="text-gray-600 text-center">Order #{orderNumber}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800">Checkout</h1>
          <Link href="/cart">
            <Button variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold font-sans mb-6">Delivery Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">Full Name *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        type="text"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email Address *</Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="customer_phone">Phone Number *</Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                    <Textarea
                      id="delivery_address"
                      name="delivery_address"
                      value={formData.delivery_address}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full delivery address"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleInputChange}
                      placeholder="Any special delivery instructions (optional)"
                      rows={2}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                    <RadioGroup 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center cursor-pointer">
                          <Banknote className="h-4 w-4 mr-2" />
                          Cash on Delivery
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex items-center cursor-pointer">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Online Banking
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold relative overflow-hidden"
                      disabled={isSubmitting || orderSuccess}
                    >
                      <AnimatePresence mode="wait">
                        {orderSuccess ? (
                          <motion.div
                            key="success"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center justify-center"
                          >
                            <CheckCircle className="h-6 w-6 mr-2" />
                            Order Placed!
                          </motion.div>
                        ) : isSubmitting ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center"
                          >
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing Order...
                          </motion.div>
                        ) : (
                          <motion.span
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Place Order
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {/* Success animation overlay */}
                      <AnimatePresence>
                        {orderSuccess && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 50, opacity: 0.3 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 bg-green-400 rounded-full"
                            style={{ transformOrigin: 'center' }}
                          />
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold font-sans mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">From: {item.restaurant}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-500">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-600">Estimated Delivery Time</span>
                  </div>
                  <p className="text-blue-600">25-35 minutes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
