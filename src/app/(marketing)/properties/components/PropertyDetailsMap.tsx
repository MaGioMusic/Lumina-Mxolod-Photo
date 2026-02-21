'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Bed, Maximize2, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MapLoading = () => {
  const { t } = useLanguage();
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
      <div className="text-gray-500">{t('loadingMap')}</div>
    </div>
  );
};

// Correct dynamic import approach for Next.js 15
const Map = dynamic(() => import('./PropertiesGoogleMap'), { 
  ssr: false,
  loading: () => <MapLoading />
});

type LocalizedText = { ka: string; en: string; ru: string };
type PropertyTypeKey = 'apartment' | 'house' | 'villa' | 'studio' | 'penthouse' | 'office' | 'cottage' | 'loft';
type DistrictKey = 'vake' | 'mtatsminda' | 'oldTown' | 'saburtalo' | 'isani';

interface Property {
  id: number;
  title: LocalizedText;
  price: number;
  location: LocalizedText;
  typeKey: PropertyTypeKey;
  status: 'for-sale' | 'for-rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  coordinates: [number, number];
  districtKey: DistrictKey;
}

interface DisplayProperty {
  id: number;
  title: string;
  price: string;
  location: string;
  type: string;
  status: 'for-sale' | 'for-rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  coordinates: [number, number];
  district: string;
}

