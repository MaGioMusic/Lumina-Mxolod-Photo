'use client';

import { memo, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

import type { PropertiesFiltersState, RemovableFilterTarget } from './hooks/propertiesFilters';

interface AppliedFiltersChipsProps {
  searchQuery: string;
  filters: PropertiesFiltersState;
  onRemove: (key: RemovableFilterTarget) => void;
  onClearAll: () => void;
}

const chipBase =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-orange-500/90 text-white shadow-[0_2px_8px_rgba(240,131,54,.35)] hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition';

const closeBtn =
  'ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

const PROPERTY_TYPE_TRANSLATION_KEYS: Record<string, string> = {
  Apartment: 'apartment',
  House: 'house',
  Villa: 'villa',
  Studio: 'studio',
  Penthouse: 'penthouse',
  Commercial: 'commercial',
  Land: 'land',
  Office: 'office',
};

const AMENITY_TRANSLATION_KEYS: Record<string, string> = {
  Parking: 'parking',
  Balcony: 'balcony',
  Garden: 'garden',
  Pool: 'swimming_pool',
  Gym: 'gym',
  Security: 'security',
  Elevator: 'elevator',
  Furnished: 'furnished',
};

function AppliedFiltersChips({ searchQuery, filters, onRemove, onClearAll }: AppliedFiltersChipsProps) {
  const { t } = useLanguage();
  const chips: ReactNode[] = [];
  const getLabel = (value: string, map: Record<string, string>) => {
    const key = map[value];
    return key ? t(key) : value;
  };

  if (searchQuery.trim()) {
    chips.push(
      <button key="search" className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${t('search')}`} onClick={() => onRemove('search')}>
        <span>{t('search')}: {searchQuery}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
    chips.push(
      <button key="price" className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${t('price')}`} onClick={() => onRemove('priceRange')}>
        <span>${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  filters.propertyTypes.forEach((v) => {
    chips.push(
      <button key={`type-${v}`} className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${getLabel(v, PROPERTY_TYPE_TRANSLATION_KEYS)}`} onClick={() => onRemove({ arrayKey: 'propertyTypes', value: v })}>
        <span>{t('propertyType')}: {getLabel(v, PROPERTY_TYPE_TRANSLATION_KEYS)}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  filters.bedrooms.forEach((v) => {
    chips.push(
      <button key={`bed-${v}`} className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${t('bedrooms')} ${v}`} onClick={() => onRemove({ arrayKey: 'bedrooms', value: v })}>
        <span>{t('bedsShort')}: {v}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  filters.bathrooms.forEach((v) => {
    chips.push(
      <button key={`bath-${v}`} className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${t('bathrooms')} ${v}`} onClick={() => onRemove({ arrayKey: 'bathrooms', value: v })}>
        <span>{t('bathsShort')}: {v}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  if (filters.area[0] > 0 || filters.area[1] < 10000) {
    chips.push(
      <button key="area" className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${t('area')}`} onClick={() => onRemove('area')}>
        <span>{filters.area[0]}–{filters.area[1]} {t('squareMetersUnit')}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  if (filters.amenities.length) {
    filters.amenities.forEach((v) => {
      chips.push(
        <button key={`amenity-${v}`} className={chipBase} aria-pressed={true} aria-label={`${t('remove')} ${getLabel(v, AMENITY_TRANSLATION_KEYS)}`} onClick={() => onRemove({ arrayKey: 'amenities', value: v })}>
          <span>{getLabel(v, AMENITY_TRANSLATION_KEYS)}</span>
          <span className={closeBtn} aria-hidden>×</span>
        </button>
      );
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="px-4 pb-2 -mt-2">
      <div className="flex flex-wrap gap-2 items-center">
        {chips}
        <button
          className="ml-auto text-sm underline text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          onClick={onClearAll}
          aria-label={`${t('clearAll')} ${t('filters')}`}
        >
          {t('clearAll')}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">{t('filtersChanged')}</p>
    </div>
  );
}

export default memo(AppliedFiltersChips);


