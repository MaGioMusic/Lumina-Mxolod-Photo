import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockProperties, MockProperty } from '@/lib/mockProperties';
import { runtimeFlags } from '@/lib/flags';
import { isAiToolSideEffectsEnabled, traceChatSideEffect } from '@/lib/chatSideEffectsGuard';

type ToolCallTransport = 'realtime' | 'websocket';

interface PropertySearchHookOptions {
  isChatOpen: boolean;
}

export interface PropertyFunctionCallResult {
  handled: boolean;
  payload?: Record<string, unknown>;
}

export type PropertyFunctionCallResultLike =
  | PropertyFunctionCallResult
  | Promise<PropertyFunctionCallResult>;

const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'penthouse'];

export const usePropertySearch = ({ isChatOpen }: PropertySearchHookOptions) => {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<MockProperty[]>([]);
  const [lastSearchSummary, setLastSearchSummary] = useState('');
  const isDemoMode = runtimeFlags.demoModeOn;
  // Safety default: tool calls should not mutate UI/navigation unless explicitly enabled.
  const allowToolSideEffects = isAiToolSideEffectsEnabled();

  const runPropertySearch = useCallback((rawArgs: unknown): MockProperty[] => {
    if (!isDemoMode) return [];
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
      // IMPORTANT:
      // - Return the FULL filtered list (so tools like open_nth_result can work for any index)
      // - We'll only return a compact preview to the model in toolResponse to avoid token bloat.
      return list;
    } catch {
      return getMockProperties(100);
    }
  }, [isDemoMode]);

  const buildResultsPreview = useCallback((results: MockProperty[], rawArgs: unknown) => {
    const args = (() => {
      try {
        return typeof rawArgs === 'string' ? JSON.parse(rawArgs) : (rawArgs || {});
      } catch {
        return {};
      }
    })() as Record<string, unknown>;
    const limitRaw = Number(args.limit);
    const previewLimit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(10, limitRaw)) : 6;
    const preview = results.slice(0, previewLimit).map((p) => ({
      id: `mock-${p.id}`,
      price: p.price,
      address: p.address,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.sqft,
      type: p.type,
      status: p.status,
      isNew: Boolean(p.isNew),
    }));
    return { previewLimit, preview };
  }, []);

  const rememberAutostart = useCallback(() => {
    try {
      window.sessionStorage.setItem('lumina_ai_autostart', isChatOpen ? '1' : '0');
      // Preserve current interaction mode if already set (voice/text).
      // Default to text so navigation doesn't auto-start voice unexpectedly.
      const existing = window.sessionStorage.getItem('lumina_ai_autostart_mode');
      if (!existing) window.sessionStorage.setItem('lumina_ai_autostart_mode', 'text');
    } catch {
      // ignore storage errors in restricted contexts (SSR/tests)
    }
  }, [isChatOpen]);

  const getCid = useCallback((): string => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('cid') || window.sessionStorage.getItem('lumina_cid') || '';
    } catch {
      return '';
    }
  }, []);

  const withCid = useCallback(
    (pathOrUrl: string) => {
      try {
        const cid = getCid();
        if (!cid) return pathOrUrl;
        const u = new URL(pathOrUrl, window.location.origin);
        if (!u.searchParams.get('cid')) u.searchParams.set('cid', cid);
        return u.pathname + u.search;
      } catch {
        return pathOrUrl;
      }
    },
    [getCid],
  );

  const navigateWithRouter = useCallback(
    (path: string) => {
      rememberAutostart();
      router.push(withCid(path));
    },
    [rememberAutostart, router, withCid],
  );

  const navigateWithLocation = useCallback((path: string) => {
    rememberAutostart();
    if (typeof window !== 'undefined') {
      window.location.href = withCid(path);
    }
  }, [rememberAutostart, withCid]);

  const buildPropertiesUrl = useCallback((argsObj: Record<string, unknown>) => {
    const u = new URL('/properties', window.location.origin);
    const cid = getCid();
    if (cid) u.searchParams.set('cid', cid);
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
  }, [getCid]);

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
    (fnName: string, argsText: string, context?: { transport?: ToolCallTransport }): PropertyFunctionCallResultLike => {
      const transport = context?.transport ?? 'realtime';
      const useRouterNav = transport === 'realtime';

      const ensureNavigation = (url: URL | string) => {
        const path = typeof url === 'string' ? url : url.pathname + url.search;
        if (useRouterNav) navigateWithRouter(path);
        else navigateWithLocation(path);
      };

      const navigateIfAllowed = (url: URL | string, effect: string) => {
        const path = typeof url === 'string' ? url : url.pathname + url.search;
        if (!allowToolSideEffects) {
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: false,
            detail: { path },
          });
          return false;
        }
        try {
          ensureNavigation(path);
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: true,
            detail: { path },
          });
          return true;
        } catch {
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: true,
            detail: { path, navigateFailed: true },
          });
          return false;
        }
      };

      const dispatchEventIfAllowed = (
        eventName: string,
        detail: Record<string, unknown>,
        effect: string,
      ) => {
        if (!allowToolSideEffects) {
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: false,
            detail: { eventName, keys: Object.keys(detail) },
          });
          return false;
        }
        try {
          window.dispatchEvent(new CustomEvent(eventName, { detail }));
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: true,
            detail: { eventName, keys: Object.keys(detail) },
          });
          return true;
        } catch {
          traceChatSideEffect({
            source: 'usePropertySearch',
            effect,
            allowed: true,
            detail: { eventName, dispatchFailed: true },
          });
          return false;
        }
      };

      try {
        const argsObj = JSON.parse(argsText || '{}');

        if (fnName === 'get_nearby_places') {
          const address = typeof argsObj.address === 'string' ? argsObj.address.trim() : '';
          const radius = Number(argsObj.radius_m);
          const types = Array.isArray(argsObj.types) ? argsObj.types : undefined;
          if (!address) {
            return { handled: true, payload: { ok: false, error: 'missing_address' } };
          }
          if (!Number.isFinite(radius) || radius <= 0) {
            return { handled: true, payload: { ok: false, error: 'missing_radius' } };
          }
          return (async () => {
            try {
              const res = await fetch('/api/places', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ address, radius_m: radius, types }),
              });
              const data = await res.json().catch(() => null);
              if (data && typeof data === 'object') {
                dispatchEventIfAllowed(
                  'lumina:places:result',
                  data as Record<string, unknown>,
                  'nearby_places_result_event',
                );
              }
              return {
                handled: true,
                payload: data && typeof data === 'object' ? data : { ok: false, error: 'bad_response' },
              };
            } catch {
              return { handled: true, payload: { ok: false, error: 'request_failed' } };
            }
          })();
        }

        if (fnName === 'search_properties') {
          if (!isDemoMode) {
            return { handled: true, payload: { ok: false, error: 'demo_mode_disabled' } };
          }
          const full = runPropertySearch(argsObj);
          setSearchResults(full);
          setFilterSummary(argsObj);
          let navigationApplied = false;
          try {
            const u = buildPropertiesUrl(argsObj);
            navigationApplied = navigateIfAllowed(u, 'search_properties_navigate');
          } catch {
            traceChatSideEffect({
              source: 'usePropertySearch',
              effect: 'search_properties_navigate',
              allowed: allowToolSideEffects,
              detail: { urlBuildFailed: true },
            });
          }
          const { previewLimit, preview } = buildResultsPreview(full, argsObj);
          return {
            handled: true,
            payload: {
              ok: true,
              total_count: full.length,
              returned_count: preview.length,
              results_preview: preview,
              preview_limit: previewLimit,
              side_effects_applied: navigationApplied,
            },
          };
        }

        if (fnName === 'open_page') {
          const path = (argsObj.path || '/').toString();
          const newTab = Boolean(argsObj.new_tab);
          let opened = false;
          if (allowToolSideEffects) {
            rememberAutostart();
            if (newTab && typeof window !== 'undefined') {
              window.open(path, '_blank');
              traceChatSideEffect({
                source: 'usePropertySearch',
                effect: 'open_page_new_tab',
                allowed: true,
                detail: { path },
              });
              opened = true;
            } else {
              opened = navigateIfAllowed(path, 'open_page_navigate');
            }
          } else {
            traceChatSideEffect({
              source: 'usePropertySearch',
              effect: 'open_page_navigate',
              allowed: false,
              detail: { path, newTab },
            });
          }
          return {
            handled: true,
            payload: {
              ok: opened,
              path,
              newTab,
              ...(opened ? {} : { error: 'side_effects_disabled' }),
            },
          };
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
          const eventApplied = dispatchEventIfAllowed(
            'lumina:filters:set',
            detail,
            'set_filters_event',
          );
          let navigationApplied = false;
          try {
            const u = buildPropertiesUrl(argsObj);
            navigationApplied = navigateIfAllowed(u, 'set_filters_navigate');
          } catch {
            navigationApplied = navigateIfAllowed('/properties', 'set_filters_navigate_fallback');
          }
          return {
            handled: true,
            payload: {
              ok: eventApplied || navigationApplied,
              applied: detail,
              event_applied: eventApplied,
              navigation_applied: navigationApplied,
              ...((eventApplied || navigationApplied) ? {} : { error: 'side_effects_disabled' }),
            },
          };
        }

        if (fnName === 'set_view') {
          const view = (argsObj.view || 'map').toString();
          const eventApplied = dispatchEventIfAllowed(
            'lumina:view:set',
            { view },
            'set_view_event',
          );
          const navigationApplied = navigateIfAllowed('/properties', 'set_view_navigate');
          return {
            handled: true,
            payload: {
              ok: eventApplied || navigationApplied,
              view,
              event_applied: eventApplied,
              navigation_applied: navigationApplied,
              ...((eventApplied || navigationApplied) ? {} : { error: 'side_effects_disabled' }),
            },
          };
        }

        if (fnName === 'navigate_to_property') {
          const id = (argsObj.id || '').toString();
          if (!id) {
            return { handled: true, payload: { ok: false, error: 'missing_id' } };
          }
          const didNavigate = navigateIfAllowed(`/properties/${id}`, 'navigate_to_property');
          return {
            handled: true,
            payload: {
              ok: didNavigate,
              id,
              ...(didNavigate ? {} : { error: 'side_effects_disabled' }),
            },
          };
        }

        if (fnName === 'open_first_property') {
          if (!isDemoMode) {
            return { handled: true, payload: { ok: false, error: 'demo_mode_disabled' } };
          }
          // If the user asked to open a property without searching first,
          // create a default result set so open_first_property works.
          const ensureList = () => {
            if (searchResults.length) return searchResults;
            const full = runPropertySearch({});
            setSearchResults(full);
            return full;
          };
          const list = ensureList();
          const first = list[0];
          if (first && first.id) {
            const id = `mock-${first.id}`;
            const didNavigate = navigateIfAllowed(`/properties/${id}`, 'open_first_property');
            return {
              handled: true,
              payload: {
                ok: didNavigate,
                id,
                total_count: list.length,
                ...(didNavigate ? {} : { error: 'side_effects_disabled' }),
              },
            };
          }
          navigateIfAllowed('/properties', 'open_first_property_fallback');
          return { handled: true, payload: { ok: false, error: 'no_results' } };
        }

        if (fnName === 'open_nth_result') {
          if (!isDemoMode) {
            return { handled: true, payload: { ok: false, error: 'demo_mode_disabled' } };
          }
          const indexRaw = Number(argsObj.index);
          const idx = Number.isFinite(indexRaw) ? Math.floor(indexRaw) - 1 : -1; // 1-based -> 0-based
          if (idx < 0) return { handled: true, payload: { ok: false, error: 'bad_index' } };
          const ensureList = () => {
            if (searchResults.length) return searchResults;
            const full = runPropertySearch({});
            setSearchResults(full);
            return full;
          };
          const list = ensureList();
          const item = list[idx];
          if (item?.id) {
            const id = `mock-${item.id}`;
            const didNavigate = navigateIfAllowed(`/properties/${id}`, 'open_nth_result');
            return {
              handled: true,
              payload: {
                ok: didNavigate,
                id,
                index: idx + 1,
                total_count: list.length,
                ...(didNavigate ? {} : { error: 'side_effects_disabled' }),
              },
            };
          }
          return { handled: true, payload: { ok: false, error: 'index_out_of_range', index: idx + 1, total_count: list.length } };
        }

        if (fnName === 'list_results') {
          if (!isDemoMode) {
            return { handled: true, payload: { ok: false, error: 'demo_mode_disabled' } };
          }
          const offsetRaw = Number(argsObj.offset);
          const limitRaw = Number(argsObj.limit);
          const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;
          const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(10, Math.floor(limitRaw))) : 6;
          const slice = searchResults.slice(offset, offset + limit).map((p) => ({
            id: `mock-${p.id}`,
            price: p.price,
            address: p.address,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            area: p.sqft,
            type: p.type,
            status: p.status,
            isNew: Boolean(p.isNew),
          }));
          return {
            handled: true,
            payload: {
              ok: true,
              total_count: searchResults.length,
              offset,
              returned_count: slice.length,
              results_preview: slice,
            },
          };
        }

        if (fnName === 'open_property_detail') {
          const id = (argsObj.id || '').toString();
          if (id) {
            const didNavigate = navigateIfAllowed(`/properties/${id}`, 'open_property_detail');
            return {
              handled: true,
              payload: {
                ok: didNavigate,
                id,
                ...(didNavigate ? {} : { error: 'side_effects_disabled' }),
              },
            };
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
      buildResultsPreview,
      navigateWithLocation,
      navigateWithRouter,
      rememberAutostart,
      runPropertySearch,
      searchResults,
      setFilterSummary,
      isDemoMode,
      allowToolSideEffects,
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


