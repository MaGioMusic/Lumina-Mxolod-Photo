'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import {
  CLEARABLE_PROPERTIES_QUERY_PARAMS,
  type PropertiesFiltersState,
} from './propertiesFilters';

type SearchParamsLike = Pick<URLSearchParams, 'get'> | null;

const sameStringArray = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

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
  const lastReplacedUrlRef = useRef<string>('');

  const replaceUrlIfChanged = useCallback((nextUrl: URL) => {
    const nextHref = nextUrl.toString();
    const currentHref = window.location.href;
    if (nextHref === currentHref || nextHref === lastReplacedUrlRef.current) {
      return;
    }
    window.history.replaceState(null, '', nextHref);
    lastReplacedUrlRef.current = nextHref;
  }, []);

  useEffect(() => {
    if (!searchParams) return;

    const locationParam = searchParams.get('location') || '';
    const typeParam = searchParams.get('type') || '';
    const minParam = Number(searchParams.get('minPrice') || '0');
    const maxParam = Number(searchParams.get('maxPrice') || '1000000');
    const viewParam = (searchParams.get('view') || '').toLowerCase();

    if ((viewParam === 'map' || viewParam === 'grid') && viewParam !== currentView) {
      setCurrentView(viewParam);
    }

    if (!allowAiToolSideEffects) return;

    if (locationParam) {
      setSearchQuery((prev) => (prev === locationParam ? prev : locationParam));
    }

    setFilters((prev) => {
      const nextPropertyTypes = typeParam ? [typeParam] : [];
      const nextPriceRange: [number, number] = [
        Number.isFinite(minParam) ? minParam : 0,
        Number.isFinite(maxParam) ? maxParam : prev.priceRange[1],
      ];

      if (
        sameStringArray(prev.propertyTypes, nextPropertyTypes) &&
        prev.priceRange[0] === nextPriceRange[0] &&
        prev.priceRange[1] === nextPriceRange[1]
      ) {
        return prev;
      }

      return {
        ...prev,
        propertyTypes: nextPropertyTypes,
        priceRange: nextPriceRange,
      };
    });
  }, [
    allowAiToolSideEffects,
    currentView,
    searchParams,
    setCurrentView,
    setSearchQuery,
    setFilters,
  ]);

  useEffect(() => {
    if (allowAiToolSideEffects) return;
    try {
      const url = new URL(window.location.href);
      const hasAnyStaleParams = CLEARABLE_PROPERTIES_QUERY_PARAMS.some((key) =>
        url.searchParams.has(key),
      );
      if (!hasAnyStaleParams) return;
      CLEARABLE_PROPERTIES_QUERY_PARAMS.forEach((key) => url.searchParams.delete(key));
      replaceUrlIfChanged(url);
    } catch {
      // noop
    }
  }, [allowAiToolSideEffects, replaceUrlIfChanged]);

  useEffect(() => {
    const handleViewChange = (event: Event) => {
      const nextView = (event as CustomEvent<'grid' | 'map'>).detail;
      if (nextView === 'grid' || nextView === 'map') {
        setCurrentView((prev) => (prev === nextView ? prev : nextView));
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
          const nextView = detail.view;
          setCurrentView((prev) => (prev === nextView ? prev : nextView));
          try {
            const url = new URL(window.location.href);
            if (url.searchParams.get('view') !== nextView) {
              url.searchParams.set('view', nextView);
              replaceUrlIfChanged(url);
            }
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
  }, [replaceUrlIfChanged, setCurrentView]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const queryView = (url.searchParams.get('view') || '').toLowerCase();
      if (!queryView) {
        const savedView = window.localStorage.getItem('lumina_view');
        if (savedView === 'map' || savedView === 'grid') {
          setCurrentView((prev) => (prev === savedView ? prev : savedView));
          url.searchParams.set('view', savedView);
          replaceUrlIfChanged(url);
        }
      }
    } catch {
      // noop
    }
  }, [replaceUrlIfChanged, setCurrentView]);

  useEffect(() => {
    try {
      window.localStorage.setItem('lumina_view', currentView);
      // Map mode performs a dedicated URL cleanup pass below; avoid double writes.
      if (currentView === 'map') return;
      const url = new URL(window.location.href);
      if (url.searchParams.get('view') !== currentView) {
        url.searchParams.set('view', currentView);
        replaceUrlIfChanged(url);
      }
    } catch {
      // noop
    }
  }, [currentView, replaceUrlIfChanged]);

  useEffect(() => {
    if (currentView !== 'map') return;

    try {
      resetFiltersForMapView();
      const url = new URL(window.location.href);
      const hadResetParams = MAP_VIEW_RESET_QUERY_PARAMS.some((key) => url.searchParams.has(key));
      const viewAlreadyMap = url.searchParams.get('view') === 'map';
      MAP_VIEW_RESET_QUERY_PARAMS.forEach((key) => url.searchParams.delete(key));
      if (!viewAlreadyMap || hadResetParams) {
        url.searchParams.set('view', 'map');
        replaceUrlIfChanged(url);
      }
    } catch {
      // noop
    }
  }, [currentView, replaceUrlIfChanged, resetFiltersForMapView]);
}
