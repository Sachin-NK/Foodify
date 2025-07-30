import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Clock, MapPin, Phone, Mail, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return `Rs. ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">{error}</p>
              <Button onClick={fetchOrders} className="bg-orange-500 hover:bg-orange-600">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800 dark:text-white mb-2">
            Your Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage your food delivery orders
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 text-center">
              <CardContent>
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-500 text-lg mb-6">
                  You haven't placed any orders yet. Start exploring restaurants!
                </p>
                <Link href="/browse">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Browse Restaurants
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Order #{order.order_number}
                        </CardTitle>
                        <p className="text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items && order.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                  {item.special_instructions && (
                                    <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                      {item.special_instructions}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>{formatPrice(order.delivery_fee)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-orange-500">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delivery Information */}
                      <div>
                        <h4 className="font-semibold mb-3">Delivery Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                            <div>
                              <p className="font-medium">Delivery Address</p>
                              <p className="text-sm text-gray-600">{order.delivery_address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Phone</p>
                              <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-gray-600">{order.customer_email}</p>
                            </div>
                          </div>
                          
                          {order.special_instructions && (
                            <div>
                              <p className="font-medium">Special Instructions</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {order.special_instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Link href={`/track-order/${order.order_number}`}>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Track Order
                        </Button>
                      </Link>
                      
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            // TODO: Implement reorder functionality
                            toast({
                              title: "Reorder",
                              description: "Reorder functionality coming soon!",
                            });
                          }}
                        >
                          <Package className="h-4 w-4" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;