
'use client';

import { useState } from 'react';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface UserData {
  username: string;
  email: string;
  isNewUser: boolean;
}

interface AuthComponentProps {
  onAuthSuccess?: (userData: UserData) => void;
}

export default function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const prefersReducedMotion = useReducedMotion();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle authentication logic here
      console.log(isLogin ? 'Login' : 'Sign Up', formData);
      
      if (onAuthSuccess) {
        onAuthSuccess({
          username: formData.username,
          email: formData.email,
          isNewUser: !isLogin
        });
      }
      toast.success(isLogin ? 'Logged in successfully' : 'Account created successfully');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          {isLogin ? 'Welcome Back' : 'Join Medilink'}
        </h1>
        <p className="text-gray-600">
          {isLogin ? 'Log in to your account' : 'Create your account today'}
        </p>
      </div>

      {/* Auth Card */}
      <motion.div
        layout
        transition={{
          type: prefersReducedMotion ? 'tween' : 'spring',
          stiffness: 160,
          damping: 26,
          mass: 1,
          duration: prefersReducedMotion ? 0.35 : undefined,
        }}
        className="rounded-2xl shadow-xl p-8 border overflow-hidden bg-white/80 backdrop-blur-md border-white/40"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field - Only for Sign Up */}
          <AnimatePresence initial={false} mode="wait">
            {!isLogin && (
              <motion.div
                key="username-field"
                initial={{ opacity: 0, x: -6, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -6, height: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeInOut' }}
                className="space-y-2 overflow-hidden"
              >
                <label htmlFor="username" className="text-sm font-medium text-gray-800 block">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white text-black placeholder:text-gray-400"
                    placeholder="Choose a username"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field - Always visible (Login + Sign Up) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-800 block">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white text-black placeholder:text-gray-400"
                placeholder={isLogin ? 'Enter your email' : 'Enter your email address'}
                autoComplete={isLogin ? 'email' : 'new-email'}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-800 block">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white text-black placeholder:text-gray-400"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors duration-200"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Logging In...' : 'Creating Account...'}
              </div>
            ) : (
              <>
                {isLogin ? 'Log In' : 'Create Account'}
              </>
            )}
          </button>

          {/* Forgot Password - Only for Login */}
          {isLogin && (
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-black transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          )}
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-6 pt-6 border-t border-green-100">
          <div className="text-center">
            <span className="text-gray-700 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <motion.button
              onClick={toggleAuthMode}
              whileTap={{ scale: 0.98 }}
              className="font-medium text-black hover:text-gray-900 transition-colors duration-200 underline decoration-gray-300 hover:decoration-gray-500 text-sm"
            >
              {isLogin ? 'Create one here' : 'Log in instead'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Additional Info */}
      {!isLogin && (
        <div className="mt-4 text-center text-xs text-gray-600">
          By creating an account, you agree to our{' '}
          <a href="#" className="underline hover:text-black">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-black">Privacy Policy</a>
        </div>
      )}
    </div>
  );
}