// Extended properties data - more properties across Tbilisi
const allProperties: Property[] = [
  {
    id: 1,
    title: { ka: 'ლუქს ბინა ვაკეში', en: 'Luxury apartment in Vake', ru: 'Люксовая квартира в Ваке' },
    price: 350000,
    location: { ka: 'ვაკე, ყაზბეგის ქუჩა', en: 'Vake, Kazbegi Street', ru: 'Ваке, улица Казбеги' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: "/images/properties/property-12.jpg",
    coordinates: [41.7151, 44.7661],
    districtKey: 'vake',
  },
  {
    id: 2,
    title: { ka: 'ოფისი ვაკეში', en: 'Office in Vake', ru: 'Офис в Ваке' },
    price: 450000,
    location: { ka: 'ვაკე, ჭავჭავაძის ქუჩა', en: 'Vake, Chavchavadze Avenue', ru: 'Ваке, проспект Чавчавадзе' },
    typeKey: 'office',
    status: 'for-sale',
    bedrooms: 0,
    bathrooms: 2,
    area: 180,
    image: "/images/properties/property-13.jpg",
    coordinates: [41.7089, 44.7701],
    districtKey: 'vake',
  },
  {
    id: 3,
    title: { ka: 'ახალი ბინა ვაკეში', en: 'New apartment in Vake', ru: 'Новая квартира в Ваке' },
    price: 280000,
    location: { ka: 'ვაკე, პეკინის ქუჩა', en: 'Vake, Pekini Street', ru: 'Ваке, улица Пекини' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    image: "/images/properties/property-14.jpg",
    coordinates: [41.7123, 44.7623],
    districtKey: 'vake',
  },
  {
    id: 4,
    title: { ka: 'სტუდიო ვაკეში', en: 'Studio in Vake', ru: 'Студия в Ваке' },
    price: 195000,
    location: { ka: 'ვაკე, ილია ჭავჭავაძის ქუჩა', en: 'Vake, Ilia Chavchavadze Avenue', ru: 'Ваке, проспект Илии Чавчавадзе' },
    typeKey: 'studio',
    status: 'for-sale',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    image: "/images/properties/property-15.jpg",
    coordinates: [41.7178, 44.7689],
    districtKey: 'vake',
  },
  {
    id: 5,
    title: { ka: 'პენტჰაუსი ვაკეში', en: 'Penthouse in Vake', ru: 'Пентхаус в Ваке' },
    price: 680000,
    location: { ka: 'ვაკე, კოსტავას ქუჩა', en: 'Vake, Kostava Street', ru: 'Ваке, улица Костава' },
    typeKey: 'penthouse',
    status: 'for-sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    image: "/images/properties/property-5.jpg",
    coordinates: [41.7201, 44.7645],
    districtKey: 'vake',
  },
  {
    id: 6,
    title: { ka: 'თანამედროვე სახლი მთაწმინდაზე', en: 'Modern house in Mtatsminda', ru: 'Современный дом на Мтацминда' },
    price: 750000,
    location: { ka: 'მთაწმინდა, ნუცუბიძის ქუჩა', en: 'Mtatsminda, Nutsubidze Street', ru: 'Мтацминда, улица Нуцубидзе' },
    typeKey: 'house',
    status: 'for-sale',
    bedrooms: 5,
    bathrooms: 4,
    area: 280,
    image: "/images/properties/property-6.jpg",
    coordinates: [41.6927, 44.7831],
    districtKey: 'mtatsminda',
  },
  {
    id: 7,
    title: { ka: 'ვილა მთაწმინდაზე', en: 'Villa in Mtatsminda', ru: 'Вилла на Мтацминда' },
    price: 890000,
    location: { ka: 'მთაწმინდა, ბაღები', en: 'Mtatsminda, Gardens', ru: 'Мтацминда, сады' },
    typeKey: 'villa',
    status: 'for-sale',
    bedrooms: 6,
    bathrooms: 5,
    area: 350,
    image: "/images/properties/property-7.jpg",
    coordinates: [41.6845, 44.7856],
    districtKey: 'mtatsminda',
  },
  {
    id: 8,
    title: { ka: 'ბინა მთაწმინდაზე', en: 'Apartment in Mtatsminda', ru: 'Квартира на Мтацминда' },
    price: 420000,
    location: { ka: 'მთაწმინდა, მამაცაშვილის ქუჩა', en: 'Mtatsminda, Mamacashvili Street', ru: 'Мтацминда, улица Мамацашвили' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    image: "/images/properties/property-8.jpg",
    coordinates: [41.6889, 44.7798],
    districtKey: 'mtatsminda',
  },
  {
    id: 9,
    title: { ka: 'კოტეჯი მთაწმინდაზე', en: 'Cottage in Mtatsminda', ru: 'Коттедж на Мтацминда' },
    price: 520000,
    location: { ka: 'მთაწმინდა, ფუნიკულიორი', en: 'Mtatsminda, Funicular area', ru: 'Мтацминда, фуникулер' },
    typeKey: 'cottage',
    status: 'for-sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 190,
    image: "/images/properties/property-9.jpg",
    coordinates: [41.6923, 44.7789],
    districtKey: 'mtatsminda',
  },
  {
    id: 10,
    title: { ka: 'ისტორიული ბინა ძველ ქალაქში', en: 'Historic apartment in Old Town', ru: 'Историческая квартира в Старом городе' },
    price: 280000,
    location: { ka: 'ძველი ქალაქი, ლესელიძის ქუჩა', en: 'Old Town, Leselidze Street', ru: 'Старый город, улица Леселидзе' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    image: "/images/properties/property-10.jpg",
    coordinates: [41.6938, 44.8015],
    districtKey: 'oldTown',
  },
  {
    id: 11,
    title: { ka: 'ლოფტი ძველ ქალაქში', en: 'Loft in Old Town', ru: 'Лофт в Старом городе' },
    price: 320000,
    location: { ka: 'ძველი ქალაქი, სიონის ქუჩა', en: 'Old Town, Sioni Street', ru: 'Старый город, улица Сиони' },
    typeKey: 'loft',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: "/images/properties/property-11.jpg",
    coordinates: [41.6889, 44.8056],
    districtKey: 'oldTown',
  },
  {
    id: 12,
    title: { ka: 'სტუდიო ძველ ქალაქში', en: 'Studio in Old Town', ru: 'Студия в Старом городе' },
    price: 195000,
    location: { ka: 'ძველი ქალაქი, ბეთლემის ქუჩა', en: 'Old Town, Bethlehem Street', ru: 'Старый город, улица Вифлеемская' },
    typeKey: 'studio',
    status: 'for-sale',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: "/images/properties/property-12.jpg",
    coordinates: [41.6967, 44.8089],
    districtKey: 'oldTown',
  },
  {
    id: 13,
    title: { ka: 'ახალი ბინა საბურთალოზე', en: 'New apartment in Saburtalo', ru: 'Новая квартира в Сабуртало' },
    price: 220000,
    location: { ka: 'საბურთალო, ვაჟა-ფშაველას გამზირი', en: 'Saburtalo, Vazha-Pshavela Avenue', ru: 'Сабуртало, проспект Важа-Пшавела' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: "/images/properties/property-13.jpg",
    coordinates: [41.7270, 44.7511],
    districtKey: 'saburtalo',
  },
  {
    id: 14,
    title: { ka: 'კომფორტული ბინა საბურთალოზე', en: 'Comfortable apartment in Saburtalo', ru: 'Уютная квартира в Сабуртало' },
    price: 195000,
    location: { ka: 'საბურთალო, ღუდუშაურის ქუჩა', en: 'Saburtalo, Gudushauri Street', ru: 'Сабуртало, улица Гудаушаури' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: "/images/properties/property-14.jpg",
    coordinates: [41.7356, 44.7445],
    districtKey: 'saburtalo',
  },
  {
    id: 15,
    title: { ka: 'ბინა ისანში', en: 'Apartment in Isani', ru: 'Квартира в Исани' },
    price: 165000,
    location: { ka: 'ისანი, კახეთის გზატკეცილი', en: 'Isani, Kakheti Highway', ru: 'Исани, Кахетинское шоссе' },
    typeKey: 'apartment',
    status: 'for-sale',
    bedrooms: 2,
    bathrooms: 1,
    area: 68,
    image: "/images/properties/property-15.jpg",
    coordinates: [41.7543, 44.8156],
    districtKey: 'isani',
  }
];

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
  dateAdded: [Date | null, Date | null];
  quality: string[];
}

interface PropertyDetailsMapProps {
  selectedPropertyId?: string;
  filters?: FiltersState;
  searchQuery?: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default function PropertyDetailsMap({ selectedPropertyId, filters, searchQuery }: PropertyDetailsMapProps) {
  const { language, t } = useLanguage();
  const [selectedProperty, setSelectedProperty] = useState<DisplayProperty | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>(allProperties);
  const lastBoundsRef = useRef<MapBounds | null>(null);
  const panelWidthRef = useRef<HTMLDivElement | null>(null);
  const isResizingRef = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const [panelWidth, setPanelWidth] = useState(576);
  const [isDragging, setIsDragging] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  const MIN_PANEL_WIDTH = 420;
  const MAX_PANEL_WIDTH = 720;

  const clampPanelWidth = useCallback((width: number) => {
    return Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, Math.round(width)));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = Number(localStorage.getItem('lumina:properties-panel-width'));
    if (Number.isFinite(stored) && stored > 0) {
      setPanelWidth(clampPanelWidth(stored));
    }
  }, [clampPanelWidth]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current) return;
      const delta = event.clientX - resizeStartX.current;
      setPanelWidth(clampPanelWidth(resizeStartWidth.current + delta));
    };
    const handlePointerUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      setIsDragging(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina:properties-panel-width', String(panelWidth));
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [clampPanelWidth, panelWidth]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    isResizingRef.current = true;
    setIsDragging(true);
    resizeStartX.current = event.clientX;
    resizeStartWidth.current = panelWidthRef.current?.offsetWidth ?? panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const getLocalizedText = useCallback(
    (value: LocalizedText) => value[language] || value.en || value.ka,
    [language]
  );

  const formatPrice = useCallback(
    (value: number) => {
      const locale = language === 'ka' ? 'ka-GE' : language === 'ru' ? 'ru-RU' : 'en-US';
      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'GEL', maximumFractionDigits: 0 }).format(value);
      } catch {
        return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ₾`;
      }
    },
    [language]
  );

  const displayProperties = useMemo<DisplayProperty[]>(() => {
    return (visibleProperties || []).map((p) => {
      const districtLabel = t(p.districtKey);
      return {
        ...p,
        title: getLocalizedText(p.title),
        location: getLocalizedText(p.location),
        type: t(p.typeKey),
        district: districtLabel,
        price: formatPrice(p.price),
      };
    });
  }, [formatPrice, getLocalizedText, t, visibleProperties]);

  // Pre-filter by global controls (search/filter). Keep logic simple and fast.
  const baseFiltered = useMemo(() => {
    let list = allProperties.slice();
    if (filters) {
      list = list.filter((p) => {
        if (p.area < filters.area[0] || p.area > filters.area[1]) return false;
        const min = filters.priceRange?.[0] ?? 0;
        const max = filters.priceRange?.[1] ?? Number.MAX_SAFE_INTEGER;
        if (p.price < min || p.price > max) return false;
        if (filters.bedrooms.length) {
          const ok = filters.bedrooms.some((b) => (b === '5+' ? p.bedrooms >= 5 : p.bedrooms === parseInt(b)));
          if (!ok) return false;
        }
        if (filters.bathrooms.length) {
          const ok = filters.bathrooms.some((b) => (b === '4+' ? p.bathrooms >= 4 : p.bathrooms === parseInt(b)));
          if (!ok) return false;
        }
        return true;
      });
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        `${getLocalizedText(p.title)} ${getLocalizedText(p.location)} ${t(p.districtKey)}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filters, getLocalizedText, searchQuery, t]);

  useEffect(() => {
    if (!selectedPropertyId) return;
    const property = displayProperties.find((p) => p.id === parseInt(selectedPropertyId));
    if (property) setSelectedProperty(property);
  }, [displayProperties, selectedPropertyId]);

  useEffect(() => {
    if (mapBounds) {
      const filtered = baseFiltered.filter(property => {
        const [lat, lng] = property.coordinates;
        return (
          lat >= mapBounds.south &&
          lat <= mapBounds.north &&
          lng >= mapBounds.west &&
          lng <= mapBounds.east
        );
      });
      if (isDev) console.log('Filtered properties:', filtered.length, 'out of', baseFiltered.length);
      setVisibleProperties(filtered);
    }
  }, [mapBounds, baseFiltered, isDev]);

  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    const last = lastBoundsRef.current;
    const EPS = 0.00005;
    const isSame =
      last &&
      Math.abs(last.north - bounds.north) < EPS &&
      Math.abs(last.south - bounds.south) < EPS &&
      Math.abs(last.east - bounds.east) < EPS &&
      Math.abs(last.west - bounds.west) < EPS;
    if (isSame) return;
    lastBoundsRef.current = bounds;
    if (isDev) console.log('Map bounds changed:', bounds);
    setMapBounds(bounds);
  }, [isDev]);

  const handlePropertyHover = (propertyId: number | null) => {
    setHoveredProperty(propertyId);
  };

  const handlePropertySelect = (property: DisplayProperty) => {
    setSelectedProperty(property);
  };

  return (
    <>
      {/* styles moved to tailwind utilities to avoid JSX parsing issues */}
      
      <div className="flex h-full">
        {/* Left Panel - Properties List (compact 2-column) */}
        <div
          ref={panelWidthRef}
          className="group/resizer relative flex-shrink-0 overflow-y-auto"
          style={{ width: panelWidth }}
        >
          <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-transparent opacity-0 transition group-hover/resizer:bg-orange-300/70 group-hover/resizer:opacity-100 group-hover/resizer:shadow-[0_0_12px_rgba(240,131,54,0.35)]" />
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="absolute right-0 top-0 h-full w-[2px] bg-orange-400/90 shadow-[0_0_16px_rgba(240,131,54,0.45)]" />
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-orange-200/25 to-transparent" />
            </div>
          )}
          <div
            role="separator"
            aria-label="Resize properties panel"
            onPointerDown={startResize}
            className="absolute right-0 top-0 z-30 h-full w-2 cursor-col-resize bg-transparent transition hover:bg-orange-200/40 hover:shadow-[0_0_10px_rgba(240,131,54,0.35)]"
          />
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder={t('propertiesSearchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-400 outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Properties Counter */}
            <div className="mt-4 flex justify-between items-center">
              <div className="properties-counter">
                {visibleProperties.length} {t('propertiesInThisArea')}
              </div>
            </div>
          </div>

          {/* Properties List - compact grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noPropertiesInThisArea')}</h3>
                <p className="text-gray-600">{t('tryAdjustingMap')}</p>
              </div>
            ) : (
              displayProperties.map((property) => (
                <div
                  key={property.id}
                  className={`property-card group bg-white/95 rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all ${
                    hoveredProperty === property.id ? 'hovered' : ''
                  } ${selectedProperty?.id === property.id ? 'selected ring-2 ring-[#F08336]/40' : ''}`}
                  onMouseEnter={() => handlePropertyHover(property.id)}
                  onMouseLeave={() => handlePropertyHover(null)}
                  onClick={() => handlePropertySelect(property)}
                >
                  {/* Property Image */}
                  <div className="relative aspect-[4/3]">
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {property.status === 'for-rent' ? t('forRent') : t('forSale')}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/90 text-gray-800 px-2 py-0.5 rounded-full text-[10px] font-medium">{property.type}</span>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{property.title}</h3>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs truncate max-w-[150px]">{property.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] font-bold text-[#F08336]">{property.price}</div>
                      </div>
                    </div>

                    {/* Property Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{property.area} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 property-details-map">
          <Map
            properties={displayProperties}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredProperty}
            onPropertyHover={handlePropertyHover}
            onPropertySelect={handlePropertySelect}
            onBoundsChange={handleMapBoundsChange}
          />
        </div>
      </div>
    </>
  );
} 


