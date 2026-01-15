'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import TrustCluster from '@/components/TrustCluster';
import { flags } from '@/lib/flags';
import { trackEvent } from '@/lib/analytics';
import { useForm, Controller } from 'react-hook-form';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const locationOptionsKeys = [
  'tbilisi', 'batumi', 'kutaisi', 'rustavi', 'zugdidi', 'telavi', 'gori', 'poti', 'samtredia', 'kobuleti'
];

const propertyTypesRaw = [
  { key: 'apartment', labelKey: 'apartment' },
  { key: 'house', labelKey: 'house' },
  { key: 'villa', labelKey: 'villa' },
  { key: 'commercial', labelKey: 'commercial' }
];

const priceRangesRaw = [
  '$100K - $300K', '$300K - $500K', '$500K - $750K', 
  '$750K - $1M', '$1M - $2M', '$2M+'
];

const searchSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function HeroSection() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  // Refs for dropdown containers and parallax effects
  const formRef = useRef<HTMLFormElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const backgroundLayersRef = useRef<HTMLDivElement[]>([]);

  // Video fallback (only show image if video fails to load/play)
  const [videoFailed, setVideoFailed] = useState(false);
  
  // Dropdown states
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  
  // Form values states
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedMinPrice, setSelectedMinPrice] = useState('');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState('');
  const [exampleIndex, setExampleIndex] = useState<number>(0);

  // Currency & Suggested tags data
  const [currency, setCurrency] = useState<'GEL' | 'USD' | 'EUR'>('GEL');
  const suggestedTags = [
    { label: t('vake'), type: 'location', value: 'ვაკე' },
    { label: t('saburtalo'), type: 'location', value: 'საბურთალო' },
    { label: t('withTerrace'), type: 'feature', value: 'ტერასით' },
    { label: t('withGarage'), type: 'feature', value: 'გარაჟი' },
    { label: t('newBuilding'), type: 'feature', value: 'ახალი შენობა' },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
    },
  });

  // Watch location for autocomplete (debounced)
  const locationValue = watch('location') || '';
  const [debouncedLocation, setDebouncedLocation] = useState<string>('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedLocation(locationValue), 250);
    return () => clearTimeout(id);
  }, [locationValue]);

  // Memoize location options to prevent infinite re-renders
  const locationOptions = useMemo(() => {
    return locationOptionsKeys.map(key => t(key));
  }, [t]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Use requestAnimationFrame to ensure the click event is processed
      requestAnimationFrame(() => {
        if (formRef.current && !formRef.current.contains(target)) {
          setIsPropertyTypeOpen(false);
          setShowSuggestions(false);
        }
      });
    };

    if (isPropertyTypeOpen || showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPropertyTypeOpen, showSuggestions]);

  useEffect(() => {
    if (debouncedLocation.length > 0) {
      setLocationSuggestions(
        locationOptions.filter(loc =>
          loc.toLowerCase().includes(debouncedLocation.toLowerCase())
        )
      );
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
    setSelectedLocation(locationValue);
  }, [debouncedLocation, locationValue, locationOptions]);

  // Inline validation for prices
  const validationError = useMemo(() => {
    const min = Number(selectedMinPrice);
    const max = Number(selectedMaxPrice);
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0 && min > max) {
      return t('minPrice') + ' < ' + t('maxPrice');
    }
    return '';
  }, [selectedMinPrice, selectedMaxPrice, t]);

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (isNaN(num) || value === '') return '';
    const symbol = currency === 'GEL' ? '₾' : currency === 'USD' ? '$' : '€';
    return symbol + new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(num);
  };

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      const scrolled = window.pageYOffset;
      
      // Apply parallax effect to video background
      const videoElement = document.querySelector('video') as HTMLElement;
      if (videoElement) {
        const speed = 0.5;
        // Clamp upward shift so we never reveal an empty gap under the hero overlay.
        // Video is rendered ~120% height with -10% top offset, so allow up to ~10% viewport shift.
        const maxUpShiftPx = Math.round(window.innerHeight * 0.1);
        const yPos = Math.max(-maxUpShiftPx, -(scrolled * speed));
        videoElement.style.transform = `translateY(${yPos}px)`;
      }

      // Add fade effect to hero content as user scrolls
      const heroContent = document.querySelector('.hero-content-animated') as HTMLElement;
      if (heroContent) {
        const opacity = Math.max(0, 1 - (scrolled / window.innerHeight));
        heroContent.style.opacity = opacity.toString();
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16); // ~60fps
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', optimizedScroll);
    };
  }, []);

  const onSubmit = (data: SearchForm) => {
    logger.log('Form submitted with data:', data);
    logger.debug('States:', { selectedLocation, selectedPropertyType, selectedMinPrice, selectedMaxPrice });
    
    // Build query params
    const params = new URLSearchParams();
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedPropertyType) params.append('type', selectedPropertyType);
    if (selectedMinPrice) params.append('minPrice', selectedMinPrice);
    if (selectedMaxPrice) params.append('maxPrice', selectedMaxPrice);
    router.push(`/properties?${params.toString()}`);
  };

  const handlePropertyTypeSelect = (typeKey: string) => {
    logger.log('Property type selected:', typeKey);
    setSelectedPropertyType(typeKey);
    setValue('propertyType', typeKey);
    setIsPropertyTypeOpen(false);
  };

  const handleLocationSelect = (location: string) => {
    logger.log('Location selected:', location);
    setSelectedLocation(location);
    setValue('location', location);
    setShowSuggestions(false);
  };

  const handleTagClick = (tag: { label: string; type: string; value: string }) => {
    if (tag.type === 'location') {
      setSelectedLocation(tag.value);
      setValue('location', tag.value);
    } else if (tag.type === 'feature') {
      // For features, we can add them to location search or create a separate feature filter
      const currentLocation = selectedLocation;
      const newLocation = currentLocation ? `${currentLocation} ${tag.value}` : tag.value;
      setSelectedLocation(newLocation);
      setValue('location', newLocation);
    }
  };

  // Cycled example scenarios that are guaranteed to exist in mock data
  const exampleScenarios = useMemo(() => [
    // Align district -> type to match our mock generator (same index modulo 5)
    { districtKey: 'vake',        type: 'apartment', min: '120000', max: '320000' },
    { districtKey: 'mtatsminda',  type: 'house',     min: '180000', max: '420000' },
    { districtKey: 'saburtalo',   type: 'villa',     min: '220000', max: '500000' },
    { districtKey: 'isani',       type: 'studio',    min: '100000', max: '260000' },
    { districtKey: 'gldani',      type: 'penthouse', min: '150000', max: '380000' },
  ], []);

  const handleExampleSearch = () => {
    const scenario = exampleScenarios[exampleIndex % exampleScenarios.length];
    const exampleLocation = t(scenario.districtKey);
    const examplePropertyType = scenario.type;
    const exampleMinPrice = scenario.min;
    const exampleMaxPrice = scenario.max;

    // Fill the form with example values (localized location name)
    setSelectedLocation(exampleLocation);
    setSelectedPropertyType(examplePropertyType);
    setSelectedMinPrice(exampleMinPrice);
    setSelectedMaxPrice(exampleMaxPrice);

    setValue('location', exampleLocation);
    setValue('propertyType', examplePropertyType);
    setValue('minPrice', exampleMinPrice);
    setValue('maxPrice', exampleMaxPrice);

    // Advance to next example for subsequent clicks
    setExampleIndex((prev) => (prev + 1) % exampleScenarios.length);
  };

  const propertyTypes = propertyTypesRaw.map((item) => ({ ...item, label: t(item.labelKey) }));
  const priceRanges = priceRangesRaw;

  return (
    <section className="relative w-full h-[100vh] flex flex-col items-center overflow-hidden -mt-16 pt-16" aria-label={t('heroSectionLabel') ?? 'Hero'}>
      {/* Background Video - Optimized and Responsive */}
      <video
        autoPlay
        loop
        muted
        playsInline
        // Slightly oversized + shifted up so parallax translateY never reveals an empty gap at the bottom.
        className="absolute top-[-10%] left-0 w-full h-[120%] object-cover z-0 block"
        preload="auto"
        onError={() => setVideoFailed(true)}
        onLoadedData={() => setVideoFailed(false)}
      >
        <source src="/videos/hero-background-new.mp4?v=2025-10-26" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
      </video>

      {/* Fallback Background Image ONLY when video fails */}
      {videoFailed && (
        <div
          // Match the oversized sizing used for the video to avoid any parallax gaps.
          className="absolute top-[-10%] left-0 w-full h-[120%] bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: `url('/images/photos/hero-background.jpg')`,
          }}
        />
      )}

      {/* Dark Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/10 z-10"></div>

      {/* Content on top of video */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center hero-content-animated">
        {/* Main Title */}
        <div className="flex items-center justify-center w-full mb-12 hero-title-animated">
          <h1 className={`text-[clamp(2.5rem,6vw,7.5rem)] leading-tight lg:leading-[1.05] text-center ${language === 'ru' ? 'tracking-normal ru-heavy' : 'tracking-wide'} text-white drop-shadow-md animate-slow-shimmer font-archivo-black font-black ${language === 'ru' ? '[font-family:var(--font-noto-cyrillic),var(--font-archivo-black),system-ui,sans-serif]' : '[font-family:var(--font-archivo-black),var(--font-noto-georgian),var(--font-noto-cyrillic),system-ui,sans-serif]'}`}>
            {t('heroTitle')}
          </h1>
        </div>

        {/* CRO: Optional primary CTA (flagged) */}
        {flags.enableCROHero && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/properties')}
              className="bg-[#F08336] hover:bg-[#e0743a] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {language === 'ka' ? 'იპოვე ჩემი ქონება' : language === 'ru' ? 'Найти мою недвижимость' : 'Find my property'}
            </button>
          </div>
        )}

        {/* Enhanced Search Form */}
        <div className="flex flex-col items-center justify-center w-full hero-form-animated space-y-6">
          {/* Main Search Bar */}
          <form role="search"
            onSubmit={handleSubmit(onSubmit)}
            className="group bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 flex flex-wrap items-center gap-2 md:gap-3 py-2.5 px-4 md:px-5 w-full max-w-2xl transition-all duration-300 hover:shadow-xl hover:bg-white/25 focus-within:bg-white/25 focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#F08336]/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Prevent implicit submit on Enter; user must click Search button
                e.preventDefault();
              }
            }}
            autoComplete="off"
            ref={formRef}
            onSubmitCapture={() => trackEvent('search_submit', { location: selectedLocation || undefined, type: selectedPropertyType || undefined })}
          >
            {/* Max Price Input (moved to first position) */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="max-price-input" className="sr-only">{t('maxPriceLabel')}</label>
              <Controller
                name="maxPrice"
                control={control}
                render={({ field }) => (
              <input
                    {...field}
                    id="max-price-input"
                    type="number"
                    placeholder={t('maxPrice')}
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    className="w-full px-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-white placeholder:text-white/60 font-inter text-sm outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200"
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedMaxPrice(e.target.value);
                    }}
                    aria-label={t('maxPriceInputLabel')}
                  />
                )}
              />
            </div>

            {/* Property Type Dropdown */}
            <div className="flex-1 min-w-[180px] relative">
              <label htmlFor="property-type-button" className="sr-only">{t('propertyTypeLabel')}</label>
              <button
                id="property-type-button"
                type="button"
                onClick={() => {
                  setIsPropertyTypeOpen(!isPropertyTypeOpen);
                }}
                className="w-full bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-left text-white font-inter text-sm outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200 hover:bg-white/15 flex items-center justify-between"
                aria-expanded={isPropertyTypeOpen}
                aria-haspopup="listbox"
              >
                <span className="truncate">
                  {selectedPropertyType ? propertyTypes.find(p => p.key === selectedPropertyType)?.label : t('anyPropertyType')}
                </span>
                <svg className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isPropertyTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isPropertyTypeOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-xl z-50 mt-2 max-h-48 overflow-y-auto" role="listbox">
                  {propertyTypes.map((type, index) => (
                    <div
                      key={type.key}
                      className={`w-full text-left p-3 hover:bg-cream-100 text-gray-700 font-inter text-sm cursor-pointer transition-colors duration-200 ${
                        selectedPropertyType === type.key ? 'bg-cream-200 text-primary-700' : ''
                      } ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === propertyTypes.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handlePropertyTypeSelect(type.key);
                      }}
                      role="option"
                      aria-selected={selectedPropertyType === type.key}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Min Price Input */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="min-price-input" className="sr-only">{t('minPriceLabel')}</label>
              <Controller
                name="minPrice"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="min-price-input"
                    type="number"
                    placeholder={t('minPrice')}
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    className="w-full px-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-white placeholder:text-white/60 font-inter text-sm outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200"
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedMinPrice(e.target.value);
                    }}
                    aria-label={t('minPriceInputLabel')}
                  />
                )}
                  />
                </div>

            {/* Location Input (moved near the end) */}
            <div className="flex-1 min-w-[200px] relative">
              <label htmlFor="location-input" className="sr-only">{t('locationLabel')}</label>
              <div className="relative">
                <svg 
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 transition-transform duration-200 group-focus-within:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="location-input"
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-8 pr-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-white placeholder:text-white/70 font-inter text-sm outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200"
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                      onKeyDown={(e) => {
                        if (!showSuggestions || locationSuggestions.length === 0) return;
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setActiveSuggestionIndex((prev) => Math.min(prev + 1, locationSuggestions.length - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === 'Enter') {
                          const sel = activeSuggestionIndex >= 0 ? locationSuggestions[activeSuggestionIndex] : undefined;
                          if (sel) {
                            e.preventDefault();
                            handleLocationSelect(sel);
                          }
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                          setActiveSuggestionIndex(-1);
                        }
                      }}
                      aria-label={t('locationInputLabel')}
                    />
                  )}
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-xl z-50 mt-2 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc, index) => (
                      <div
                        key={loc}
                        className={`w-full text-left px-4 py-3 hover:bg-cream-100 ${activeSuggestionIndex === index ? 'bg-cream-100' : ''} text-gray-700 font-inter text-sm cursor-pointer transition-colors duration-200 flex items-center ${
                          index === 0 ? 'rounded-t-xl' : ''
                        } ${
                          index === locationSuggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleLocationSelect(loc);
                        }}
                      >
                        <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {loc}
                      </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="min-w-[90px]">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200"
              >
                <option className="text-gray-900 bg-white" value="GEL">GEL</option>
                <option className="text-gray-900 bg-white" value="USD">USD</option>
                <option className="text-gray-900 bg-white" value="EUR">EUR</option>
              </select>
            </div>

            {/* Search Button */}
            <button 
              type="submit"
              className="bg-[#F08336] hover:bg-[#e0743a] text-white font-semibold rounded-full transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-[#F08336] focus:outline-none shadow-lg hover:shadow-xl flex items-center justify-center px-4 py-1.5"
              role="button"
              aria-label={t('searchListingsLabel')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Inline validation and selected filters */}
          {(validationError || selectedLocation || selectedPropertyType || selectedMinPrice || selectedMaxPrice) && (
            <div className="w-full max-w-2xl mt-2 flex flex-wrap items-center gap-2 justify-start">
              {validationError && (
                <span className="text-red-300 text-xs bg-red-900/40 border border-red-400/30 px-2 py-1 rounded-full">{validationError}</span>
              )}
              {selectedLocation && (
                <button onClick={() => { setSelectedLocation(''); setValue('location',''); }} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/25 transition">
                  {selectedLocation} ✕
                </button>
              )}
              {selectedPropertyType && (
                <button onClick={() => { setSelectedPropertyType(''); setValue('propertyType',''); }} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/25 transition">
                  {propertyTypes.find(p=>p.key===selectedPropertyType)?.label} ✕
                </button>
              )}
              {selectedMinPrice && (
                <button onClick={() => { setSelectedMinPrice(''); setValue('minPrice',''); }} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/25 transition">
                  {formatCurrency(selectedMinPrice)} ✕
                </button>
              )}
              {selectedMaxPrice && (
                <button onClick={() => { setSelectedMaxPrice(''); setValue('maxPrice',''); }} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/25 transition">
                  {formatCurrency(selectedMaxPrice)} ✕
                </button>
              )}
              {(selectedLocation || selectedPropertyType || selectedMinPrice || selectedMaxPrice) && (
                <button onClick={() => { setSelectedLocation(''); setSelectedPropertyType(''); setSelectedMinPrice(''); setSelectedMaxPrice(''); setValue('location',''); setValue('propertyType',''); setValue('minPrice',''); setValue('maxPrice',''); }} className="ml-auto text-xs text-white/90 hover:text-white underline underline-offset-4">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Suggested Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl">
            <span className="text-white/80 text-sm font-medium">{t('popularSearches')}:</span>
            {suggestedTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/20 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-white/40 focus:outline-none"
                aria-label={`${t('addToSearch')} ${tag.label}`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Try Example Search Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleExampleSearch}
              className="bg-[#F08336] hover:bg-[#e0743a] text-white font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-[#F08336] focus:outline-none shadow-lg flex items-center gap-2 group text-sm"
              aria-label={t('tryExampleSearchDesc')}
              onMouseDown={() => trackEvent('try_example_click')}
            >
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('tryExampleSearch')}
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {flags.enableTrustCluster && (
          <div className="mt-6">
            <TrustCluster />
          </div>
        )}

        {/* Scroll Down Arrow */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={() => {
              const featuresSection = document.getElementById('features-section');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }
            }}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-pulse"
            >
              <path d="M7 13l5 5 5-5"/>
              <path d="M7 6l5 5 5-5"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
} 