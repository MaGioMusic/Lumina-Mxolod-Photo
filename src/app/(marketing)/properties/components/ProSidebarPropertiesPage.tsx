'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProSidebarFilter from './ProSidebarFilter';
import PropertiesGrid from './PropertiesGrid';
import AppliedFiltersChips from './AppliedFiltersChips';
import useDebounced from './hooks/useDebounced';

// Updated FiltersState interface to match the enhanced version
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

import PropertyDetailsMap from './PropertyDetailsMap';

const ProSidebarPropertiesPage: React.FC = () => {
  const searchParams = useSearchParams();
  // Hydration-safe default: always start with 'grid' on first render.
  // Then, after mount, sync from URL/localStorage/effects.
  const [currentView, setCurrentView] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
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
    // Initialize new filters
    dateAdded: [null, null],
    quality: [],
  });

  // Debounced inputs for smoother filtering
  const debouncedQuery = useDebounced(searchQuery, 200);
  // Only debounce "continuous" range sliders; discrete toggles should feel instant.
  const debouncedPriceRange = useDebounced(filters.priceRange, 120);
  const debouncedAreaRange = useDebounced(filters.area, 120);

  // Mock: reuse filtering from PropertiesGrid by replicating minimal shape
  const allProperties = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    image: `/images/properties/property-${(((i * 7 + 3) % 15) + 1)}.jpg`,
    price: 100000 + (i * 4567) % 400000,
    address: ['vake','mtatsminda','saburtalo','isani','gldani'][i % 5],
    bedrooms: (i % 4) + 1,
    bathrooms: (i % 3) + 1,
    sqft: 50 + (i * 13) % 150,
    floor: (i % 20) + 1,
    type: ['apartment','house','villa','studio','penthouse'][i % 5],
    status: i % 2 === 0 ? 'for-sale' : 'for-rent',
  })), []);

  const filteredProperties = useMemo(() => {
    // basic filtering mirroring PropertiesGrid logic
    return allProperties.filter((p) => {
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase();
        if (!(`${p.address}`.toLowerCase().includes(q))) return false;
      }
      if (p.price < debouncedPriceRange[0] || p.price > debouncedPriceRange[1]) return false;
      if (filters.propertyTypes.length && !filters.propertyTypes.includes(p.type)) return false;
      if (filters.bedrooms.length) {
        const ok = filters.bedrooms.some((b) => b === '5+' ? p.bedrooms >= 5 : p.bedrooms === parseInt(b));
        if (!ok) return false;
      }
      if (filters.bathrooms.length) {
        const ok = filters.bathrooms.some((b) => b === '4+' ? p.bathrooms >= 4 : p.bathrooms === parseInt(b));
        if (!ok) return false;
      }
      if (p.sqft < debouncedAreaRange[0] || p.sqft > debouncedAreaRange[1]) return false;
      return true;
    });
  }, [allProperties, debouncedAreaRange, debouncedPriceRange, debouncedQuery, filters.bathrooms, filters.bedrooms, filters.propertyTypes]);

  // (Google map props გამორთულია დროებით — ვიყენებთ PropertyDetailsMap-ს)

  // Initialize from URL query params (location, type, minPrice, maxPrice)
  useEffect(() => {
    if (!searchParams) return;
    const locationParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || '';
    const minParam = Number(searchParams.get('minPrice') || '0');
    const maxParam = Number(searchParams.get('maxPrice') || '1000000');
    const viewParam = (searchParams.get('view') || '').toLowerCase();

    // Update search query if provided
    if (locationParam) {
      setSearchQuery(locationParam);
    }

    // Update filters based on params
    setFilters((prev) => ({
      ...prev,
      propertyTypes: typeParam ? [typeParam] : [],
      priceRange: [Number.isFinite(minParam) ? minParam : 0, Number.isFinite(maxParam) ? maxParam : prev.priceRange[1]],
    }));

    // Respect view param if provided
    if (viewParam === 'map' || viewParam === 'grid') setCurrentView(viewParam as any);
  }, [searchParams]);

  // Listen for view changes from Header
  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      setCurrentView(event.detail);
    };

    window.addEventListener('viewChange', handleViewChange as EventListener);
    return () => window.removeEventListener('viewChange', handleViewChange as EventListener);
  }, []);

  // Listen for AI-triggered view switch
  useEffect(() => {
    const onAiView = (e: Event) => {
      try {
        const det = (e as CustomEvent).detail || {};
        if (det && (det.view === 'map' || det.view === 'grid')) {
          setCurrentView(det.view);
          // reflect in URL for consistency
          try {
            const u = new URL(window.location.href);
            u.searchParams.set('view', det.view);
            window.history.replaceState(null, '', u.toString());
          } catch {}
        }
      } catch {}
    };
    window.addEventListener('lumina:view:set', onAiView as any);
    return () => window.removeEventListener('lumina:view:set', onAiView as any);
  }, []);

  // On mount: თუ URL-ში view არ წერია, ამოიკითხე localStorage და გამოიყენე
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const qpView = (u.searchParams.get('view') || '').toLowerCase();
      if (!qpView) {
        const saved = window.localStorage.getItem('lumina_view');
        if (saved === 'map' || saved === 'grid') {
          setCurrentView(saved as 'map' | 'grid');
          u.searchParams.set('view', saved);
          window.history.replaceState(null, '', u.toString());
        }
      }
    } catch {}
  }, []);

  // Persist current view both in localStorage and URL-ში
  useEffect(() => {
    try {
      window.localStorage.setItem('lumina_view', currentView);
      const u = new URL(window.location.href);
      u.searchParams.set('view', currentView);
      window.history.replaceState(null, '', u.toString());
    } catch {}
  }, [currentView]);

  // Inline handler now passed directly where needed


  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const handleRemoveChip = useCallback((keyOrObj: keyof FiltersState | 'search' | { arrayKey: keyof FiltersState; value: string }) => {
    if (keyOrObj === 'search') {
      setSearchQuery('');
      return;
    }
    if (typeof keyOrObj === 'object') {
      const { arrayKey, value } = keyOrObj;
      setFilters((prev) => ({
        ...prev,
        [arrayKey]: (prev[arrayKey] as string[]).filter((v) => v !== value),
      }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [keyOrObj]: Array.isArray(prev[keyOrObj]) ? ([] as any) : (keyOrObj === 'priceRange' ? [0, 1000000] : keyOrObj === 'area' ? [0, 10000] : '' as any)
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchQuery('');
    setFilters({
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
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000000 ||
      filters.propertyTypes.length ||
      filters.bedrooms.length ||
      filters.bathrooms.length ||
      filters.area[0] > 0 ||
      filters.area[1] < 10000 ||
      filters.amenities.length
    );
  }, [searchQuery, filters]);

  // When switching to Map view, reset filters/search and clean URL filter params
  useEffect(() => {
    if (currentView !== 'map') return;
    try {
      // Clear local UI state
      setSearchQuery('');
      setFilters({
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
      // Clean URL query of filter params, keep view=map
      const u = new URL(window.location.href);
      ['location','minPrice','maxPrice','rooms','status','property_type','sort'].forEach((k) => u.searchParams.delete(k));
      u.searchParams.set('view', 'map');
      window.history.replaceState(null, '', u.toString());
    } catch {}
  }, [currentView]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111111]">
        {/* Sidebar (sticky) */}
        <div className="flex-shrink-0 bg-white dark:bg-[#111111]">
          <div
            className="sticky top-16 h-[calc(100vh-4rem)] relative group overflow-y-auto overflow-x-hidden pr-2 bg-white dark:bg-[#111111]"
            style={{ scrollbarGutter: 'stable' }}
          >
            <ProSidebarFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Applied Filters (compact) */}
          {hasActiveFilters && (
            <div className="sticky top-16 z-10 p-2 bg-white/80 dark:bg-[#111111]/90 backdrop-blur border-b border-black/5 dark:border-white/10 relative">
              <AppliedFiltersChips 
                searchQuery={searchQuery}
                filters={filters}
                onRemove={handleRemoveChip}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          {/* Content - Grid or Map */}
          <div className="flex-1">
            {currentView === 'grid' ? (
              <div className="p-3">
                <PropertiesGrid 
                  searchQuery={searchQuery} 
                  filters={filters}
                  highlightedPropertyId={highlightedPropertyId}
                  onPropertyHighlight={setHighlightedPropertyId}
                />
              </div>
            ) : (
              <div className="h-[calc(100vh-6rem)]">
                <PropertyDetailsMap filters={filters} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        </div>
      {/* AI Chat mounted globally in layout */}
    </div>
  );
};

export default ProSidebarPropertiesPage; 
