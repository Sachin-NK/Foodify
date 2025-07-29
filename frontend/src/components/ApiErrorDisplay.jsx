import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ApiErrorDisplay = ({ 
  error, 
  onRetry, 
  isRetrying = false, 
  showRetry = true,
  className = "" 
}) => {
  if (!error) return null;

  const getErrorIcon = () => {
    if (error.status === 0 || error.message.includes('network')) {
      return <WifiOff className="h-8 w-8 text-red-500" />;
    }
    return <AlertCircle className="h-8 w-8 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (error.status === 0 || error.message.includes('network')) {
      return 'Connection Problem';
    }
    if (error.status >= 500) {
      return 'Server Error';
    }
    if (error.status === 404) {
      return 'Not Found';
    }
    return 'Error';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          {getErrorIcon()}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {getErrorTitle()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {error.message}
            </p>
          </div>

          {showRetry && error.canRetry && onRetry && (
            <Button 
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}

          {error.status === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <Wifi className="h-4 w-4 inline mr-1" />
              Check your internet connection
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiErrorDisplay;