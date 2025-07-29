import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';

const LoadingState = ({ 
  message = "Loading...", 
  size = "lg",
  showSpinner = true,
  className = ""
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {showSpinner && <LoadingSpinner size={size} />}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 dark:text-gray-400 text-center"
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

// Skeleton loading components for better perceived performance
export const RestaurantCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const RestaurantGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <RestaurantCardSkeleton key={index} />
    ))}
  </div>
);

export default LoadingState;