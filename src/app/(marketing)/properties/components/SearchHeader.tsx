'use client';

import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, SlidersHorizontal, Map, Grid3X3, Home, Building2, MapPin, Bed, Bath, Square, DollarSign } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (view: 'grid' | 'map') => void;
  onFiltersToggle: () => void;
}

// Quick Filter Button Component
const QuickFilterButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
}> = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
      active 
        ? 'bg-primary-500 text-white border-primary-500 shadow-md' 
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Simple iOS-style toggle component
const IOSToggle: React.FC<{ isGrid: boolean; onToggle: (view: 'grid' | 'map') => void }> = ({ isGrid, onToggle }) => (
  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
    <button
      onClick={() => onToggle('grid')}
      className={`p-2 rounded-full transition-all duration-200 ${
        isGrid 
          ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      <Grid3X3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onToggle('map')}
      className={`p-2 rounded-full transition-all duration-200 ${
        !isGrid 
          ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      <Map className="w-4 h-4" />
    </button>
  </div>
);

const SearchHeader: React.FC<SearchHeaderProps> = memo(({ 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange, 
  onFiltersToggle 
}) => {
  const { t } = useLanguage();
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the parent component via onSearchChange
  };

  const toggleQuickFilter = (filter: string) => {
    setActiveQuickFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const quickFilters = [
    { id: 'apartments', icon: <Building2 className="w-4 h-4" />, label: 'ბინები' },
    { id: 'houses', icon: <Home className="w-4 h-4" />, label: 'სახლები' },
    { id: 'for-sale', icon: <DollarSign className="w-4 h-4" />, label: 'იყიდება' },
    { id: 'for-rent', icon: <MapPin className="w-4 h-4" />, label: 'ქირავდება' },
    { id: 'new', icon: <Square className="w-4 h-4" />, label: 'ახალი' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm relative">
      {/* Desktop: Float the view toggle to the very top-right */}
      <div className="hidden lg:flex absolute top-3 right-6 z-10">
        <IOSToggle 
          isGrid={viewMode === 'grid'} 
          onToggle={onViewModeChange}
        />
      </div>

      <div className="w-full px-6 lg:px-8 py-4">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          {/* Enhanced Search Form */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ძებნა მისამართით, რაიონით ან ID-ით..."
                className="w-full pl-12 pr-16 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 text-lg shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              {/* Advanced Filters Button */}
              <button
                type="button"
                onClick={onFiltersToggle}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Right Side Controls (mobile only; desktop is floating top-right) */}
          <div className="flex items-center gap-3 lg:hidden">
            <IOSToggle 
              isGrid={viewMode === 'grid'} 
              onToggle={onViewModeChange}
            />
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-1 whitespace-nowrap md:whitespace-normal">
          {quickFilters.map((filter) => (
            <QuickFilterButton
              key={filter.id}
              icon={filter.icon}
              label={filter.label}
              active={activeQuickFilters.includes(filter.id)}
              onClick={() => toggleQuickFilter(filter.id)}
            />
          ))}
          
          {/* Show More Filters Button */}
          <button
            onClick={onFiltersToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">მეტი ფილტრი</span>
          </button>
        </div>

        {/* Active Filters Summary */}
        {activeQuickFilters.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>აქტიური ფილტრები:</span>
              <div className="flex gap-1">
                {activeQuickFilters.map((filter) => {
                  const filterData = quickFilters.find(f => f.id === filter);
                  return (
                    <span key={filter} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-md">
                      {filterData?.label}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => setActiveQuickFilters([])}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                გასუფთავება
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

SearchHeader.displayName = 'SearchHeader';

export default SearchHeader; 