// Custom hook for handling async operations with loading, error states, and retry logic

import { useState, useCallback } from 'react';
import { handleAsyncError, withRetry } from '@/utils/errorHandling';
import type { ApiError } from '@/types';

interface UseAsyncOperationOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  userId?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useAsyncOperation = <T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const wrappedOperation = options.maxRetries 
        ? () => withRetry(operation, options.maxRetries, options.retryDelay)
        : operation;

      const result = await handleAsyncError(
        wrappedOperation,
        'async-operation',
        {
          showToast: options.showToast,
          logError: options.logError,
          fallbackMessage: options.fallbackMessage,
          userId: options.userId
        }
      );

      if (result.error) {
        setError(result.error);
        return null;
      }

      setData(result.data);
      return result.data;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// Specialized hooks for common operations
export const useAsyncQuery = <T = any>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  options: UseAsyncOperationOptions = {}
) => {
  const asyncOp = useAsyncOperation<T>(options);

  const refetch = useCallback(() => {
    return asyncOp.execute(queryFn);
  }, [asyncOp, queryFn]);

  return {
    ...asyncOp,
    refetch
  };
};

export const useAsyncMutation = <T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const asyncOp = useAsyncOperation<T>(options);

  const mutate = useCallback((params: P) => {
    return asyncOp.execute(() => mutationFn(params));
  }, [asyncOp, mutationFn]);

  return {
    ...asyncOp,
    mutate
  };
};