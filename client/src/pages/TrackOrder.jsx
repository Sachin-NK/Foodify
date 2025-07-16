import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { CheckCircle, Clock, Truck, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';

const TrackOrder = () => {
  const { id } = useParams();
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['/api/orders', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white py-8">
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
    <div className="min-h-screen bg-white py-8">
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
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-lg font-bold font-mono">#{order.id.toString().padStart(6, '0')}</p>
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
              <h4 className="font-semibold mb-3">Delivery Address</h4>
              <div className="text-gray-600">
                <p className="font-medium">{order.customerInfo.name}</p>
                <p>{order.customerInfo.address}</p>
                <p className="mt-2">Phone: {order.customerInfo.phone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Items Ordered</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name || `Item ${item.menuItemId}`} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
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
