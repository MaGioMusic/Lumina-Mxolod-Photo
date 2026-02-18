'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  createDefaultPropertiesFilters,
  type PropertiesFiltersState,
  type RemovableFilterTarget,
} from './propertiesFilters';

const resetSingleFilterValue = (
  key: keyof PropertiesFiltersState,
): PropertiesFiltersState[keyof PropertiesFiltersState] => {
  switch (key) {
    case 'priceRange':
      return [0, 1_000_000];
    case 'area':
      return [0, 10_000];
    case 'dateAdded':
      return [null, null];
    case 'bedrooms':
    case 'bathrooms':
    case 'propertyTypes':
    case 'amenities':
    case 'quality':
      return [];
    default:
      return '';
  }
};

const isDefaultFiltersState = (nextFilters: PropertiesFiltersState): boolean =>
  nextFilters.priceRange[0] === 0 &&
  nextFilters.priceRange[1] === 1_000_000 &&
  nextFilters.bedrooms.length === 0 &&
  nextFilters.bathrooms.length === 0 &&
  nextFilters.propertyTypes.length === 0 &&
  nextFilters.transactionType === '' &&
  nextFilters.constructionStatus === '' &&
  nextFilters.floor === '' &&
  nextFilters.furniture === '' &&
  nextFilters.area[0] === 0 &&
  nextFilters.area[1] === 10_000 &&
  nextFilters.amenities.length === 0 &&
  nextFilters.dateAdded[0] === null &&
  nextFilters.dateAdded[1] === null &&
  nextFilters.quality.length === 0;

export default function usePropertiesPageState() {
  const [currentView, setCurrentView] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<number | null>(null);
  const [filters, setFilters] = useState<PropertiesFiltersState>(createDefaultPropertiesFilters);

  const handleFiltersChange = useCallback((nextFilters: PropertiesFiltersState) => {
    setFilters(nextFilters);
  }, []);

  const handleRemoveChip = useCallback((target: RemovableFilterTarget) => {
    if (target === 'search') {
      setSearchQuery('');
      return;
    }

    if (typeof target === 'object') {
      const { arrayKey, value } = target;
      setFilters((prev) => ({
        ...prev,
        [arrayKey]: (prev[arrayKey] as string[]).filter((item) => item !== value),
      }));
      return;
    }

    const resetValue = resetSingleFilterValue(target);
    setFilters((prev) => ({
      ...prev,
      [target]: resetValue as never,
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchQuery((prev) => (prev ? '' : prev));
    setFilters((prev) => (isDefaultFiltersState(prev) ? prev : createDefaultPropertiesFilters()));
  }, []);

  const resetFiltersForMapView = useCallback(() => {
    setSearchQuery((prev) => (prev ? '' : prev));
    setFilters((prev) => (isDefaultFiltersState(prev) ? prev : createDefaultPropertiesFilters()));
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchQuery.trim() ||
          filters.priceRange[0] > 0 ||
          filters.priceRange[1] < 1_000_000 ||
          filters.propertyTypes.length ||
          filters.bedrooms.length ||
          filters.bathrooms.length ||
          filters.area[0] > 0 ||
          filters.area[1] < 10_000 ||
          filters.amenities.length,
      ),
    [
      searchQuery,
      filters.priceRange,
      filters.propertyTypes.length,
      filters.bedrooms.length,
      filters.bathrooms.length,
      filters.area,
      filters.amenities.length,
    ],
  );

  return {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    highlightedPropertyId,
    setHighlightedPropertyId,
    filters,
    setFilters,
    handleFiltersChange,
    handleRemoveChip,
    handleClearAll,
    hasActiveFilters,
    resetFiltersForMapView,
  };
}
