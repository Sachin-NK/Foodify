import { useState, useCallback } from 'react';

export const useApiError = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error) => {
    console.error('API Error:', error);
    setError({
      message: error.message || 'An unexpected error occurred',
      status: error.status,
      data: error.data,
      canRetry: !error.status || error.status >= 500 || error.status === 429
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn) => {
    if (!retryFn) return;
    
    setIsRetrying(true);
    try {
      await retryFn();
      clearError();
    } catch (error) {
      handleError(error);
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
};