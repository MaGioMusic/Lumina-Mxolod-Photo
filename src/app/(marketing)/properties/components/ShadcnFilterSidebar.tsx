'use client';

import React, { useState, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { House, Buildings, Car, SwimmingPool, Barbell, Plant, SlidersHorizontal, X } from '@phosphor-icons/react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface ShadcnFilterSidebarProps {
  onFiltersChange: (filters: FiltersState) => void;
  className?: string;
}

const ShadcnFilterSidebar: React.FC<ShadcnFilterSidebarProps> = memo(({ 
  onFiltersChange,
  className = ''
}) => {
  const { t } = useLanguage();
  
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
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ₾`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K ₾`;
    }
    return `${price} ₾`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.bathrooms.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.transactionType) count++;
    if (filters.constructionStatus) count++;
    if (filters.floor) count++;
    if (filters.furniture) count++;
    if (filters.area[0] > 0 || filters.area[1] < 500) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Sidebar collapsible="icon" className={cn("border-r", className)}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">
              {t('filters')}
            </span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="group-data-[collapsible=icon]:hidden">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="group-data-[collapsible=icon]:hidden"
              >
                <X className="h-4 w-4 mr-1" />
                {t('clearAll')}
              </Button>
            )}
            <SidebarTrigger className="h-8 w-8" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* Price Range */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('priceRange')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <div className="space-y-3">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                max={1000000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Property Types */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('propertyType')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { value: 'apartment', icon: Buildings, label: t('apartment') },
                { value: 'house', icon: House, label: t('house') },
                { value: 'commercial', icon: Buildings, label: t('commercial') }
              ].map(({ value, icon: Icon, label }) => (
                <SidebarMenuItem key={value}>
                  <SidebarMenuButton
                    onClick={() => toggleArrayFilter('propertyTypes', value)}
                    isActive={filters.propertyTypes.includes(value)}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bedrooms */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('bedrooms')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5+'].map((bedroom) => (
                <Button
                  key={bedroom}
                  variant={filters.bedrooms.includes(bedroom) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter('bedrooms', bedroom)}
                  className="text-xs"
                >
                  {bedroom}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bathrooms */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('bathrooms')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5+'].map((bathroom) => (
                <Button
                  key={bathroom}
                  variant={filters.bathrooms.includes(bathroom) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter('bathrooms', bathroom)}
                  className="text-xs"
                >
                  {bathroom}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Area Range */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('area')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <div className="space-y-3">
              <Slider
                value={filters.area}
                onValueChange={(value) => handleFilterChange('area', value as [number, number])}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.area[0]} m²</span>
                <span>{filters.area[1]} m²</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Amenities */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('amenities')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { value: 'parking', icon: Car, label: t('parking') },
                { value: 'pool', icon: SwimmingPool, label: t('pool') },
                { value: 'gym', icon: Barbell, label: t('gym') },
                { value: 'garden', icon: Plant, label: t('garden') }
              ].map(({ value, icon: Icon, label }) => (
                <SidebarMenuItem key={value}>
                  <SidebarMenuButton
                    onClick={() => toggleArrayFilter('amenities', value)}
                    isActive={filters.amenities.includes(value)}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Transaction Type */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            <span className="group-data-[collapsible=icon]:hidden">{t('transactionType')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
            <Select value={filters.transactionType} onValueChange={(value) => handleFilterChange('transactionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectTransactionType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">{t('sale')}</SelectItem>
                <SelectItem value="rent">{t('rent')}</SelectItem>
                <SelectItem value="daily">{t('dailyRent')}</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
});

ShadcnFilterSidebar.displayName = 'ShadcnFilterSidebar';

export default ShadcnFilterSidebar; 