'use client';

import React, { useState } from 'react';
import { Sidebar, Menu, SubMenu } from 'react-pro-sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import ToggleSwitch from './ToggleSwitch';
import BeautifulRangeSlider from './BeautifulRangeSlider';
import MiniCalendar from './MiniCalendar';

// Enhanced FiltersState interface with new filters
interface FiltersState {
  priceRange: [number, number];
  bedrooms: string[];
  bathrooms: string[];
  propertyTypes: string[];
  transactionType: string;
  constructionStatus: string;
  floor: string;
  furniture: string;
  area: [number, number];
  amenities: string[];
  // New filters
  dateAdded: [Date | null, Date | null];
  quality: string[];
}

interface ProSidebarFilterProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProSidebarFilter: React.FC<ProSidebarFilterProps> = ({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  searchQuery,
  onSearchChange,
}) => {
  const { theme } = useTheme(); // Dark mode detection
  const [showCollapsedSearch, setShowCollapsedSearch] = useState(false);
  
  // Dynamic color scheme based on theme
  const colors = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#f9fafb' : '#111827',
    textSecondary: theme === 'dark' ? '#d1d5db' : '#6b7280',
    menuItem: theme === 'dark' ? '#374151' : '#f8fafc',
    menuItemHover: theme === 'dark' ? '#4b5563' : '#f1f5f9',
    shadow: theme === 'dark' 
      ? '2px 0 10px rgba(0,0,0,0.3)' 
      : '2px 0 10px rgba(0,0,0,0.1)'
  };
  
  // Dark mode now handled by global CSS overrides in globals.css

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: value,
    });
  };

  const handlePropertyTypeChange = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    
    onFiltersChange({
      ...filters,
      propertyTypes: newTypes,
    });
  };

  const handleBedroomsChange = (bedrooms: string) => {
    const newBedrooms = filters.bedrooms.includes(bedrooms)
      ? filters.bedrooms.filter(b => b !== bedrooms)
      : [...filters.bedrooms, bedrooms];
    
    onFiltersChange({
      ...filters,
      bedrooms: newBedrooms,
    });
  };

  const handleBathroomsChange = (bathrooms: string) => {
    const newBathrooms = filters.bathrooms.includes(bathrooms)
      ? filters.bathrooms.filter(b => b !== bathrooms)
      : [...filters.bathrooms, bathrooms];
    
    onFiltersChange({
      ...filters,
      bathrooms: newBathrooms,
    });
  };

  const handleAreaChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      area: value,
    });
  };

  const handleAmenityChange = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    onFiltersChange({
      ...filters,
      amenities: newAmenities,
    });
  };

  const handleDateAddedChange = (dateRange: [Date | null, Date | null]) => {
    onFiltersChange({
      ...filters,
      dateAdded: dateRange,
    });
  };

  const handleQualityChange = (quality: string) => {
    const newQualities = filters.quality.includes(quality)
      ? filters.quality.filter(q => q !== quality)
      : [...filters.quality, quality];
    
    onFiltersChange({
      ...filters,
      quality: newQualities,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000000],
      bedrooms: [],
      bathrooms: [],
      propertyTypes: [],
      transactionType: '',
      constructionStatus: '',
      floor: '',
      furniture: '',
      area: [0, 10000],
      amenities: [],
      dateAdded: [null, null],
      quality: [],
    });
  };

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Land', 'Office'];
  const amenitiesList = ['Parking', 'Balcony', 'Garden', 'Pool', 'Gym', 'Security', 'Elevator', 'Furnished'];
  const qualityLevels = ['Premium', 'Standard'];

  const activeFiltersCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0,
    filters.propertyTypes.length,
    filters.bedrooms.length,
    filters.bathrooms.length,
    filters.area[0] > 0 || filters.area[1] < 10000 ? 1 : 0,
    filters.amenities.length,
    filters.dateAdded[0] || filters.dateAdded[1] ? 1 : 0,
    filters.quality.length,
  ].reduce((sum, count) => sum + count, 0);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price.toString();
  };

  const formatArea = (area: number) => {
    if (area >= 1000) return `${(area / 1000).toFixed(1)}K`;
    return area.toString();
  };

  // Enhanced filter intensity calculation with new filters
  const getFilterIntensity = () => {
    const totalPossibleFilters = 8; // Updated to include new filters
    const intensity = activeFiltersCount / totalPossibleFilters;
    if (intensity > 0.7) return 'high';
    if (intensity > 0.3) return 'medium';
    if (intensity > 0) return 'low';
    return 'none';
  };

  const intensityColors = {
    none: 'text-gray-400',
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  

  return (
    <div className="h-full" style={{ backgroundColor: colors.background }}>
      
      <Sidebar
        collapsed={isCollapsed}
        width="280px"
        collapsedWidth="85px"
        backgroundColor={colors.background}
        rootStyles={{
          border: 'none',
          boxShadow: colors.shadow,
          height: '100%',
          color: colors.text,
          '.ps-sidebar-container': {
            transition: 'width 90ms cubic-bezier(0.2,0.8,0.2,1), min-width 90ms cubic-bezier(0.2,0.8,0.2,1)',
            willChange: 'width',
            overflow: 'hidden',
          },
          '.ps-submenu-content': {
            transition: 'none', // prevent nested height animations during sidebar collapse
          },
          // Force override react-pro-sidebar styles
          // '.ps-sidebar-container': {
          //   backgroundColor: `${colors.background} !important`,
          // },
          // '.ps-menu-button': {
          //   backgroundColor: `${colors.background} !important`,
          //   color: `${colors.text} !important`,
          // },
          // '.ps-submenu-content': {
          //   backgroundColor: `${colors.background} !important`,
          // },
        }}
        style={{
          backgroundColor: colors.background,
        }}
      >
        {/* Enhanced Header */}
        <div className={`p-4 border-b transition-colors duration-150`} style={{
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.text
        }}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <h2 className="font-semibold" style={{ color: colors.text }}>Filters</h2>
                {activeFiltersCount > 0 && (
                  <div className="px-2 py-1 rounded-full text-xs font-bold bg-primary-400 text-white border">
                    {activeFiltersCount}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              {/* Filter intensity indicator */}
              {isCollapsed && activeFiltersCount > 0 && (
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${intensityColors[getFilterIntensity()]} opacity-80`}>
                    <div className={`absolute inset-0 rounded-full animate-ping ${intensityColors[getFilterIntensity()]} opacity-40`}></div>
                  </div>
                </div>
              )}
              
              {/* Clear all button */}
              {!isCollapsed && activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 transform hover:scale-110"
                  title="Clear all filters"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Toggle button */}
              <button
                onClick={onToggleCollapse}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-cream-100 rounded-lg transition-colors transition-transform duration-150 transform-gpu will-change-transform hover:scale-105"
              >
                <svg className={`w-5 h-5 transition-transform duration-150 transform-gpu ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Always-visible Search (orange) */}
        <div className="px-3 py-3 relative border-b" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
          {!isCollapsed ? (
            <div className="relative p-2 pr-10 rounded-full bg-[#f97316] shadow-sm flex items-center">
              <svg className="w-4 h-4 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by city, district..."
                className="w-full bg-transparent text-white placeholder-white/70 outline-none px-3 text-sm"
                aria-label="Search properties"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowCollapsedSearch((v) => !v)}
                className="w-10 h-10 bg-[#f97316] rounded-full flex items-center justify-center text-white shadow"
                aria-label="Open search"
                title="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
              {showCollapsedSearch && (
                <div className="absolute left-12 top-1 z-50 w-64 p-2 pr-9 rounded-full bg-[#f97316] shadow flex items-center">
                  <svg className="w-4 h-4 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by city, district..."
                    className="w-full bg-transparent text-white placeholder-white/70 outline-none px-3 text-sm"
                    aria-label="Search properties"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowCollapsedSearch(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                    aria-label="Close search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter chips row */}
        <div className="px-3 pb-2" style={{ backgroundColor: colors.background }}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Price chip */}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
              <button
                onClick={() => onFiltersChange({ ...filters, priceRange: [0, 1000000] })}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label="Remove price filter"
              >
                Price: ${formatPrice(filters.priceRange[0])}-{formatPrice(filters.priceRange[1])} ×
              </button>
            )}

            {/* Area chip */}
            {(filters.area[0] > 0 || filters.area[1] < 10000) && (
              <button
                onClick={() => onFiltersChange({ ...filters, area: [0, 10000] })}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label="Remove area filter"
              >
                Area: {formatArea(filters.area[0])}-{formatArea(filters.area[1])} m² ×
              </button>
            )}

            {/* Types */}
            {filters.propertyTypes.map((type) => (
              <button
                key={`chip-type-${type}`}
                onClick={() => handlePropertyTypeChange(type)}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label={`Remove type ${type}`}
              >
                {type} ×
              </button>
            ))}

            {/* Bedrooms */}
            {filters.bedrooms.map((b) => (
              <button
                key={`chip-bed-${b}`}
                onClick={() => handleBedroomsChange(b)}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label={`Remove bedrooms ${b}+`}
              >
                Beds: {b}+ ×
              </button>
            ))}

            {/* Bathrooms */}
            {filters.bathrooms.map((b) => (
              <button
                key={`chip-bath-${b}`}
                onClick={() => handleBathroomsChange(b)}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label={`Remove bathrooms ${b}+`}
              >
                Baths: {b}+ ×
              </button>
            ))}

            {/* Amenities */}
            {filters.amenities.map((a) => (
              <button
                key={`chip-amenity-${a}`}
                onClick={() => handleAmenityChange(a)}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label={`Remove amenity ${a}`}
              >
                {a} ×
              </button>
            ))}

            {/* Date Added */}
            {(filters.dateAdded[0] || filters.dateAdded[1]) && (
              <button
                onClick={() => onFiltersChange({ ...filters, dateAdded: [null, null] })}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label="Remove date filter"
              >
                Date: selected ×
              </button>
            )}

            {/* Quality */}
            {filters.quality.map((q) => (
              <button
                key={`chip-quality-${q}`}
                onClick={() => handleQualityChange(q)}
                className="px-3 py-1 rounded-full text-xs border bg-white text-[#f97316] border-orange-200 hover:bg-orange-50"
                aria-label={`Remove quality ${q}`}
              >
                {q} ×
              </button>
            ))}

            {/* Clear all */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-auto px-3 py-1 rounded-full text-xs border border-orange-200 text-[#f97316] hover:bg-orange-50"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {isCollapsed ? (
          /* Enhanced Collapsed Icons with new filters */
          <div className="p-3 space-y-2">
            {/* Quick Actions Section */}
            {activeFiltersCount > 0 && (
              <div className="pb-3 border-b border-gray-100">
                <button
                  onClick={clearAllFilters}
                  className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-red-50 transition-all duration-300 cursor-pointer transform hover:scale-105 group"
                  title="Clear all filters"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-red-500 transition-colors duration-300 mt-1">Clear</span>
                </button>
              </div>
            )}

            {/* Enhanced Price Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  {/* Simple money/dollar icon */}
                  <div className="relative">
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300 transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-primary-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
                  </div>
                  
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary-400 to-sage-400 rounded-full animate-pulse shadow-lg">
                      <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-40"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Price</span>
              </div>
              
              {/* Enhanced Tooltip */}
              <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                  <div className="font-semibold text-orange-300">${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}</div>
                  <div className="text-gray-300 text-xs mt-1">Price range filter</div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Property Type Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <div className="relative">
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300 transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {/* Floating effect */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-300 opacity-0 group-hover:opacity-60 rounded-full blur-sm transition-opacity duration-300"></div>
                  </div>
                  
                  {filters.propertyTypes.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary-400 to-sage-400 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-xs font-bold">{filters.propertyTypes.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Type</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {filters.propertyTypes.length > 0 && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700 max-w-48">
                    <div className="font-semibold text-orange-300 mb-1">Property Types:</div>
                    <div className="text-gray-300">{filters.propertyTypes.join(', ')}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Bedrooms Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                  
                  {filters.bedrooms.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white text-xs font-bold">{filters.bedrooms.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Beds</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {filters.bedrooms.length > 0 && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                    <div className="font-semibold text-blue-300 mb-1">Bedrooms:</div>
                    <div className="text-gray-300">{filters.bedrooms.map(b => `${b}+`).join(', ')} rooms</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Bathrooms Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  
                  {filters.bathrooms.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">{filters.bathrooms.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Baths</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {filters.bathrooms.length > 0 && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                    <div className="font-semibold text-cyan-300 mb-1">Bathrooms:</div>
                    <div className="text-gray-300">{filters.bathrooms.map(b => `${b}+`).join(', ')} rooms</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Area Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300 transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  
                  {(filters.area[0] > 0 || filters.area[1] < 10000) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg">
                      <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-40"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Area</span>
              </div>
              
              {/* Enhanced Tooltip */}
              <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                  <div className="font-semibold text-purple-300 mb-1">Area Range:</div>
                  <div className="text-gray-300">{formatArea(filters.area[0])} - {formatArea(filters.area[1])} m²</div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Amenities Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <div className="relative">
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {/* Sparkling effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-0 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute top-1 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-100"></div>
                      <div className="absolute bottom-0 left-1 w-1 h-1 bg-yellow-500 rounded-full animate-ping delay-200"></div>
                    </div>
                  </div>
                  
                  {filters.amenities.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <span className="text-white text-xs font-bold">{filters.amenities.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Plus</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {filters.amenities.length > 0 && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700 max-w-52">
                    <div className="font-semibold text-green-300 mb-1">Amenities ({filters.amenities.length}):</div>
                    <div className="text-gray-300 leading-relaxed">{filters.amenities.join(', ')}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* NEW: Date Added Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300 transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  
                  {(filters.dateAdded[0] || filters.dateAdded[1]) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full animate-pulse shadow-lg">
                      <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-40"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Date</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {(filters.dateAdded[0] || filters.dateAdded[1]) && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                    <div className="font-semibold text-indigo-300 mb-1">Date Added:</div>
                    <div className="text-gray-300">
                      {filters.dateAdded[0] && filters.dateAdded[1] 
                        ? `${filters.dateAdded[0].toLocaleDateString()} - ${filters.dateAdded[1].toLocaleDateString()}`
                        : filters.dateAdded[0]?.toLocaleDateString() || 'Selected'}
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* NEW: Quality/Rating Icon */}
            <div className="relative group">
              <div className="flex flex-col items-center p-3 rounded-lg hover:bg-cream-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <div className="relative">
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-500 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {/* Quality sparkle effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-150"></div>
                    </div>
                  </div>
                  
                  {filters.quality.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white text-xs font-bold">{filters.quality.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 group-hover:text-primary-600 transition-colors duration-300 font-medium">Quality</span>
              </div>
              
              {/* Enhanced Tooltip */}
              {filters.quality.length > 0 && (
                <div className="absolute left-full ml-3 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                    <div className="font-semibold text-yellow-300 mb-1">Quality Levels:</div>
                    <div className="text-gray-300">{filters.quality.join(', ')}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Summary */}
            <div className="pt-3 border-t border-gray-100 mt-3">
              <div className="text-center">
                <div className={`text-xs font-medium ${intensityColors[getFilterIntensity()]}`}>
                  {getFilterIntensity() === 'none' ? 'No filters' : 
                   getFilterIntensity() === 'low' ? 'Light filtering' :
                   getFilterIntensity() === 'medium' ? 'Medium filtering' : 'Heavy filtering'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {activeFiltersCount} active
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded Menu with new filters */
          <Menu
            menuItemStyles={{
              button: ({ level }) => {
                // Level 0 = main menu items, Level 1+ = submenu items
                if (level === 0) {
                  return {
                    backgroundColor: colors.background,
                    color: colors.text,
                    '&:hover': {
                      backgroundColor: colors.menuItemHover,
                      color: colors.text,
                    },
                  };
                }
                return {
                  backgroundColor: colors.background,
                  color: colors.textSecondary,
                  '&:hover': {
                    backgroundColor: colors.menuItemHover,
                    color: colors.text,
                  },
                };
              },
              subMenuContent: {
                backgroundColor: colors.background,
                color: colors.text,
              },
            }}
          >
            

            {/* Price Range */}
            <SubMenu
              label={!isCollapsed ? "Price Range" : ""}
              rootStyles={{
                backgroundColor: colors.background,
                color: colors.text,
              }}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4" style={{ backgroundColor: colors.background }}>
                  <BeautifulRangeSlider
                    min={0}
                    max={1000000}
                    value={filters.priceRange}
                    onChange={handlePriceChange}
                    step={10000}
                    unit="$"
                    formatValue={formatPrice}
                  />
                </div>
              )}
            </SubMenu>

            {/* Property Type */}
            <SubMenu
              label={!isCollapsed ? "Property Type" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4" style={{ backgroundColor: colors.background }}>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => {
                      const active = filters.propertyTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => handlePropertyTypeChange(type)}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            active
                              ? 'bg-[#f97316] text-white border-[#f97316]'
                              : `${theme === 'dark' ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-300'} hover:border-orange-300`
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </SubMenu>

            {/* Bedrooms */}
            <SubMenu
              label={!isCollapsed ? "Bedrooms" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4" style={{ backgroundColor: colors.background }}>
                  <div className="grid grid-cols-4 gap-2">
                    {['1', '2', '3', '4'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleBedroomsChange(num)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          filters.bedrooms.includes(num)
                            ? 'bg-primary-400 text-white border-primary-400'
                            : `${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-300'} hover:border-orange-300`
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SubMenu>

            {/* Bathrooms */}
            <SubMenu
              label={!isCollapsed ? "Bathrooms" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {['1', '2', '3', '4'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleBathroomsChange(num)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          filters.bathrooms.includes(num)
                            ? 'bg-primary-400 text-white border-primary-400'
                            : `${theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-300'} hover:border-orange-300`
                        }`}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SubMenu>

            {/* Area */}
            <SubMenu
              label={!isCollapsed ? "Area (m²)" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4">
                  <BeautifulRangeSlider
                    min={0}
                    max={10000}
                    value={filters.area}
                    onChange={handleAreaChange}
                    step={50}
                    unit="m²"
                    formatValue={formatArea}
                  />
                </div>
              )}
            </SubMenu>

            {/* Amenities */}
            <SubMenu
              label={!isCollapsed ? "Amenities" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => {
                      const active = filters.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => handleAmenityChange(amenity)}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            active
                              ? 'bg-[#f97316] text-white border-[#f97316]'
                              : `${theme === 'dark' ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-300'} hover:border-orange-300`
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </SubMenu>

            {/* NEW: Date Added */}
            <SubMenu
              label={!isCollapsed ? "Date Added" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4">
                  <MiniCalendar
                    selectedDateRange={filters.dateAdded}
                    onDateRangeChange={handleDateAddedChange}
                  />
                </div>
              )}
            </SubMenu>

            {/* NEW: Quality/Rating */}
            <SubMenu
              label={!isCollapsed ? "Quality" : ""}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            >
              {!isCollapsed && (
                <div className="p-4 space-y-3">
                  {qualityLevels.map((quality) => (
                    <ToggleSwitch
                      key={quality}
                      id={`quality-${quality}`}
                      checked={filters.quality.includes(quality)}
                      onChange={() => handleQualityChange(quality)}
                      label={quality}
                    />
                  ))}
                </div>
              )}
            </SubMenu>
          </Menu>
        )}
      </Sidebar>
    </div>
  );
};

export default ProSidebarFilter;

// Dark mode styling now handled by global CSS overrides in globals.css 