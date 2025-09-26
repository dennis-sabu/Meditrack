import { useMutation } from '@tanstack/react-query';
// import { apiClient } from '../lib/api';
import { VerificationPin } from '../lib/types';
import { generateMockPin, delay } from '../lib/demoData';

export const useGeneratePin = () => {
  const generatePinMutation = useMutation({
    mutationFn: async (): Promise<VerificationPin> => {
      // Simulate API call with delay
      await delay(1200);

      // Generate mock PIN
      return generateMockPin();

      // Real API call (commented out)
      // return apiClient.post<VerificationPin>('/verify/generate-pin');
    },
    onError: (error) => {
      console.error('Generate PIN error:', error);
    },
  });

  return {
    generatePin: generatePinMutation.mutate,
    isGenerating: generatePinMutation.isPending,
    pin: generatePinMutation.data,
    error: generatePinMutation.error,
    reset: generatePinMutation.reset,
  };
};