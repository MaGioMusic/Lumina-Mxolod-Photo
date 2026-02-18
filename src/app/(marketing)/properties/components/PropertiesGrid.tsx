'use client';

import { useRef, useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import PropertyCard from './PropertyCard';
import UploadPropertyModal from './UploadPropertyModal';
import LoginRegisterModal from '@/components/LoginRegisterModal';
import { emitPageSnapshotNow } from '@/app/components/PageSnapshotEmitter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMockProperties } from '@/lib/mockProperties';
import { logger } from '@/lib/logger';
import type { Property as ApiProperty } from '@/types/models';

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
  slug: string;
  title: string;
  price: number;
  address: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor?: number;
  image: string;
  images?: string[];
  type: string;
  status: string;
  isNew?: boolean;
  amenities: string[];
  currency?: string;
}

// Shared mock properties util (deterministic for SSR/CSR parity)
const mockProperties = getMockProperties(100);
const fallbackProperties: Property[] = mockProperties.map((property) => ({
  id: property.id,
  // IMPORTANT: keep ids consistent with /api/properties mock ids
  slug: `mock-${property.id}`,
  title: `Property #${property.id}`,
  price: property.price,
  address: property.address,
  location: property.address,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  sqft: property.sqft,
  floor: property.floor,
  image: property.image,
  images: property.images,
  type: property.type,
  status: property.status,
  isNew: property.isNew,
  amenities: property.amenities ?? [],
  currency: 'GEL',
}));

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
  const pathname = usePathname();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiProperties, setApiProperties] = useState<Property[] | null>(null);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const convertProperty = (item: ApiProperty, index: number): Property => {
    const priceValue = Number(item.price ?? 0);
    const areaValue = Number(item.area ?? 0);
    const fallbackImageIndex = ((index * 7 + 3) % 15) + 1;
    const district = (item.district ?? item.city ?? 'tbilisi').toLowerCase();
    return {
      id: index + 1,
      slug: item.id,
      title: item.title ?? `${item.propertyType ?? 'property'} • ${item.city ?? 'Tbilisi'}`,
      price: Number.isFinite(priceValue) ? priceValue : 0,
      address: district,
      location: (item.location ?? `${item.city ?? ''} ${item.district ?? ''}`).trim() || district,
      bedrooms: item.bedrooms ?? 0,
      bathrooms: item.bathrooms ?? 0,
      sqft: Number.isFinite(areaValue) ? areaValue : 0,
      floor: item.floor ?? undefined,
      image:
        item.imageUrls && item.imageUrls.length > 0
          ? item.imageUrls[0]
          : `/images/properties/property-${fallbackImageIndex}.jpg`,
      images: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : undefined,
      type: item.propertyType ?? 'apartment',
      status: item.transactionType === 'rent' ? 'for-rent' : 'for-sale',
      isNew: Boolean(item.isFeatured),
      amenities: item.amenities ?? [],
      currency: item.currency ?? 'GEL',
    };
  };

  const formatPrice = (property: Property) => {
    const symbol = (() => {
      switch (property.currency) {
        case 'USD':
          return '$';
        case 'EUR':
          return '€';
        case 'RUB':
          return '₽';
        case 'GEL':
        default:
          return '₾';
      }
    })();
    return `${symbol}${Math.round(property.price).toLocaleString()}`;
  };
  
  logger.log('PropertiesGrid received filters:', filters);

  // Allow AI tool to push ad-hoc filters via CustomEvent without full reload
  // only when explicitly enabled.
  const allowAiToolSideEffects = process.env.NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS === '1';
  const [injectedFilters, setInjectedFilters] = useState<Partial<FiltersState> & { location?: string }>({});
  useEffect(() => {
    if (!allowAiToolSideEffects) return;

    const onSet = (e: Event) => {
      try {
        const det: any = (e as CustomEvent).detail || {};
        setInjectedFilters(prev => ({ ...prev, ...det }));
      } catch {}
    };
    window.addEventListener('lumina:filters:set', onSet as any);
    return () => window.removeEventListener('lumina:filters:set', onSet as any);
  }, [allowAiToolSideEffects]);

  // Injected AI filters should be one-shot (or short-lived), otherwise they can
  // keep overriding user-cleared filters and make the list appear to "disappear".
  useEffect(() => {
    if (!Object.keys(injectedFilters).length) return;
    const t = window.setTimeout(() => setInjectedFilters({}), 1800);
    return () => window.clearTimeout(t);
  }, [injectedFilters]);
  
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
  const currentPage = parseInt(searchParams?.get('page') || '1');
  // Prefer URL 'location', fallback to prop searchQuery
  const locationParam = (searchParams?.get('location') || injectedFilters.location || searchQuery || '').toString();
  // URL-driven overrides for filters (so navigation with query applies filters even on first load)
  const minParam = Number(searchParams?.get('minPrice') || 'NaN');
  const maxParam = Number(searchParams?.get('maxPrice') || 'NaN');
  const roomsParam = searchParams?.get('rooms');
  const statusParam = (searchParams?.get('status') || '').toString().toLowerCase();
  const propTypeParam = (searchParams?.get('property_type') || '').toString().toLowerCase();

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

  // Stable scalar keys for effect dependencies (არ ვაყენებთ მთლიან ობიექტს/მასივებს, რომ უსასრულო რერენდერები არ მივიღოთ)
  const [minPrice, maxPrice] = effectiveFilters.priceRange;
  const bedroomsKey = effectiveFilters.bedrooms.join(',');
  const propertyTypeKey = effectiveFilters.propertyTypes[0] ?? '';
  const transactionTypeKey = effectiveFilters.transactionType;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set('page', '1');
    // এক გვერდზე მაქსიმუმ 60 ობიექტს ვითხოვთ — ეს ემთხვევა API-ის Zod ლიმიტს (max 60)
    params.set('pageSize', '60');

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    if (minPrice > 0) params.set('priceMin', Math.round(minPrice).toString());
    if (maxPrice < 1_000_000) params.set('priceMax', Math.round(maxPrice).toString());

    if (propertyTypeKey) {
      params.set('propertyType', propertyTypeKey);
    }

    if (transactionTypeKey) {
      params.set('transactionType', transactionTypeKey === 'for-rent' ? 'rent' : 'sale');
    }

    if (bedroomsKey) {
      const parts = bedroomsKey.split(',');
      const last = parts[parts.length - 1];
      const parsed = last === '5+' ? 5 : parseInt(last, 10);
      if (!Number.isNaN(parsed)) params.set('bedrooms', parsed.toString());
    }

    setIsFetching(true);
    fetch(`/api/properties?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error('ვერ მოხერხდა უძრავი ქონების ჩამოტვირთვა');
        }
        return res.json() as Promise<{ items: ApiProperty[]; total: number }>;
      })
      .then((payload) => {
        const mapped = payload.items.map((item, index) => convertProperty(item, index));

        // Dev UX safeguard: if DB is empty and user has no active search/filters,
        // keep showing local fallback cards instead of swapping to a blank list.
        const hasActiveQueryOrFilters = Boolean(
          searchQuery.trim() || propertyTypeKey || transactionTypeKey || bedroomsKey || minPrice > 0 || maxPrice < 1_000_000,
        );
        if (mapped.length === 0 && !hasActiveQueryOrFilters) {
          setApiProperties(null);
          setApiTotal(null);
          setFetchError(null);
          return;
        }

        setApiProperties(mapped);
        setApiTotal(payload.total ?? mapped.length);
        setFetchError(null);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') return;
        console.error('Failed to fetch properties', error);
        setFetchError((error as Error)?.message ?? 'დაფიქსირდა პრობლემა მონაცემების მიღებისას');
        setApiProperties(null);
      })
      .finally(() => setIsFetching(false));

    return () => controller.abort();
  }, [searchQuery, minPrice, maxPrice, propertyTypeKey, transactionTypeKey, bedroomsKey]);

  const propertiesDataset = apiProperties ?? fallbackProperties;

  logger.debug('Starting filter with:', effectiveFilters);
  logger.debug('Total properties before filter:', propertiesDataset.length);
  
  const filteredProperties = propertiesDataset

  logger.debug('Floor filter value:', effectiveFilters.floor);
  
  // Calculate pagination based on filtered results
  const totalProperties = apiTotal ?? filteredProperties.length;
  const totalPages = Math.ceil(totalProperties / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  

  
  const currentProperties = filteredProperties.slice(startIndex, endIndex);
  const lastAiListingSnapshotKeyRef = useRef<string>('');

  // Broadcast a lightweight listing snapshot to the AI session (if any) via BroadcastChannel.
  // This helps the model "see" what is actually available on the listing page.
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const preview = currentProperties.slice(0, 10).map((p) => ({
        id: String(p.slug || p.id),
        title: p.title,
        price: p.price,
        currency: p.currency ?? 'GEL',
        location: p.location,
        address: p.address,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.sqft,
        type: p.type,
        status: p.status,
        isNew: Boolean(p.isNew),
      }));

      // De-dupe: StrictMode / rerenders can cause the same snapshot to be emitted twice.
      const key = (() => {
        try {
          const ids = preview.map((x) => x.id).join(',');
          return [
            totalProperties,
            currentPage,
            locationParam || '',
            Number.isFinite(minPrice) ? String(minPrice) : '',
            Number.isFinite(maxPrice) ? String(maxPrice) : '',
            statusParam || '',
            propTypeParam || '',
            roomsParam || '',
            ids,
          ].join('|');
        } catch {
          return '';
        }
      })();
      if (key && key === lastAiListingSnapshotKeyRef.current) return;
      lastAiListingSnapshotKeyRef.current = key;

      emitPageSnapshotNow({
        page: 'properties',
        title: document.title,
        summary: `Showing ${startIndex + 1}-${Math.min(endIndex, totalProperties)} of ${totalProperties}`,
        data: {
          kind: 'properties_listing',
          total_count: totalProperties,
          page: currentPage,
          page_size: PROPERTIES_PER_PAGE,
          showing_from: startIndex + 1,
          showing_to: Math.min(endIndex, totalProperties),
          filters: {
            location: (normalizedLocationKey || locationParam) || undefined,
            minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
            maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
            status: statusParam || undefined,
            property_type: propTypeParam || undefined,
            rooms: roomsParam || undefined,
          },
          results_preview: preview,
        },
      });
    } catch {}
    // Keep updates scoped: only when the visible list/page/filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, startIndex, endIndex, filteredProperties.length, locationParam, minPrice, maxPrice, statusParam, propTypeParam, roomsParam, currentProperties]);
  
  // Update URL without page reload
  const updateURL = (newParams: Record<string, string>) => {
    const current = new URLSearchParams(searchParams?.toString() || '');
    
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
          {t('showing')} {startIndex + 1}-{Math.min(endIndex, totalProperties)} {t('of')} {totalProperties} {t('propertiesCount')}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </p>
          <button
            type="button"
            onClick={handleUploadClick}
            className="h-8 px-3 rounded-md text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('uploadProperty') || 'ქონების ატვირთვა'}
          </button>
        </div>
      </div>
      {isFetching && (
        <p className="text-xs text-orange-500 dark:text-orange-300">{t('loading')}...</p>
      )}
      {fetchError && (
        <p className="text-xs text-red-500 dark:text-red-400">{fetchError}</p>
      )}

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

          const addressLabel = property.location || `${t('tbilisi')}, ${t(property.address)}`;

          return (
          <PropertyCard
            key={property.slug || property.id}
            id={property.id.toString()}
            slug={property.slug}
            image={property.image}
            images={property.images}
            price={formatPrice(property)}
            address={addressLabel}
            title={property.title || `${property.type} in ${addressLabel}`}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            sqft={property.sqft}
            floor={property.floor}
            area={property.sqft ? `${property.sqft} მ²` : undefined}
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
