'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PropertyCard from './PropertyCard';
import UploadPropertyModal from './UploadPropertyModal';
import LoginRegisterModal from '@/components/LoginRegisterModal';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMockProperties } from '@/lib/mockProperties';
import { logger } from '@/lib/logger';

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

interface PropertiesGridProps {
  searchQuery: string;
  filters: FiltersState;
  highlightedPropertyId?: number | null;
  onPropertyHighlight?: (propertyId: number | null) => void;
}

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  image: string;
  images?: string[];
  type: string;
}

// Shared mock properties util (deterministic for SSR/CSR parity)
const mockProperties = getMockProperties(100);

const PROPERTIES_PER_PAGE = 25;

export default function PropertiesGrid({ 
  searchQuery, 
  filters, 
  highlightedPropertyId, 
  onPropertyHighlight 
}: PropertiesGridProps) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  logger.log('PropertiesGrid received filters:', filters);

  // Allow AI tool to push ad-hoc filters via CustomEvent without full reload
  const [injectedFilters, setInjectedFilters] = useState<Partial<FiltersState> & { location?: string }>({});
  useEffect(() => {
    const onSet = (e: Event) => {
      try {
        const det: any = (e as CustomEvent).detail || {};
        setInjectedFilters(prev => ({ ...prev, ...det }));
      } catch {}
    };
    window.addEventListener('lumina:filters:set', onSet as any);
    return () => window.removeEventListener('lumina:filters:set', onSet as any);
  }, []);
  
  // Handle upload button click
  const handleUploadClick = () => {
    if (isAuthenticated) {
      setIsUploadModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };
  
  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsUploadModalOpen(true);
  };
  
  // Get current page from URL params
  const currentPage = parseInt(searchParams.get('page') || '1');
  const sortBy = searchParams.get('sort') || 'price';
  // Prefer URL 'location', fallback to prop searchQuery
  const locationParam = (searchParams.get('location') || injectedFilters.location || searchQuery || '').toString();
  // URL-driven overrides for filters (so navigation with query applies filters even on first load)
  const minParam = Number(searchParams.get('minPrice') || 'NaN');
  const maxParam = Number(searchParams.get('maxPrice') || 'NaN');
  const roomsParam = searchParams.get('rooms');
  const statusParam = (searchParams.get('status') || '').toString().toLowerCase();
  const propTypeParam = (searchParams.get('property_type') || '').toString().toLowerCase();

  // Normalize location to match internal district keys
  const districtKeys = ['vake', 'mtatsminda', 'saburtalo', 'isani', 'gldani'];
  const normalize = (s: string) => s.toLowerCase().trim();
  const normalizedInput = normalize(locationParam);
  let normalizedLocationKey: string | null = null;
  // Manual aliases for KA/RU to district keys (fallback if translations mismatch)
  const districtAliasMap: Record<string, string> = {
    // Georgian
    'ვაკე': 'vake',
    'მთაწმინდა': 'mtatsminda',
    'საბურთალო': 'saburtalo',
    'ისანი': 'isani',
    'გლდანი': 'gldani',
    // Russian (common forms)
    'ваке': 'vake',
    'мтацминда': 'mtatsminda',
    'сабуртало': 'saburtalo',
    'исани': 'isani',
    'глдани': 'gldani',
  };
  if (districtAliasMap[normalizedInput]) {
    normalizedLocationKey = districtAliasMap[normalizedInput];
  }
  for (const key of districtKeys) {
    const localized = normalize(t(key));
    if (normalizedInput === key || normalizedInput === localized || localized.includes(normalizedInput) || key.includes(normalizedInput)) {
      normalizedLocationKey = key;
      break;
    }
  }
  
  // Filter and sort properties first
  // Merge injected filters (partial) over incoming props filters
  // Build URL-based overrides (only if present)
  const urlOverrides: Partial<FiltersState> = {};
  if (Number.isFinite(minParam) || Number.isFinite(maxParam)) {
    urlOverrides.priceRange = [
      Number.isFinite(minParam) ? Number(minParam) : filters.priceRange[0],
      Number.isFinite(maxParam) ? Number(maxParam) : filters.priceRange[1],
    ];
  }
  if (roomsParam && /^\d+$/.test(roomsParam)) {
    const r = Number(roomsParam);
    urlOverrides.bedrooms = [r >= 5 ? '5+' : String(r)];
  }
  if (propTypeParam && ['apartment','house','villa','studio','penthouse'].includes(propTypeParam)) {
    urlOverrides.propertyTypes = [propTypeParam];
  }

  const effectiveFilters: FiltersState = {
    ...filters,
    priceRange: [
      urlOverrides.priceRange?.[0] ?? injectedFilters.priceRange?.[0] ?? filters.priceRange[0],
      urlOverrides.priceRange?.[1] ?? injectedFilters.priceRange?.[1] ?? filters.priceRange[1],
    ],
    bedrooms: urlOverrides.bedrooms ?? injectedFilters.bedrooms ?? filters.bedrooms,
    bathrooms: injectedFilters.bathrooms ?? filters.bathrooms,
    propertyTypes: injectedFilters.propertyTypes ?? filters.propertyTypes,
    transactionType: injectedFilters.transactionType ?? filters.transactionType,
    constructionStatus: injectedFilters.constructionStatus ?? filters.constructionStatus,
    floor: injectedFilters.floor ?? filters.floor,
    furniture: injectedFilters.furniture ?? filters.furniture,
    area: injectedFilters.area ?? filters.area,
    amenities: injectedFilters.amenities ?? filters.amenities,
  };

  logger.debug('Starting filter with:', effectiveFilters);
  logger.debug('Total properties before filter:', mockProperties.length);
  
  const filteredProperties = mockProperties
    .filter(property => {
      // Location filter (supports KA/EN/RU names and keys)
      if (normalizedInput) {
        if (normalizedLocationKey) {
          if (property.address !== normalizedLocationKey) return false;
        } else {
          // Fallback: compare against translated address string contains
          const translatedAddress = `${t('tbilisi')}, ${t(property.address)}`.toLowerCase();
          if (!translatedAddress.includes(normalizedInput)) return false;
        }
      }

      // Status filter via URL (for-sale / for-rent)
      if (statusParam === 'for-sale' || statusParam === 'for-rent') {
        if (property.status !== statusParam) return false;
      }
      
      // Price filter
      if (property.price < effectiveFilters.priceRange[0] || property.price > effectiveFilters.priceRange[1]) {
        if (property.id <= 5) {
          logger.debug(`Property ${property.id}: price=${property.price}, range=[${effectiveFilters.priceRange[0]}, ${effectiveFilters.priceRange[1]}]`);
        }
        return false;
      }
      
      // Property type filter - now checks if property type is in the selected types array
      if (effectiveFilters.propertyTypes.length > 0 && !effectiveFilters.propertyTypes.includes(property.type)) {
        return false;
      }
      
      // Bedrooms filter - now handles array of selected bedroom counts
      if (effectiveFilters.bedrooms.length > 0) {
        const propertyMatches = effectiveFilters.bedrooms.some(bedroomFilter => {
          const bedroomCount = bedroomFilter === '5+' ? 5 : parseInt(bedroomFilter);
          if (bedroomFilter === '5+') {
            return property.bedrooms >= 5;
          } else {
            return property.bedrooms === bedroomCount;
          }
        });
        if (!propertyMatches) return false;
      }
      
      // Bathrooms filter - now handles array of selected bathroom counts
      if (effectiveFilters.bathrooms.length > 0) {
        const propertyMatches = effectiveFilters.bathrooms.some(bathroomFilter => {
          const bathroomCount = bathroomFilter === '4+' ? 4 : parseInt(bathroomFilter);
          if (bathroomFilter === '4+') {
            return property.bathrooms >= 4;
          } else {
            return property.bathrooms === bathroomCount;
          }
        });
        if (!propertyMatches) return false;
      }
      
      // Area filter
      if (property.sqft < effectiveFilters.area[0] || property.sqft > effectiveFilters.area[1]) {
        return false;
      }
      
      // Amenities filter - property must have ALL selected amenities
      if (effectiveFilters.amenities.length > 0) {
        const hasAllAmenities = effectiveFilters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      
      // Floor filter
      if (effectiveFilters.floor) {
        const propertyFloor = property.floor || 0;
        
        // Debug log for first few properties
        if (property.id <= 5) {
          logger.debug(`Property ${property.id}: floor=${propertyFloor}, filter=${filters.floor}`);
        }
        
        switch(effectiveFilters.floor) {
          case 'first': 
            if (propertyFloor !== 1) return false;
            break;
          case 'last': 
            if (propertyFloor < 10) return false; // Assuming 10+ is last floor
            break;
          case 'middle': 
            if (propertyFloor <= 1 || propertyFloor >= 10) return false;
            break;
          case '1-5': 
            if (propertyFloor < 1 || propertyFloor > 5) return false;
            break;
          case '6-10': 
            if (propertyFloor < 6 || propertyFloor > 10) return false;
            break;
          case '11-15': 
            if (propertyFloor < 11 || propertyFloor > 15) return false;
            break;
          case '16+': 
            if (propertyFloor < 16) return false;
            break;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // First, prioritize highlighted property
      if (highlightedPropertyId) {
        if (a.id === highlightedPropertyId && b.id !== highlightedPropertyId) return -1;
        if (b.id === highlightedPropertyId && a.id !== highlightedPropertyId) return 1;
      }
      
      // Then apply regular sorting
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'size': return b.sqft - a.sqft;
        default: return a.price - b.price;
      }
    });
  
  logger.debug('Total properties after filter:', filteredProperties.length);
  logger.debug('Floor filter value:', effectiveFilters.floor);
  
  // Calculate pagination based on filtered results
  const totalProperties = filteredProperties.length;
  const totalPages = Math.ceil(totalProperties / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  

  
  const currentProperties = filteredProperties.slice(startIndex, endIndex);
  
  // Update URL without page reload
  const updateURL = (newParams: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    
    // Use shallow routing - same page, URL update only
    const newURL = `${pathname}?${current.toString()}`;
    window.history.pushState(null, '', newURL);
  };
  
  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateURL({ page: page.toString() });
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };
  
  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <>
    <div className="space-y-3">
      {/* Results Summary - compact */}
      <div className="flex justify-between items-center py-1">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('showing')} {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} {t('of')} {filteredProperties.length} {t('propertiesCount')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </p>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {currentProperties.map((property) => {
          // Debug log for first few properties
          if (property.id <= 5) {
            logger.debug(`Property ${property.id}:`, {
              type: property.type,
              status: property.status,
              isNew: property.isNew
            });
          }
          
          return (
          <PropertyCard
            key={property.id}
            id={property.id.toString()}
            image={property.image}
            images={property.images}
            price={`$${property.price.toLocaleString()}`}
            address={`${t('tbilisi')}, ${t(property.address)}`}
            title={`${property.type} in ${t(property.address)}`}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            sqft={property.sqft}
            floor={property.floor}
            area={`${property.sqft} მ²`}
            type={property.type}
            status={property.status}
            isNew={property.isNew}
            isHighlighted={highlightedPropertyId === property.id}
            onHighlight={() => onPropertyHighlight?.(property.id)}
          />
          );
        })}
      </div>

      {/* Pagination - Compact Version */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 mt-6">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              currentPage === 1
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {t('previous')}
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-8 h-8 text-sm rounded-md border transition-all ${
                currentPage === pageNum
                  ? 'bg-[#F08336] text-white border-[#F08336] font-medium'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Show dots if there are more pages */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-1 text-gray-400 dark:text-gray-500 text-sm">...</span>
          )}

          {/* Last page if not visible */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => goToPage(totalPages)}
              className="w-8 h-8 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              {totalPages}
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {t('next')}
          </button>
        </div>
      )}

      {/* Quick Jump */}
      {totalPages > 10 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">{t('goToPage')}:</span>
          <input
            type="number"
            min="1"
            max={totalPages.toString()}
            value={currentPage.toString()}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                goToPage(page);
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-center text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">/ {totalPages}</span>
        </div>
      )}
    </div>

    {/* Upload Property Modal */}
    <UploadPropertyModal 
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
    />

    {/* Login Register Modal */}
    <LoginRegisterModal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      onSuccess={handleLoginSuccess}
    />
  </>
  );
} 
