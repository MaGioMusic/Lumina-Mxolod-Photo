'use client';

import React from 'react';

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

interface AppliedFiltersChipsProps {
  searchQuery: string;
  filters: FiltersState;
  onRemove: (key: keyof FiltersState | 'search' | { arrayKey: keyof FiltersState; value: string }) => void;
  onClearAll: () => void;
}

const chipBase =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-orange-500/90 text-white shadow-[0_2px_8px_rgba(240,131,54,.35)] hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition';

const closeBtn =
  'ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

function AppliedFiltersChips({ searchQuery, filters, onRemove, onClearAll }: AppliedFiltersChipsProps) {
  const chips: React.ReactNode[] = [];

  if (searchQuery.trim()) {
    chips.push(
      <button key="search" className={chipBase} aria-pressed={true} aria-label={`remove search ${searchQuery}`} onClick={() => onRemove('search')}>
        <span>Search: {searchQuery}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
    chips.push(
      <button key="price" className={chipBase} aria-pressed={true} aria-label="remove price filter" onClick={() => onRemove('priceRange')}>
        <span>${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  filters.propertyTypes.forEach((v) => {
    chips.push(
      <button key={`type-${v}`} className={chipBase} aria-pressed={true} aria-label={`remove type ${v}`} onClick={() => onRemove({ arrayKey: 'propertyTypes', value: v })}>
        <span>Type: {v}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  filters.bedrooms.forEach((v) => {
    chips.push(
      <button key={`bed-${v}`} className={chipBase} aria-pressed={true} aria-label={`remove bedrooms ${v}`} onClick={() => onRemove({ arrayKey: 'bedrooms', value: v })}>
        <span>Beds: {v}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  filters.bathrooms.forEach((v) => {
    chips.push(
      <button key={`bath-${v}`} className={chipBase} aria-pressed={true} aria-label={`remove bathrooms ${v}`} onClick={() => onRemove({ arrayKey: 'bathrooms', value: v })}>
        <span>Baths: {v}</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  });

  if (filters.area[0] > 0 || filters.area[1] < 10000) {
    chips.push(
      <button key="area" className={chipBase} aria-pressed={true} aria-label="remove area filter" onClick={() => onRemove('area')}>
        <span>{filters.area[0]}–{filters.area[1]} მ²</span>
        <span className={closeBtn} aria-hidden>×</span>
      </button>
    );
  }

  if (filters.amenities.length) {
    filters.amenities.forEach((v) => {
      chips.push(
        <button key={`amenity-${v}`} className={chipBase} aria-pressed={true} aria-label={`remove amenity ${v}`} onClick={() => onRemove({ arrayKey: 'amenities', value: v })}>
          <span>{v}</span>
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
          aria-label="clear all filters"
        >
          Clear all
        </button>
      </div>
      <p aria-live="polite" className="sr-only">Filters changed</p>
    </div>
  );
}

export default React.memo(AppliedFiltersChips);


