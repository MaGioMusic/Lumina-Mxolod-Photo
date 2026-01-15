'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';

interface FilterCategoryBlockProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

const FilterCategoryBlock: React.FC<FilterCategoryBlockProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
  isCollapsed = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    if (!isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  if (isCollapsed) {
    return (
      <div className={`mb-2 ${className}`}>
        <div 
          className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 cursor-pointer transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          title={title}
        >
          {icon || (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      {/* Category Header */}
      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
      >
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500 transition-colors">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
            {title}
          </h3>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
        >
          <CaretDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Category Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pl-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterCategoryBlock; 