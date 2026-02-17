'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { flags } from '@/lib/flags';
import { Mail, Check } from 'lucide-react';

interface NewsletterProps {
  className?: string;
}

export default function Newsletter({ className = '' }: NewsletterProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user is already subscribed
  useEffect(() => {
    const subscribedEmails = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
    if (subscribedEmails.length > 0) {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert(t('emailPlaceholder'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert(t('validEmailAddress'));
      return;
    }

    setIsSubscribing(true);

    // Simulate API call delay
    setTimeout(() => {
      // Store email in localStorage
      const existingEmails = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(existingEmails));
      }

      setIsSubscribing(false);
      setIsSubscribed(true);
      setShowSuccess(true);
      setEmail('');

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (isSubscribed) {
      setIsSubscribed(false);
    }
  };

  return (
    <div className={`newsletter-section ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
          {t('newsletter')}
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {flags.enableCRONewsletter
          ? (t('newsletterDescription') + ' ' + (t('noSpamMessage') || ''))
          : t('newsletterDescription')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={t('emailPlaceholder')}
            disabled={isSubscribing}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('emailPlaceholder')}
          />
          {isSubscribed && !email && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubscribing || !email.trim()}
          className="w-full bg-primary-400 hover:bg-primary-500 disabled:bg-gray-400 
                   text-white font-semibold py-3 px-4 rounded-lg
                   transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                   disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label={isSubscribing ? t('subscribing') : t('subscribe')}
        >
          {isSubscribing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('subscribing')}
            </div>
          ) : (
            (flags.enableCRONewsletter
              ? (t('subscribe') === 'Subscribe' ? 'გამომიწერე ჩემი განახლებები' : t('subscribe'))
              : t('subscribe'))
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        {t('noSpamMessage')}
      </p>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg 
                      animate-slide-in-right z-50 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {t('subscriptionSuccess')}
        </div>
      )}
    </div>
  );
} 