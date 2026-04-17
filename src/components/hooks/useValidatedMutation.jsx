import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Enhanced mutation hook with automatic loading, error, and success states
 * Handles all error scenarios and provides consistent UX
 */
export function useValidatedMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Success',
    errorMessage = 'Something went wrong'
  } = options;

  return useMutation({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw new Error(error.message || errorMessage);
      }
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        toast.error(error.message || errorMessage);
      }
      onError?.(error, variables, context);
    }
  });
}