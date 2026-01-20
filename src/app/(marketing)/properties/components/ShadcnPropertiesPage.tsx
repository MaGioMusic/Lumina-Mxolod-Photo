'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShadcnFilterSidebar from './ShadcnFilterSidebar';
import PropertiesGrid from './PropertiesGrid';
import SearchHeader from './SearchHeader';
import { SlidersHorizontal } from '@phosphor-icons/react';

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

interface ShadcnPropertiesPageProps {
  className?: string;
}

const ShadcnPropertiesPage: React.FC<ShadcnPropertiesPageProps> = ({ className = '' }) => {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    // Here you would typically update the properties list based on filters
    console.log('Filters updated:', newFilters);
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
    <div className={`min-h-screen bg-background ${className}`}>
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex h-screen w-full">
          {/* Desktop Sidebar */}
          <ShadcnFilterSidebar 
            onFiltersChange={handleFiltersChange}
            className="hidden md:flex"
          />
          
          {/* Main Content */}
          <SidebarInset className="flex-1 flex flex-col">
            {/* Header with Mobile Filter Toggle */}
            <header className="sticky top-0 z-10 bg-background border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="md:hidden flex items-center gap-2"
                    onClick={() => {
                      // This will open mobile filter drawer
                      // We'll implement this next
                    }}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('filters')}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {/* Property count will go here */}
                  {t('properties')}: 156
                </div>
              </div>
            </header>

            {/* Search Header */}
            <div className="p-4 border-b">
              <SearchHeader 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onFiltersToggle={() => {
                  // Mobile filter toggle handler
                  console.log('Toggle mobile filters');
                }}
              />
            </div>

            {/* Properties Grid */}
            <main className="flex-1 p-4 overflow-auto">
              <PropertiesGrid 
                searchQuery={searchQuery}
                filters={filters}
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ShadcnPropertiesPage; 