'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { emitPageSnapshotNow } from '@/app/components/PageSnapshotEmitter';
import LoginRegisterModal from '@/components/LoginRegisterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import { getMockProperties } from '@/lib/mockProperties';
import type { Property as ApiProperty } from '@/types/models';

import usePropertiesGridDerivedState from './hooks/usePropertiesGridDerivedState';
import type { PropertiesFiltersState } from './hooks/propertiesFilters';
import PropertiesGridHeader from './PropertiesGridHeader';
import PropertiesGridPagination from './PropertiesGridPagination';
import PropertyCard from './PropertyCard';
import UploadPropertyModal from './UploadPropertyModal';

interface PropertiesGridProps {
  searchQuery: string;
  filters: GridFiltersState;
  highlightedPropertyId?: number | null;
  onPropertyHighlight?: (propertyId: number | null) => void;
}

type GridFiltersState = Omit<PropertiesFiltersState, 'dateAdded' | 'quality'> &
  Partial<Pick<PropertiesFiltersState, 'dateAdded' | 'quality'>>;

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
const DISTRICT_KEYS = ['vake', 'mtatsminda', 'saburtalo', 'isani', 'gldani'];
const DISTRICT_ALIAS_MAP: Record<string, string> = {
  'ვაკე': 'vake',
  'მთაწმინდა': 'mtatsminda',
  'საბურთალო': 'saburtalo',
  'ისანი': 'isani',
  'გლდანი': 'gldani',
  'ваке': 'vake',
  'мтацминда': 'mtatsminda',
  'сабуртало': 'saburtalo',
  'исани': 'isani',
  'глдани': 'gldani',
};

const normalizeText = (value: string) => value.toLowerCase().trim();

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

