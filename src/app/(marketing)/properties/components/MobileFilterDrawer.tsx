'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Funnel } from '@phosphor-icons/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  children,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount = 0
}) => {
  const { t } = useLanguage();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 w-full bg-white dark:bg-gray-900 z-50 flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <Funnel className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('filters')}
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 text-sm text-primary-500 bg-cream-200 dark:bg-primary-900/30 px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Clear All Button */}
                {activeFiltersCount > 0 && onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('clearAll')}
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={t('closeFilters')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {children}
            </div>

            {/* Footer with Apply Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex space-x-3">
                {/* Cancel Button */}
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                
                {/* Apply Filters Button */}
                <button
                  onClick={() => {
                    onApplyFilters?.();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-primary-400 text-white rounded-lg font-medium hover:bg-primary-500 transition-colors shadow-sm"
                >
                  {t('applyFilters')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile Filter Toggle Button Component
interface MobileFilterToggleProps {
  onClick: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  onClick,
  activeFiltersCount = 0,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center space-x-2 px-3 py-2 
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-sm hover:shadow-md transition-all duration-200
        text-gray-700 dark:text-gray-300 hover:text-primary-500
        md:hidden
        ${className}
      `}
    >
      <Funnel className="w-4 h-4" />
      <span className="text-sm font-medium">{t('filters')}</span>
      
      {/* Active Filters Badge */}
      {activeFiltersCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary-400 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
        </motion.span>
      )}
    </button>
  );
};

export default MobileFilterDrawer; 