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
import dynamic from 'next/dynamic';
const GoogleMapView = dynamic(() => import('./GoogleMapView'), { ssr: false });

const ProSidebarPropertiesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'map'>(
    (typeof window !== 'undefined' && (new URL(window.location.href)).searchParams.get('view') === 'map') ? 'map' : 'grid'
  );
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
  const debouncedQuery = useDebounced(searchQuery, 250);
  const debouncedFilters = useDebounced(filters, 250);

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
      if (p.price < debouncedFilters.priceRange[0] || p.price > debouncedFilters.priceRange[1]) return false;
      if (debouncedFilters.propertyTypes.length && !debouncedFilters.propertyTypes.includes(p.type)) return false;
      if (debouncedFilters.bedrooms.length) {
        const ok = debouncedFilters.bedrooms.some((b) => b === '5+' ? p.bedrooms >= 5 : p.bedrooms === parseInt(b));
        if (!ok) return false;
      }
      if (debouncedFilters.bathrooms.length) {
        const ok = debouncedFilters.bathrooms.some((b) => b === '4+' ? p.bathrooms >= 4 : p.bathrooms === parseInt(b));
        if (!ok) return false;
      }
      if (p.sqft < debouncedFilters.area[0] || p.sqft > debouncedFilters.area[1]) return false;
      return true;
    });
  }, [allProperties, debouncedFilters, debouncedQuery]);

  // Deterministic coordinates per district and id (for Google Map mock pins)
  const googleMapProps = useMemo(() => {
    const districtToCenter: Record<string, { lat: number; lng: number }> = {
      vake: { lat: 41.7151, lng: 44.7661 },
      mtatsminda: { lat: 41.7006, lng: 44.7930 },
      saburtalo: { lat: 41.7296, lng: 44.7489 },
      isani: { lat: 41.7442, lng: 44.8275 },
      gldani: { lat: 41.7884, lng: 44.8122 },
    };
    return filteredProperties.map((p) => {
      const center = districtToCenter[p.address] || { lat: 41.7151, lng: 44.7661 };
      // small deterministic offset based on id to avoid exact overlap
      const dx = ((p.id % 7) - 3) * 0.0015;
      const dy = ((p.id % 5) - 2) * 0.0015;
      return {
        id: p.id,
        coordinates: [center.lat + dy, center.lng + dx] as [number, number],
      };
    });
  }, [filteredProperties]);

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

  // Inline handler now passed directly where needed

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar (sticky) */}
        <div className="flex-shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-auto pr-2 relative group">
            <ProSidebarFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isCollapsed={isCollapsed}
              onToggleCollapse={handleToggleCollapse}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            {/* Floating chevron handle - expand when collapsed */}
            {isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand filters"
                title="Expand filters"
                className="absolute top-1/2 -right-3 -translate-y-1/2 w-8 h-8 rounded-full bg-orange-500 text-white shadow-md opacity-80 hover:opacity-100 focus:opacity-100 transition flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Applied Filters (compact) */}
          <div className="sticky top-16 z-10 p-2 border-b border-gray-200 bg-white/70 dark:bg-gray-900/60 backdrop-blur relative">
            <AppliedFiltersChips 
              searchQuery={searchQuery}
              filters={filters}
              onRemove={handleRemoveChip}
              onClearAll={handleClearAll}
            />
          </div>

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
                {(process.env.NEXT_PUBLIC_MAPS_PROVIDER === 'google') ? (
                  <GoogleMapView
                    properties={googleMapProps}
                    zoom={12}
                    onPropertyHighlight={(id) => setHighlightedPropertyId(Number(id))}
                  />
                ) : (
                  <PropertyDetailsMap filters={filters} searchQuery={searchQuery} />
                )}
              </div>
            )}
          </div>
        </div>
      {/* AI Chat mounted globally in layout */}
    </div>
  );
};

export default ProSidebarPropertiesPage; 