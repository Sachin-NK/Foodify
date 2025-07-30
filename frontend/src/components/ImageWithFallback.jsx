import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

const ImageWithFallback = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className = '', 
  showPlaceholder = true,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Loading placeholder */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <motion.img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;