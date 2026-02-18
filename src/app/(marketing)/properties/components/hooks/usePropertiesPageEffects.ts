'use client';

import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import {
  CLEARABLE_PROPERTIES_QUERY_PARAMS,
  type PropertiesFiltersState,
} from './propertiesFilters';

type SearchParamsLike = Pick<URLSearchParams, 'get'> | null;

const MAP_VIEW_RESET_QUERY_PARAMS = [
  'location',
  'minPrice',
  'maxPrice',
  'rooms',
  'status',
  'property_type',
  'sort',
] as const;

interface UsePropertiesPageEffectsArgs {
  searchParams: SearchParamsLike;
  allowAiToolSideEffects: boolean;
  currentView: 'grid' | 'map';
  setCurrentView: Dispatch<SetStateAction<'grid' | 'map'>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setFilters: Dispatch<SetStateAction<PropertiesFiltersState>>;
  resetFiltersForMapView: () => void;
}

export default function usePropertiesPageEffects({
  searchParams,
  allowAiToolSideEffects,
  currentView,
  setCurrentView,
  setSearchQuery,
  setFilters,
  resetFiltersForMapView,
}: UsePropertiesPageEffectsArgs) {
  useEffect(() => {
    if (!searchParams) return;

    const locationParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || '';
    const minParam = Number(searchParams.get('minPrice') || '0');
    const maxParam = Number(searchParams.get('maxPrice') || '1000000');
    const viewParam = (searchParams.get('view') || '').toLowerCase();

    if (viewParam === 'map' || viewParam === 'grid') {
      setCurrentView(viewParam);
    }

    if (!allowAiToolSideEffects) return;

    if (locationParam) {
      setSearchQuery(locationParam);
    }

    setFilters((prev) => ({
      ...prev,
      propertyTypes: typeParam ? [typeParam] : [],
      priceRange: [
        Number.isFinite(minParam) ? minParam : 0,
        Number.isFinite(maxParam) ? maxParam : prev.priceRange[1],
      ],
    }));
  }, [allowAiToolSideEffects, searchParams, setCurrentView, setSearchQuery, setFilters]);

  useEffect(() => {
    if (allowAiToolSideEffects) return;
    try {
      const url = new URL(window.location.href);
      const hasAnyStaleParams = CLEARABLE_PROPERTIES_QUERY_PARAMS.some((key) =>
        url.searchParams.has(key),
      );
      if (!hasAnyStaleParams) return;
      CLEARABLE_PROPERTIES_QUERY_PARAMS.forEach((key) => url.searchParams.delete(key));
      window.history.replaceState(null, '', url.toString());
    } catch {
      // noop
    }
  }, [allowAiToolSideEffects]);

  useEffect(() => {
    const handleViewChange = (event: Event) => {
      const nextView = (event as CustomEvent<'grid' | 'map'>).detail;
      if (nextView === 'grid' || nextView === 'map') {
        setCurrentView(nextView);
      }
    };

    window.addEventListener('viewChange', handleViewChange as EventListener);
    return () => window.removeEventListener('viewChange', handleViewChange as EventListener);
  }, [setCurrentView]);

  useEffect(() => {
    const onAiView = (event: Event) => {
      try {
        const detail = ((event as CustomEvent).detail || {}) as { view?: string };
        if (detail.view === 'map' || detail.view === 'grid') {
          setCurrentView(detail.view);
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('view', detail.view);
            window.history.replaceState(null, '', url.toString());
          } catch {
            // noop
          }
        }
      } catch {
        // noop
      }
    };

    window.addEventListener('lumina:view:set', onAiView as EventListener);
    return () => window.removeEventListener('lumina:view:set', onAiView as EventListener);
  }, [setCurrentView]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const queryView = (url.searchParams.get('view') || '').toLowerCase();
      if (!queryView) {
        const savedView = window.localStorage.getItem('lumina_view');
        if (savedView === 'map' || savedView === 'grid') {
          setCurrentView(savedView);
          url.searchParams.set('view', savedView);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch {
      // noop
    }
  }, [setCurrentView]);

  useEffect(() => {
    try {
      window.localStorage.setItem('lumina_view', currentView);
      const url = new URL(window.location.href);
      url.searchParams.set('view', currentView);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // noop
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'map') return;

    try {
      resetFiltersForMapView();
      const url = new URL(window.location.href);
      MAP_VIEW_RESET_QUERY_PARAMS.forEach((key) => url.searchParams.delete(key));
      url.searchParams.set('view', 'map');
      window.history.replaceState(null, '', url.toString());
    } catch {
      // noop
    }
  }, [currentView, resetFiltersForMapView]);
}
