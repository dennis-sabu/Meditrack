import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
// import { apiClient } from '../lib/api';
import { saveToken, deleteToken } from '../lib/secureStore';
import { AuthResponse } from '../lib/types';
import { LoginForm, SignupForm } from '../lib/validators';
import { demoUser, delay } from '../lib/demoData';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm): Promise<AuthResponse> => {
      // Simulate API call with delay
      await delay(1500);

      // Mock authentication - accept any email/password for demo
      if (data.email && data.password) {
        return {
          token: 'demo-jwt-token-' + Date.now(),
          user: demoUser,
        };
      } else {
        throw new Error('Invalid credentials');
      }

      // Real API call (commented out)
      // return apiClient.post<AuthResponse>('/auth/login', data);
    },
    onSuccess: async (response) => {
      await saveToken(response.token);
      queryClient.invalidateQueries();
      router.replace('/(tabs)/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm): Promise<AuthResponse> => {
      // Simulate API call with delay
      await delay(1500);

      // Mock signup - accept any valid data for demo
      const { confirmPassword, ...signupData } = data;
      if (signupData.email && signupData.password && signupData.fullName) {
        return {
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            ...demoUser,
            fullName: signupData.fullName,
            email: signupData.email,
          },
        };
      } else {
        throw new Error('Invalid signup data');
      }

      // Real API call (commented out)
      // return apiClient.post<AuthResponse>('/auth/signup', signupData);
    },
    onSuccess: async (response) => {
      await saveToken(response.token);
      queryClient.invalidateQueries();
      router.replace('/(tabs)/dashboard');
    },
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });

  const logout = async () => {
    await deleteToken();
    queryClient.clear();
    router.replace('/(auth)/login');
  };

  return {
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
};