import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockProperties, MockProperty } from '@/lib/mockProperties';

type ToolCallTransport = 'realtime' | 'websocket';

export interface PropertySearchHookOptions {
  isChatOpen: boolean;
}

export interface PropertyFunctionCallResult {
  handled: boolean;
  payload?: Record<string, unknown>;
}

const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'penthouse'];

export const usePropertySearch = ({ isChatOpen }: PropertySearchHookOptions) => {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<MockProperty[]>([]);
  const [lastSearchSummary, setLastSearchSummary] = useState('');

  const runPropertySearch = useCallback((rawArgs: unknown): MockProperty[] => {
    try {
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : (rawArgs || {});
      const all = getMockProperties(100);
      let list = all.slice();
      if (args.query && typeof args.query === 'string') {
        const q = args.query.toLowerCase();
        list = list.filter((p) => String(p.address).toLowerCase().includes(q) || String(p.type).toLowerCase().includes(q));
      }
      if (args.district && typeof args.district === 'string') {
        list = list.filter((p) => p.address === args.district);
      }
      if (Number.isFinite(args.min_price)) list = list.filter((p) => p.price >= Number(args.min_price));
      if (Number.isFinite(args.max_price)) list = list.filter((p) => p.price <= Number(args.max_price));
      if (Number.isFinite(args.bedrooms)) list = list.filter((p) => p.bedrooms >= Number(args.bedrooms));
      if (Number.isFinite(args.bathrooms)) list = list.filter((p) => p.bathrooms >= Number(args.bathrooms));
      if (args.status && (args.status === 'for-sale' || args.status === 'for-rent')) list = list.filter((p) => p.status === args.status);
      if (args.property_type && typeof args.property_type === 'string') list = list.filter((p) => p.type === args.property_type);
      if (Number.isFinite(args.min_sqft)) list = list.filter((p) => p.sqft >= Number(args.min_sqft));
      if (Number.isFinite(args.max_sqft)) list = list.filter((p) => p.sqft <= Number(args.max_sqft));
      if (typeof args.is_new === 'boolean') list = list.filter((p) => Boolean(p.isNew) === Boolean(args.is_new));
      if (args.sort_by === 'price_asc') list.sort((a, b) => a.price - b.price);
      if (args.sort_by === 'price_desc') list.sort((a, b) => b.price - a.price);
      const limit = Number.isFinite(args.limit) ? Math.max(1, Math.min(20, Number(args.limit))) : 6;
      return list.slice(0, limit);
    } catch {
      return getMockProperties(6);
    }
  }, []);

  const rememberAutostart = useCallback(() => {
    try {
      window.sessionStorage.setItem('lumina_ai_autostart', isChatOpen ? '1' : '0');
    } catch {
      // ignore storage errors in restricted contexts (SSR/tests)
    }
  }, [isChatOpen]);

  const navigateWithRouter = useCallback(
    (path: string) => {
      rememberAutostart();
      router.push(path);
    },
    [rememberAutostart, router],
  );

  const navigateWithLocation = useCallback((path: string) => {
    rememberAutostart();
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }, [rememberAutostart]);

  const buildPropertiesUrl = useCallback((argsObj: Record<string, unknown>) => {
    const u = new URL('/properties', window.location.origin);
    const loc = (argsObj.district || argsObj.location || argsObj.q || '').toString();
    if (loc) u.searchParams.set('location', loc);
    const min = Number(argsObj.priceMin ?? argsObj.min_price ?? argsObj.minPrice ?? argsObj.price_min);
    const max = Number(argsObj.priceMax ?? argsObj.max_price ?? argsObj.maxPrice ?? argsObj.price_max);
    if (Number.isFinite(min)) u.searchParams.set('minPrice', String(min));
    if (Number.isFinite(max)) u.searchParams.set('maxPrice', String(max));
    const roomsVal = Number(argsObj.rooms ?? argsObj.bedrooms);
    if (Number.isFinite(roomsVal)) u.searchParams.set('rooms', String(roomsVal >= 5 ? 5 : roomsVal));
    try {
      const st = (argsObj.status || '').toString().toLowerCase();
      if (st === 'for-sale' || st === 'for-rent') u.searchParams.set('status', st);
    } catch {}
    try {
      const pt = (argsObj.property_type || (argsObj as any).propertyType || (argsObj as any).type || '').toString().toLowerCase();
      if (propertyTypes.includes(pt)) u.searchParams.set('property_type', pt);
    } catch {}
    return u;
  }, []);

  const setFilterSummary = useCallback((argsObj: Record<string, unknown>) => {
    try {
      const summaryParts: string[] = [];
      if (argsObj.district && typeof argsObj.district === 'string') summaryParts.push(argsObj.district);
      if (argsObj.bedrooms) summaryParts.push(`${argsObj.bedrooms} საძინებელი`);
      if (argsObj.status && typeof argsObj.status === 'string') summaryParts.push(argsObj.status === 'for-rent' ? 'ქირავდება' : 'იყიდება');
      setLastSearchSummary(summaryParts.join(' · '));
    } catch {
      setLastSearchSummary('');
    }
  }, []);

  const handleFunctionCall = useCallback(
    (fnName: string, argsText: string, context?: { transport?: ToolCallTransport }): PropertyFunctionCallResult => {
      const transport = context?.transport ?? 'realtime';
      const useRouterNav = transport === 'realtime';

      const ensureNavigation = (url: URL | string) => {
        const path = typeof url === 'string' ? url : url.pathname + url.search;
        if (useRouterNav) navigateWithRouter(path);
        else navigateWithLocation(path);
      };

      try {
        const argsObj = JSON.parse(argsText || '{}');

        if (fnName === 'search_properties') {
          const results = runPropertySearch(argsObj);
          setSearchResults(results);
          setFilterSummary(argsObj);
          try {
            const u = buildPropertiesUrl(argsObj);
            ensureNavigation(u);
          } catch {}
          return { handled: true, payload: { ok: true, count: results.length, results } };
        }

        if (fnName === 'open_page') {
          const path = (argsObj.path || '/').toString();
          const newTab = Boolean(argsObj.new_tab);
          rememberAutostart();
          if (newTab && typeof window !== 'undefined') window.open(path, '_blank');
          else ensureNavigation(path);
          return { handled: true, payload: { ok: true, path, newTab } };
        }

        if (fnName === 'set_filters') {
          const detail: Record<string, unknown> = {};
          if (typeof argsObj.q === 'string') detail.location = argsObj.q;
          if (typeof argsObj.location === 'string') detail.location = argsObj.location;
          if (typeof argsObj.district === 'string') detail.location = argsObj.district;
          const min = Number(argsObj.priceMin ?? argsObj.min_price ?? argsObj.minPrice ?? argsObj.price_min);
          const max = Number(argsObj.priceMax ?? argsObj.max_price ?? argsObj.maxPrice ?? argsObj.price_max);
          if (Number.isFinite(min) || Number.isFinite(max)) {
            detail.priceRange = [Number.isFinite(min) ? min : 0, Number.isFinite(max) ? max : 999999999];
          }
          const roomsVal = Number(argsObj.rooms ?? argsObj.bedrooms);
          if (Number.isFinite(roomsVal)) {
            const r = Number(roomsVal);
            detail.bedrooms = [r >= 5 ? '5+' : String(r)];
          }
          try {
            window.dispatchEvent(new CustomEvent('lumina:filters:set', { detail }));
          } catch {}
          try {
            const u = buildPropertiesUrl(argsObj);
            ensureNavigation(u);
          } catch {
            ensureNavigation('/properties');
          }
          return { handled: true, payload: { ok: true, applied: detail } };
        }

        if (fnName === 'set_view') {
          const view = (argsObj.view || 'map').toString();
          try {
            window.dispatchEvent(new CustomEvent('lumina:view:set', { detail: { view } }));
          } catch {}
          ensureNavigation('/properties');
          return { handled: true, payload: { ok: true, view } };
        }

        if (fnName === 'navigate_to_property') {
          const id = (argsObj.id || '').toString();
          if (!id) {
            return { handled: true, payload: { ok: false, error: 'missing_id' } };
          }
          ensureNavigation(`/properties/${id}`);
          return { handled: true, payload: { ok: true, id } };
        }

        if (fnName === 'open_first_property') {
          const first = searchResults[0];
          if (first && first.id) {
            ensureNavigation(`/properties/${first.id}`);
            return { handled: true, payload: { ok: true, id: first.id } };
          }
          ensureNavigation('/properties');
          return { handled: true, payload: { ok: false, error: 'no_results' } };
        }

        if (fnName === 'open_property_detail') {
          const id = (argsObj.id || '').toString();
          if (id) {
            ensureNavigation(`/properties/${id}`);
            return { handled: true, payload: { ok: true, id } };
          }
          return { handled: true, payload: { ok: false, error: 'missing_id' } };
        }
      } catch (error) {
        return { handled: true, payload: { ok: false, error: 'bad_args' } };
      }

      return { handled: false };
    },
    [
      buildPropertiesUrl,
      navigateWithLocation,
      navigateWithRouter,
      rememberAutostart,
      runPropertySearch,
      searchResults,
      setFilterSummary,
    ],
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setLastSearchSummary('');
  }, []);

  return useMemo(
    () => ({
      searchResults,
      lastSearchSummary,
      runPropertySearch,
      handleFunctionCall,
      clearSearchResults,
    }),
    [clearSearchResults, handleFunctionCall, lastSearchSummary, runPropertySearch, searchResults],
  );
};


