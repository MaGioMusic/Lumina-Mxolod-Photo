'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
// Phosphor Icons imports - using correct icon names
import { 
  House, Buildings, BuildingOffice,
  Car, SwimmingPool, Barbell, Plant, TreePalm, Snowflake,
  CaretDown, Check
} from '@phosphor-icons/react';
// Temporarily removed GSAP animations to fix the error
// import { AnimatedIcon, StaggeredIcons } from '@/components/animations/IconAnimations';

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

interface FiltersSidebarProps {
  onFiltersChange: (filters: FiltersState) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = memo(({ 
  onFiltersChange 
}) => {
  const { t } = useLanguage();
  const [filters, setFilters] = React.useState<FiltersState>({
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
  const [activeFiltersCount, setActiveFiltersCount] = React.useState(0);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = React.useState(false);
  const [isTransactionTypeOpen, setIsTransactionTypeOpen] = React.useState(false);
  const [isConstructionOpen, setIsConstructionOpen] = React.useState(false);
  const [isFloorOpen, setIsFloorOpen] = React.useState(false);
  const [isFurnitureOpen, setIsFurnitureOpen] = React.useState(false);
  const propertyTypeRef = React.useRef<HTMLDivElement>(null);
  const transactionTypeRef = React.useRef<HTMLDivElement>(null);
  const constructionRef = React.useRef<HTMLDivElement>(null);
  const floorRef = React.useRef<HTMLDivElement>(null);
  const furnitureRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside - but not for Property Type (multi-select)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close Property Type dropdown on outside click - it's multi-select
      // User should close it manually or use Clear button
      
      if (transactionTypeRef.current && !transactionTypeRef.current.contains(event.target as Node)) {
        setIsTransactionTypeOpen(false);
      }
      if (constructionRef.current && !constructionRef.current.contains(event.target as Node)) {
        setIsConstructionOpen(false);
      }
      if (floorRef.current && !floorRef.current.contains(event.target as Node)) {
        setIsFloorOpen(false);
      }
      if (furnitureRef.current && !furnitureRef.current.contains(event.target as Node)) {
        setIsFurnitureOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time filtering - update parent whenever filters change
  React.useEffect(() => {
    console.log('FiltersSidebar filters changed:', filters);
    onFiltersChange(filters);
    
    // Count active filters
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.bedrooms.length > 0) count += filters.bedrooms.length;
    if (filters.bathrooms.length > 0) count += filters.bathrooms.length;
    if (filters.propertyTypes.length > 0) count += filters.propertyTypes.length;
    if (filters.transactionType) count++;
    if (filters.constructionStatus) count++;
    if (filters.floor) count++;
    if (filters.furniture) count++;
    if (filters.area[0] > 0 || filters.area[1] < 500) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    setActiveFiltersCount(count);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FiltersState, value: any) => {
    console.log('handleFilterChange called:', key, '=', value);
    const newFilters = { ...filters, [key]: value };
    console.log('New filters state:', newFilters);
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
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
  };

  const propertyTypes = [
    { value: 'apartment', label: t('apartment'), icon: Buildings },
    { value: 'house', label: t('house'), icon: House },
    { value: 'villa', label: t('villa'), icon: House },
    { value: 'studio', label: t('studio'), icon: Buildings },
    { value: 'penthouse', label: t('penthouse'), icon: Buildings },
    { value: 'commercial', label: t('commercial'), icon: BuildingOffice },
    { value: 'land', label: t('land'), icon: BuildingOffice },
    { value: 'office', label: t('office'), icon: BuildingOffice }
  ];

  const transactionTypes = [
    { value: 'for-sale', label: t('forSale') },
    { value: 'for-rent', label: t('forRent') },
    { value: 'for-lease', label: t('forLease') }
  ];

  const constructionStatuses = [
    { value: 'new', label: t('newConstruction') },
    { value: 'under-construction', label: t('underConstruction') },
    { value: 'old', label: t('oldConstruction') },
    { value: 'renovated', label: t('renovated') }
  ];

  const floorOptions = [
    { value: 'first', label: t('firstFloor') },
    { value: 'last', label: t('lastFloor') },
    { value: 'middle', label: t('middleFloors') },
    { value: '1-5', label: t('floor15') },
    { value: '6-10', label: t('floor610') },
    { value: '11-15', label: t('floor1115') },
    { value: '16+', label: t('floor16plus') }
  ];

  const furnitureOptions = [
    { value: 'furnished', label: t('furnished') },
    { value: 'partially', label: t('partiallyFurnished') },
    { value: 'unfurnished', label: t('unfurnished') }
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];

  const amenities = [
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'swimming_pool', label: 'Pool', icon: SwimmingPool },
    { id: 'gym', label: 'Gym', icon: Barbell },
    { id: 'garden', label: 'Garden', icon: Plant },
    { id: 'balcony', label: 'Balcony', icon: TreePalm },
    { id: 'air_conditioning', label: 'AC', icon: Snowflake }
  ];

  const toggleAmenity = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const togglePropertyType = (typeValue: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(typeValue)
        ? prev.propertyTypes.filter(t => t !== typeValue)
        : [...prev.propertyTypes, typeValue]
    }));
  };

  const toggleBedrooms = (bedroomValue: string) => {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(bedroomValue)
        ? prev.bedrooms.filter(b => b !== bedroomValue)
        : [...prev.bedrooms, bedroomValue]
    }));
  };

  const toggleBathrooms = (bathroomValue: string) => {
    setFilters(prev => ({
      ...prev,
      bathrooms: prev.bathrooms.includes(bathroomValue)
        ? prev.bathrooms.filter(b => b !== bathroomValue)
        : [...prev.bathrooms, bathroomValue]
    }));
  };

  return (
    <div className="w-56 bg-white dark:bg-gray-800 rounded-2xl p-4 h-fit border border-gray-200 dark:border-gray-700 shadow-sm filter-sidebar-container">
      {/* Animated Blob Background */}
      <div className="filter-sidebar-blob" />
      
      {/* Sidebar Background with Blur Effect */}
      <div className="filter-sidebar-bg" />
      
      {/* Sidebar Content */}
      <div className="filter-sidebar-content">
        {/* Header with Clear button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-50">
        {t('filters')}
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-xs text-primary-500">({activeFiltersCount})</span>
            )}
      </h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors px-2 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Price Range - Custom Dual Range Slider */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {t('priceRange')}
        </h3>
        <div className="space-y-3">
            {/* Custom Slider */}
            <div className="relative h-6 flex items-center px-2">
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                {/* Active Track */}
                <div 
                  className="absolute h-2 bg-primary-400 rounded-full"
                  style={{
                    left: `${(filters.priceRange[0] / 1000000) * 100}%`,
                    width: `${((filters.priceRange[1] - filters.priceRange[0]) / 1000000) * 100}%`
                  }}
                />
              </div>
              
              {/* Min Thumb */}
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-pointer shadow-md z-10 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${(filters.priceRange[0] / 1000000) * 100}% - 8px)`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startValue = filters.priceRange[0];
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLElement;
                    const rect = target?.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    
                    const deltaX = e.clientX - startX;
                    const percentChange = (deltaX / rect.width) * 100;
                    const valueChange = (percentChange / 100) * 1000000;
                    let newValue = Math.max(0, Math.min(filters.priceRange[1] - 10000, startValue + valueChange));
                    newValue = Math.round(newValue / 10000) * 10000; // Round to nearest 10k
                    
                    handleFilterChange('priceRange', [newValue, filters.priceRange[1]]);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              {/* Max Thumb */}
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-pointer shadow-md z-10 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${(filters.priceRange[1] / 1000000) * 100}% - 8px)`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startValue = filters.priceRange[1];
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLElement;
                    const rect = target?.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    
                    const deltaX = e.clientX - startX;
                    const percentChange = (deltaX / rect.width) * 100;
                    const valueChange = (percentChange / 100) * 1000000;
                    let newValue = Math.max(filters.priceRange[0] + 10000, Math.min(1000000, startValue + valueChange));
                    newValue = Math.round(newValue / 10000) * 10000; // Round to nearest 10k
                    
                    handleFilterChange('priceRange', [filters.priceRange[0], newValue]);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
            />
          </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <span className="text-gray-500 dark:text-gray-400">{t('min')}: </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">${filters.priceRange[0].toLocaleString()}</span>
              </div>
              <div className="text-gray-400 dark:text-gray-500">—</div>
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <span className="text-gray-500 dark:text-gray-400">{t('max')}: </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">${filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Type - Single Select Dropdown */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('transactionType')}
          </h3>
          <div className="relative" ref={transactionTypeRef}>
            <button
              type="button"
              onClick={() => setIsTransactionTypeOpen(!isTransactionTypeOpen)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl 
                bg-white dark:bg-gray-800/50 cursor-pointer flex items-center justify-between
                focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <span className={filters.transactionType ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {filters.transactionType
                  ? transactionTypes.find(t => t.value === filters.transactionType)?.label
                  : t('all')}
              </span>
              <CaretDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isTransactionTypeOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isTransactionTypeOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    handleFilterChange('transactionType', '');
                    setIsTransactionTypeOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                    ${!filters.transactionType ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{t('all')}</span>
                  {!filters.transactionType && <Check size={14} className="text-primary-500" />}
                </button>
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      handleFilterChange('transactionType', type.value);
                      setIsTransactionTypeOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                      ${filters.transactionType === type.value ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span>{type.label}</span>
                    {filters.transactionType === type.value && <Check size={14} className="text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

        {/* Property Type - Collapsible Multi-Select */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {t('propertyType')}
        </h3>
          <div className="relative" ref={propertyTypeRef}>
            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
              className={`w-full px-3 py-2 text-sm border rounded-xl cursor-pointer flex items-center justify-between
                transition-all duration-200
                ${isPropertyTypeOpen 
                  ? 'border-primary-400 dark:border-primary-400 bg-cream-100 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                }
                focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400`}
            >
              <span className={filters.propertyTypes.length > 0 ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {filters.propertyTypes.length > 0
                  ? filters.propertyTypes.length === 1
                    ? propertyTypes.find(t => t.value === filters.propertyTypes[0])?.label
                    : `${filters.propertyTypes.length} ${t('selected')}`
                  : t('all')}
              </span>
              <CaretDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isPropertyTypeOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Collapsible Selection List */}
            {isPropertyTypeOpen && (
              <div className="mt-1 bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = filters.propertyTypes.includes(type.value);
                  
                  return (
                    <button
                      key={type.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePropertyType(type.value);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                        ${isSelected ? 'bg-cream-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} weight="regular" className={isSelected ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'} />
                        <span>{type.label}</span>
                      </div>
                      <Check 
                        size={16} 
                        weight="bold"
                        className={`transition-all duration-200 ${
                          isSelected 
                            ? 'text-primary-500 opacity-100' 
                            : 'text-gray-300 dark:text-gray-600 opacity-0'
                        }`} 
                      />
                    </button>
                  );
                })}
      </div>

              {/* Clear selection button */}
              {filters.propertyTypes.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange('propertyTypes', []);
                    }}
                    className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {t('clearSelection')}
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Construction Status - After Transaction Type */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('constructionStatus')}
        </h3>
          <div className="relative" ref={constructionRef}>
            <button
              type="button"
              onClick={() => setIsConstructionOpen(!isConstructionOpen)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl 
                bg-white dark:bg-gray-800/50 cursor-pointer flex items-center justify-between
                focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <span className={filters.constructionStatus ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {filters.constructionStatus
                  ? constructionStatuses.find(s => s.value === filters.constructionStatus)?.label
                  : t('all')}
              </span>
              <CaretDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isConstructionOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isConstructionOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    handleFilterChange('constructionStatus', '');
                    setIsConstructionOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                    ${!filters.constructionStatus ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{t('all')}</span>
                  {!filters.constructionStatus && <Check size={14} className="text-primary-500" />}
                </button>
                {constructionStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      handleFilterChange('constructionStatus', status.value);
                      setIsConstructionOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                      ${filters.constructionStatus === status.value ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span>{status.label}</span>
                    {filters.constructionStatus === status.value && <Check size={14} className="text-primary-500" />}
            </button>
          ))}
              </div>
            )}
          </div>
        </div>

        {/* Floor - Custom Dropdown */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('floor')}
          </h3>
          <div className="relative" ref={floorRef}>
            <button
              type="button"
              onClick={() => setIsFloorOpen(!isFloorOpen)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl 
                bg-white dark:bg-gray-800/50 cursor-pointer flex items-center justify-between
                focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <span className={filters.floor ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {filters.floor
                  ? floorOptions.find(f => f.value === filters.floor)?.label
                  : t('all')}
              </span>
              <CaretDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isFloorOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isFloorOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    handleFilterChange('floor', '');
                    setIsFloorOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                    ${!filters.floor ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{t('all')}</span>
                  {!filters.floor && <Check size={14} className="text-primary-500" />}
                </button>
                {floorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      console.log('Floor option clicked:', option.value);
                      handleFilterChange('floor', option.value);
                      setIsFloorOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                      ${filters.floor === option.value ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span>{option.label}</span>
                    {filters.floor === option.value && <Check size={14} className="text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

        {/* Furniture Status */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('furniture')}
        </h3>
          <div className="relative" ref={furnitureRef}>
            <button
              type="button"
              onClick={() => setIsFurnitureOpen(!isFurnitureOpen)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl 
                bg-white dark:bg-gray-800/50 cursor-pointer flex items-center justify-between
                focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <span className={filters.furniture ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                {filters.furniture
                  ? furnitureOptions.find(f => f.value === filters.furniture)?.label
                  : t('all')}
              </span>
              <CaretDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isFurnitureOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isFurnitureOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    handleFilterChange('furniture', '');
                    setIsFurnitureOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                    ${!filters.furniture ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span>{t('all')}</span>
                  {!filters.furniture && <Check size={14} className="text-primary-500" />}
                </button>
                {furnitureOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange('furniture', option.value);
                      setIsFurnitureOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between
                      ${filters.furniture === option.value ? 'bg-cream-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span>{option.label}</span>
                    {filters.furniture === option.value && <Check size={14} className="text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bedrooms - Multi-Select Grid */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('bedrooms')}
            {filters.bedrooms.length > 0 && (
              <span className="ml-2 text-xs text-primary-500">({filters.bedrooms.length})</span>
            )}
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {bedroomOptions.map((option) => {
              const isSelected = filters.bedrooms.includes(option);
              return (
            <button
              key={option}
                  onClick={() => toggleBedrooms(option)}
                  className={`px-2 py-1.5 text-xs rounded-lg border transition-all flex items-center justify-center ${
                    isSelected
                  ? 'bg-primary-400 text-white border-primary-400'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'
                }`}
              >
                  <span>{option}</span>
                  {isSelected && <Check size={12} className="ml-1" />}
              </button>
              );
            })}
          </div>
          {filters.bedrooms.length > 0 && (
            <button
              onClick={() => handleFilterChange('bedrooms', [])}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mt-2 py-1"
            >
              {t('clearSelection')}
            </button>
          )}
        </div>

        {/* Bathrooms - Multi-Select Grid */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('bathrooms')}
            {filters.bathrooms.length > 0 && (
              <span className="ml-2 text-xs text-primary-500">({filters.bathrooms.length})</span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {bathroomOptions.map((option) => {
              const isSelected = filters.bathrooms.includes(option);
              return (
              <button
                key={option}
                  onClick={() => toggleBathrooms(option)}
                  className={`px-2 py-1.5 text-xs rounded-lg border transition-all flex items-center justify-center ${
                    isSelected
                    ? 'bg-primary-400 text-white border-primary-400'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'
                }`}
              >
                  <span>{option}</span>
                  {isSelected && <Check size={12} className="ml-1" />}
              </button>
              );
            })}
          </div>
          {filters.bathrooms.length > 0 && (
            <button
              onClick={() => handleFilterChange('bathrooms', [])}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mt-2 py-1"
            >
              {t('clearSelection')}
            </button>
          )}
      </div>

        {/* Amenities - Ultra Compact */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {t('amenities')}
        </h3>
          <div className="space-y-1.5">
            {amenities.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = filters.amenities.includes(amenity.id);
              
              return (
            <label
              key={amenity.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs
                    transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${isSelected ? 'bg-cream-100 dark:bg-primary-900/20' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} weight="regular" className={isSelected ? 'text-primary-500' : 'text-gray-400'} />
                    <span className={isSelected ? 'text-primary-700 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                  {amenity.label}
                </span>
              </div>
              
                  {/* Compact Toggle */}
                  <div 
                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-all duration-200
                      ${isSelected ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleAmenity(amenity.id);
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm
                      ${isSelected ? 'translate-x-4' : 'translate-x-0'}`} 
                    />
                </div>
              </label>
              );
            })}
          </div>
        </div>

        {/* Area Size - Custom Dual Range Slider */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('area')} (m²)
          </h3>
          <div className="space-y-3">
            {/* Custom Slider */}
            <div className="relative h-6 flex items-center px-2">
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                {/* Active Track */}
                <div 
                  className="absolute h-2 bg-primary-400 rounded-full"
                  style={{
                    left: `${(filters.area[0] / 500) * 100}%`,
                    width: `${((filters.area[1] - filters.area[0]) / 500) * 100}%`
                  }}
                />
                </div>
                
              {/* Min Thumb */}
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-pointer shadow-md z-10 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${(filters.area[0] / 500) * 100}% - 8px)`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startValue = filters.area[0];
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLElement;
                    const rect = target?.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    
                    const deltaX = e.clientX - startX;
                    const percentChange = (deltaX / rect.width) * 100;
                    const valueChange = (percentChange / 100) * 500;
                    let newValue = Math.max(0, Math.min(filters.area[1] - 10, startValue + valueChange));
                    newValue = Math.round(newValue / 5) * 5; // Round to nearest 5
                    
                    handleFilterChange('area', [newValue, filters.area[1]]);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              {/* Max Thumb */}
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-pointer shadow-md z-10 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${(filters.area[1] / 500) * 100}% - 8px)`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startValue = filters.area[1];
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLElement;
                    const rect = target?.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    
                    const deltaX = e.clientX - startX;
                    const percentChange = (deltaX / rect.width) * 100;
                    const valueChange = (percentChange / 100) * 500;
                    let newValue = Math.max(filters.area[0] + 10, Math.min(500, startValue + valueChange));
                    newValue = Math.round(newValue / 5) * 5; // Round to nearest 5
                    
                    handleFilterChange('area', [filters.area[0], newValue]);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
                  </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <span className="text-gray-500 dark:text-gray-400">{t('min')}: </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{filters.area[0]} m²</span>
              </div>
              <div className="text-gray-400 dark:text-gray-500">—</div>
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <span className="text-gray-500 dark:text-gray-400">{t('max')}: </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{filters.area[1]} m²</span>
        </div>
      </div>
          </div>
        </div>

        {/* Results Count - Real-time */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('resultsUpdateAutomatically')}
          </p>
        </div>
      </div>
    </div>
  );
});

FiltersSidebar.displayName = 'FiltersSidebar';

export default FiltersSidebar; 