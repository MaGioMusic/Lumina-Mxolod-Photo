'use client';

import React, { useState, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { House, Buildings, Car, SwimmingPool, Barbell, Plant } from '@phosphor-icons/react';

// Import our new components
import FilterPanelWrapper from './FilterPanelWrapper';
import FilterCategoryBlock from './FilterCategoryBlock';
import { CheckboxOption, RangeSliderOption, SelectOption } from './FilterOption';
import MobileFilterDrawer, { MobileFilterToggle } from './MobileFilterDrawer';

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
}

interface EnhancedFiltersSidebarProps {
  onFiltersChange: (filters: FiltersState) => void;
  className?: string;
}

const EnhancedFiltersSidebar: React.FC<EnhancedFiltersSidebarProps> = memo(({ 
  onFiltersChange,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: [0, 1000000],
    bedrooms: [],
    bathrooms: [],
    propertyTypes: [],
    transactionType: '',
    constructionStatus: '',
    floor: '',
    furniture: '',
    area: [0, 500],
    amenities: []
  });

  // Calculate active filters count
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.area[0] > 0 || filters.area[1] < 500) count++;
    count += filters.bedrooms.length;
    count += filters.bathrooms.length;
    count += filters.propertyTypes.length;
    count += filters.amenities.length;
    if (filters.transactionType) count++;
    if (filters.constructionStatus) count++;
    if (filters.floor) count++;
    if (filters.furniture) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof FiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FiltersState = {
      priceRange: [0, 1000000],
      bedrooms: [],
      bathrooms: [],
      propertyTypes: [],
      transactionType: '',
      constructionStatus: '',
      floor: '',
      furniture: '',
      area: [0, 500],
      amenities: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleArrayFilter = (key: 'bedrooms' | 'bathrooms' | 'propertyTypes' | 'amenities', value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M ₾`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K ₾`;
    return `${price} ₾`;
  };

  // Property type options
  const propertyTypeOptions = [
    { value: 'apartment', label: 'ბინა', icon: <Buildings className="w-4 h-4" /> },
    { value: 'house', label: 'სახლი', icon: <House className="w-4 h-4" /> },
    { value: 'commercial', label: 'კომერციული', icon: <Buildings className="w-4 h-4" /> }
  ];

  // Amenities options
  const amenitiesOptions = [
    { value: 'parking', label: 'პარკინგი', icon: <Car className="w-4 h-4" /> },
    { value: 'pool', label: 'აუზი', icon: <SwimmingPool className="w-4 h-4" /> },
    { value: 'gym', label: 'სპორტული დარბაზი', icon: <Barbell className="w-4 h-4" /> },
    { value: 'garden', label: 'ბაღი', icon: <Plant className="w-4 h-4" /> }
  ];

  // Transaction type options
  const transactionTypeOptions = [
    { value: 'sale', label: 'გაყიდვა' },
    { value: 'rent', label: 'ქირავდება' },
    { value: 'daily_rent', label: 'დღიური ქირა' }
  ];

  const FilterContent = () => (
    <div className="p-4 space-y-6">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('filters')}
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-sm text-primary-500 bg-cream-200 dark:bg-primary-900/30 px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterCategoryBlock 
        title={t('priceRange')} 
        icon={<span className="text-lg">₾</span>}
      >
        <RangeSliderOption
          label=""
          min={0}
          max={1000000}
          step={10000}
          range={filters.priceRange}
          onChange={(value) => handleFilterChange('priceRange', value)}
          formatValue={formatPrice}
        />
      </FilterCategoryBlock>

      {/* Property Type */}
      <FilterCategoryBlock 
        title={t('propertyType')} 
        icon={<House className="w-4 h-4" />}
      >
        <div className="space-y-2">
          {propertyTypeOptions.map((option) => (
            <CheckboxOption
              key={option.value}
              label={option.label}
              checked={filters.propertyTypes.includes(option.value)}
              onChange={() => toggleArrayFilter('propertyTypes', option.value)}
            />
          ))}
        </div>
      </FilterCategoryBlock>

      {/* Transaction Type */}
      <FilterCategoryBlock 
        title="ტრანზაქციის ტიპი" 
        icon={<span className="text-sm">💰</span>}
      >
        <SelectOption
          label=""
          value={filters.transactionType}
          onChange={(value) => handleFilterChange('transactionType', value)}
          options={transactionTypeOptions}
          placeholder="აირჩიეთ ტიპი"
        />
      </FilterCategoryBlock>

      {/* Bedrooms */}
      <FilterCategoryBlock 
        title={t('bedrooms')} 
        icon={<span className="text-sm">🛏️</span>}
      >
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4', '5+'].map((bedroom) => (
            <button
              key={bedroom}
              onClick={() => toggleArrayFilter('bedrooms', bedroom)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${filters.bedrooms.includes(bedroom)
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-primary-900/20'
                }
              `}
            >
              {bedroom}
            </button>
          ))}
        </div>
      </FilterCategoryBlock>

      {/* Bathrooms */}
      <FilterCategoryBlock 
        title={t('bathrooms')} 
        icon={<span className="text-sm">🚿</span>}
      >
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4+'].map((bathroom) => (
            <button
              key={bathroom}
              onClick={() => toggleArrayFilter('bathrooms', bathroom)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${filters.bathrooms.includes(bathroom)
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-primary-900/20'
                }
              `}
            >
              {bathroom}
            </button>
          ))}
        </div>
      </FilterCategoryBlock>

      {/* Area */}
      <FilterCategoryBlock 
        title={t('area')} 
        icon={<span className="text-sm">📏</span>}
      >
        <RangeSliderOption
          label=""
          min={0}
          max={500}
          step={10}
          range={filters.area}
          onChange={(value) => handleFilterChange('area', value)}
          formatValue={(value) => `${value} m²`}
        />
      </FilterCategoryBlock>

      {/* Amenities */}
      <FilterCategoryBlock 
        title={t('amenities')} 
        icon={<span className="text-sm">✨</span>}
      >
        <div className="space-y-2">
          {amenitiesOptions.map((amenity) => (
            <CheckboxOption
              key={amenity.value}
              label={amenity.label}
              checked={filters.amenities.includes(amenity.value)}
              onChange={() => toggleArrayFilter('amenities', amenity.value)}
            />
          ))}
        </div>
      </FilterCategoryBlock>

      {/* Results Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('resultsUpdateAutomatically') || 'შედეგები ავტომატურად განახლდება'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className={`hidden md:block ${className}`}>
        <FilterPanelWrapper>
          <FilterContent />
        </FilterPanelWrapper>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <MobileFilterToggle
          onClick={() => setIsMobileDrawerOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onClearFilters={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
      >
        <FilterContent />
      </MobileFilterDrawer>
    </>
  );
});

EnhancedFiltersSidebar.displayName = 'EnhancedFiltersSidebar';

export default EnhancedFiltersSidebar; 