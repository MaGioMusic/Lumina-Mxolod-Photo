'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Eye, EyeSlash, SignIn } from '@phosphor-icons/react';
import type { LoginCredentials } from '@/types/auth';
import SocialLoginButtons from './SocialLoginButtons';
import SignUpModal from './SignUpModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  redirectOnSuccess = true,
}: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    if (redirectOnSuccess) {
      router.push('/profile');
    }
    onSuccess?.();
    onClose();
    setCredentials({ email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        handleLoginSuccess();
      } else {
        setError(t('invalidCredentials'));
      }
    } catch (error) {
      setError(t('loginError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCredentials({ email: '', password: '' });
    setError(null);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Simulate Google OAuth API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Google user data
      const success = await login('google.user@gmail.com', 'google_oauth_token');
      if (success) {
        handleLoginSuccess();
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Simulate Facebook OAuth API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Facebook user data
      const success = await login('facebook.user@facebook.com', 'facebook_oauth_token');
      if (success) {
        handleLoginSuccess();
      } else {
        setError('Facebook login failed. Please try again.');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      setError('Facebook login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = () => {
    // Don't close LoginModal immediately, just open SignUpModal
    setIsSignUpModalOpen(true);
  };

  const handleSignUpModalClose = () => {
    setIsSignUpModalOpen(false);
    // Also close the LoginModal when SignUpModal closes
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className={`relative w-full max-w-md mx-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-xl border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } animate-fade-in-up`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#F08336] rounded-lg flex items-center justify-center">
                <SignIn size={16} className="text-white" weight="bold" />
              </div>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {t('login')}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={20} weight="regular" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
                  } focus:ring-2 focus:outline-none`}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
                    } focus:ring-2 focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? (
                      <EyeSlash size={20} weight="regular" />
                    ) : (
                      <Eye size={20} weight="regular" />
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Demo Accounts:</p>
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <div>• Agent: agent@lumina.ge</div>
                  <div>• Client: client@lumina.ge</div>
                  <div>• Investor: investor@lumina.ge</div>
                  <div>• Password: password123</div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !credentials.email || !credentials.password}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || !credentials.email || !credentials.password
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-[#F08336] hover:bg-[#E07428] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  t('login')
                )}
              </button>
            </form>

            {/* Sign Up Button */}
            <button
              onClick={handleSignUpClick}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 ${
                isSubmitting
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              type="button"
            >
              Sign Up
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              disabled={isSubmitting}
            />
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${
            theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
          } rounded-b-2xl`}>
            <p className={`text-xs text-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Demo version - Use the credentials above to test different user roles
            </p>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={handleSignUpModalClose} 
      />
    </>
  );
} 