'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Eye, EyeSlash, UserPlus } from '@phosphor-icons/react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  agreeToTerms: boolean;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validEmailRequired');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordMinLength');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('agreeToTermsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Call the real registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: fullName,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.error?.code === 'EMAIL_EXISTS'
            ? t('emailAlreadyExists')
            : data?.error?.message ?? t('registrationFailed');
        setErrors({ form: message });
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ form: t('autoLoginFailed') });
        return;
      }

      // Success - close modal and reset form
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeToTerms: false,
      });
      setErrors({});

      // Reload to update session state
      window.location.href = '/dashboard';
    } catch (error) {
      setErrors({ form: t('registrationFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SignUpForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      agreeToTerms: false
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg mx-4 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-2xl shadow-xl border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } animate-fade-in-up max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#F08336] rounded-lg flex items-center justify-center">
              <UserPlus size={16} className="text-white" weight="bold" />
            </div>
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {t('createAccount')}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Form-level error */}
          {errors.form && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('firstName')} *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={t('enterFirstName')}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.firstName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
                } focus:ring-2 focus:outline-none`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('lastName')} *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={t('enterLastName')}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.lastName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
                } focus:ring-2 focus:outline-none`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('email')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('enterYourEmail')}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
              } focus:ring-2 focus:outline-none`}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+995 555 123 456"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
              } focus:ring-2 focus:outline-none`}
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('password')} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('enterYourPassword')}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : theme === 'dark'
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
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('confirmPassword')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder={t('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#F08336] focus:ring-[#F08336]/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#F08336] focus:ring-[#F08336]/20'
                  } focus:ring-2 focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeSlash size={20} weight="regular" />
                  ) : (
                    <Eye size={20} weight="regular" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#F08336] border-gray-300 rounded focus:ring-[#F08336] focus:ring-2"
              />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('iAgreeToThe')}{' '}
                <a href="#" className="text-[#F08336] hover:underline">
                  {t('termsOfService')}
                </a>{' '}
                {t('and')}{' '}
                <a href="#" className="text-[#F08336] hover:underline">
                  {t('privacyPolicy')}
                </a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-500">{errors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-[#F08336] hover:bg-[#E07428] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{t('creatingAccount')}</span>
              </div>
            ) : (
              t('createAccount')
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
        } rounded-b-2xl`}>
          <p className={`text-xs text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {t('alreadyHaveAccount')}{' '}
            <button 
              onClick={handleClose}
              className="text-[#F08336] hover:underline font-medium"
            >
              {t('signInInstead')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 