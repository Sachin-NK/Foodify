import { useParams } from 'wouter';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { CheckCircle, Clock, Truck, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { orderApi } from '@/lib/api';

const TrackOrder = () => {
  const { id } = useParams(); // This is the order number
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const orderData = await orderApi.trackOrder(id);
        setOrder(orderData);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-red-500 text-lg mb-4">Order not found or failed to load</p>
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

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getStatusIcon = (status, isCompleted) => {
    const iconProps = {
      className: `h-6 w-6 ${isCompleted ? 'text-white' : 'text-white'}`
    };

    switch (status) {
      case 'pending':
        return <CheckCircle {...iconProps} />;
      case 'preparing':
        return <Package {...iconProps} />;
      case 'out_for_delivery':
        return <Truck {...iconProps} />;
      case 'delivered':
        return <Home {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getStatusColor = (status, isCompleted) => {
    if (isCompleted) return 'bg-green-500';
    if (status === 'preparing') return 'bg-orange-500';
    return 'bg-gray-300';
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
      default:
        return 'Pending';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', description: 'Order confirmed and sent to restaurant' },
    { key: 'preparing', label: 'Preparing', description: 'Restaurant is preparing your order' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', description: 'Order delivered to your address' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 theme-transition py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold font-sans text-gray-800 mb-4">Order Tracking</h1>
          <p className="text-gray-600">Track your order in real-time</p>
        </motion.div>
        
        {/* Order Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 bounce-animation">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-green-600 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your order has been successfully placed</p>
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-lg font-bold font-mono">{order.order_number}</p>
          </div>
        </motion.div>
        
        {/* Order Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h3 className="text-xl font-semibold font-sans mb-6">Order Progress</h3>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 w-0.5 h-full bg-gray-200"></div>
            <div 
              className="absolute left-6 top-0 w-0.5 progress-bar transition-all duration-500"
              style={{ height: `${(currentStatusIndex + 1) * 25}%` }}
            ></div>
            
            {/* Progress Steps */}
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${getStatusColor(step.key, isCompleted)}`}>
                      {getStatusIcon(step.key, isCompleted)}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-500' : 'text-gray-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {isCompleted && (
                        <p className="text-xs text-green-600 mt-1">
                          {index === 0 && 'Completed'}
                          {index === 1 && isCurrent && 'In Progress'}
                          {index > 1 && 'Estimated'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
        
        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h3 className="text-xl font-semibold font-sans mb-6">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Delivery Information</h4>
              <div className="text-gray-600">
                <p className="font-medium">{order.customer_name}</p>
                <p>{order.delivery_address}</p>
                <p className="mt-2">Phone: {order.customer_phone || 'N/A'}</p>
                <p className="text-sm mt-2">
                  Estimated Delivery: {order.estimated_delivery_time ? 
                    new Date(order.estimated_delivery_time).toLocaleTimeString() : 
                    '45 minutes'
                  }
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge className={`${
                    order.status === 'delivered' ? 'bg-green-500' :
                    order.status === 'out_for_delivery' ? 'bg-blue-500' :
                    order.status === 'preparing' ? 'bg-orange-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link href="/browse">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold">
                Order Again
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;