export default function PropertiesGrid({ 
  searchQuery, 
  filters, 
  highlightedPropertyId, 
  onPropertyHighlight 
}: PropertiesGridProps) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? '';
  const pathname = usePathname();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiProperties, setApiProperties] = useState<Property[] | null>(null);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  logger.log('PropertiesGrid received filters:', filters);

  // Allow AI tool to push ad-hoc filters via CustomEvent without full reload
  // only when explicitly enabled.
  const allowAiToolSideEffects = process.env.NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS === '1';
  const [injectedFilters, setInjectedFilters] = useState<
    Partial<GridFiltersState> & { location?: string }
  >({});
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
  const handleUploadClick = useCallback(() => {
    if (isAuthenticated) {
      setIsUploadModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated]);
  
  // Handle successful login
  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsUploadModalOpen(true);
  }, []);

  const {
    currentPage,
    locationParam,
    minParam,
    maxParam,
    roomsParam,
    statusParam,
    propTypeParam,
  } = useMemo(
    () => {
      const parsedSearchParams = new URLSearchParams(searchParamsString);
      return {
        currentPage: Number.parseInt(parsedSearchParams.get('page') || '1', 10),
        locationParam: (
          parsedSearchParams.get('location') ||
          injectedFilters.location ||
          searchQuery ||
          ''
        ).toString(),
        minParam: Number(parsedSearchParams.get('minPrice') || 'NaN'),
        maxParam: Number(parsedSearchParams.get('maxPrice') || 'NaN'),
        roomsParam: parsedSearchParams.get('rooms'),
        statusParam: (parsedSearchParams.get('status') || '').toString().toLowerCase(),
        propTypeParam: (parsedSearchParams.get('property_type') || '').toString().toLowerCase(),
      };
    },
    [injectedFilters.location, searchParamsString, searchQuery],
  );

  const normalizedLocationKey = useMemo(() => {
    const normalizedInput = normalizeText(locationParam);
    let normalizedKey: string | null = null;

    if (DISTRICT_ALIAS_MAP[normalizedInput]) {
      normalizedKey = DISTRICT_ALIAS_MAP[normalizedInput];
    }

    for (const key of DISTRICT_KEYS) {
      const localized = normalizeText(t(key));
      if (
        normalizedInput === key ||
        normalizedInput === localized ||
        localized.includes(normalizedInput) ||
        key.includes(normalizedInput)
      ) {
        normalizedKey = key;
        break;
      }
    }

    return normalizedKey;
  }, [locationParam, t]);

  const effectiveFilters = useMemo<PropertiesFiltersState>(() => {
    const urlOverrides: Partial<PropertiesFiltersState> = {};
    if (Number.isFinite(minParam) || Number.isFinite(maxParam)) {
      urlOverrides.priceRange = [
        Number.isFinite(minParam) ? Number(minParam) : filters.priceRange[0],
        Number.isFinite(maxParam) ? Number(maxParam) : filters.priceRange[1],
      ];
    }
    if (roomsParam && /^\d+$/.test(roomsParam)) {
      const roomCount = Number(roomsParam);
      urlOverrides.bedrooms = [roomCount >= 5 ? '5+' : String(roomCount)];
    }
    if (
      propTypeParam &&
      ['apartment', 'house', 'villa', 'studio', 'penthouse'].includes(propTypeParam)
    ) {
      urlOverrides.propertyTypes = [propTypeParam];
    }

    return {
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
      dateAdded: injectedFilters.dateAdded ?? filters.dateAdded ?? [null, null],
      quality: injectedFilters.quality ?? filters.quality ?? [],
    };
  }, [filters, injectedFilters, maxParam, minParam, propTypeParam, roomsParam]);

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

  const propertiesDataset = useMemo(() => apiProperties ?? fallbackProperties, [apiProperties]);

  logger.debug('Starting filter with:', effectiveFilters);
  logger.debug('Total properties before filter:', propertiesDataset.length);

  logger.debug('Floor filter value:', effectiveFilters.floor);

  const {
    filteredProperties,
    totalProperties,
    totalPages,
    startIndex,
    endIndex,
    currentProperties,
    pageNumbers,
  } = usePropertiesGridDerivedState({
    properties: propertiesDataset,
    apiTotal,
    currentPage,
    propertiesPerPage: PROPERTIES_PER_PAGE,
  });

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
  const updateURL = useCallback(
    (newParams: Record<string, string>): boolean => {
      const current = new URLSearchParams(searchParamsString);

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });

      const nextSearch = current.toString();
      if (nextSearch === searchParamsString) {
        return false;
      }

      const newURL = nextSearch ? `${pathname}?${nextSearch}` : pathname;
      window.history.pushState(null, '', newURL);
      return true;
    },
    [pathname, searchParamsString],
  );
  
  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      const didUpdate = updateURL({ page: page.toString() });
      if (didUpdate) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [totalPages, updateURL]);
  
  const goToPrevious = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);
  
  const goToNext = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage, totalPages]);

  const summaryText = useMemo(
    () =>
      `${t('showing')} ${startIndex + 1}-${Math.min(endIndex, totalProperties)} ${t('of')} ${totalProperties} ${t('propertiesCount')}`,
    [endIndex, startIndex, t, totalProperties],
  );
  const pageText = useMemo(
    () => `${t('page')} ${currentPage} ${t('of')} ${totalPages}`,
    [currentPage, t, totalPages],
  );
  const loadingText = useMemo(() => `${t('loading')}...`, [t]);
  const uploadButtonLabel = useMemo(
    () => t('uploadProperty') || 'ქონების ატვირთვა',
    [t],
  );

  return (
    <>
    <div className="space-y-3">
      <PropertiesGridHeader
        summaryText={summaryText}
        pageText={pageText}
        uploadButtonLabel={uploadButtonLabel}
        loadingText={loadingText}
        fetchError={fetchError}
        isFetching={isFetching}
        onUploadClick={handleUploadClick}
      />

      {/* Properties Grid */}
      {currentProperties.length === 0 && !isFetching ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#171717] p-6 text-center text-sm text-gray-600 dark:text-gray-300">
          შედეგი ვერ მოიძებნა. შეამოწმე ფილტრები ან გაასუფთავე ძებნა.
        </div>
      ) : (
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
              onHighlight={onPropertyHighlight}
            />
            );
          })}
        </div>
      )}

      <PropertiesGridPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        previousLabel={t('previous')}
        nextLabel={t('next')}
        goToPageLabel={t('goToPage')}
        onGoToPage={goToPage}
        onGoToPrevious={goToPrevious}
        onGoToNext={goToNext}
      />
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
