'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface FilterPanelWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const FilterPanelWrapper: React.FC<FilterPanelWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle hover expand when collapsed
  const showExpanded = isCollapsed && isHovered;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsHovered(false);
  };

  return (
    <div className="relative">
      {/* Main Panel */}
      <motion.div
        ref={panelRef}
        className={`
          relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm
          transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed ? 'w-16' : 'w-72'}
          ${className}
        `}
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 288 // w-16 = 64px, w-72 = 288px
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapsed State - Icons Only */}
        {isCollapsed && !showExpanded && (
          <div className="p-4 h-full">
            <div className="flex flex-col items-center space-y-4">
              {/* Filter Icon */}
              <div className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              
              {/* Quick Filter Icons */}
              <div className="flex flex-col space-y-3 items-center">
                <div 
                  className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 cursor-pointer transition-colors"
                  title="ფასი"
                >
                  <span className="text-sm">₾</span>
                </div>
                <div 
                  className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 cursor-pointer transition-colors"
                  title="ტიპი"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </div>
                <div 
                  className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 cursor-pointer transition-colors"
                  title="ოთახები"
                >
                  <span className="text-xs font-medium">BR</span>
                </div>
                <div 
                  className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 cursor-pointer transition-colors"
                  title="ფართობი"
                >
                  <span className="text-xs">m²</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded State or Hover Expanded */}
        <AnimatePresence>
          {(!isCollapsed || showExpanded) && (
            <motion.div
              className={`
                ${showExpanded ? 'absolute left-0 top-0 w-72 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg z-50' : 'relative'}
                h-full
              `}
              initial={showExpanded ? { opacity: 0, x: -20 } : false}
              animate={showExpanded ? { opacity: 1, x: 0 } : {}}
              exit={showExpanded ? { opacity: 0, x: -20 } : {}}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-gray-500 hover:text-primary-500 z-10"
          aria-label={isCollapsed ? "გაშლა" : "ჩაკეცვა"}
        >
          {isCollapsed ? (
            <CaretRight className="w-3 h-3" weight="bold" />
          ) : (
            <CaretLeft className="w-3 h-3" weight="bold" />
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default FilterPanelWrapper; 