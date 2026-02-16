'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadMaps } from '@/lib/googleMaps';

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  type: string;
  status?: 'for-sale' | 'for-rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  coordinates: [number, number];
  district: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface PropertiesGoogleMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  hoveredPropertyId: number | null;
  onPropertyHover: (propertyId: number | null) => void;
  onPropertySelect: (property: Property) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}

export default function PropertiesGoogleMap({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertyHover,
  onPropertySelect,
  onBoundsChange,
}: PropertiesGoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || '';
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasFitBounds = useRef(false);
  const hasInitializedMap = useRef(false);
  const initialCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const aiMarkersRef = useRef<google.maps.Marker[]>([]);
  const isDev = process.env.NODE_ENV === 'development';

  const center = useMemo(() => {
    const first = properties[0];
    return first ? { lat: first.coordinates[0], lng: first.coordinates[1] } : { lat: 41.7151, lng: 44.7661 };
  }, [properties]);

  const updateBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    onBoundsChange({
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
    });
  }, [onBoundsChange]);

  const updateMarkerIcon = useCallback((marker: google.maps.Marker, isActive: boolean) => {
    marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: isActive ? 9 : 6,
      fillColor: isActive ? '#F08336' : '#D97706',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    });
  }, []);

  const syncMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const nextIds = new Set(properties.map((p) => p.id));
    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        if ('setMap' in marker) marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    properties.forEach((property) => {
      if (markersRef.current.has(property.id)) return;
      const position = { lat: property.coordinates[0], lng: property.coordinates[1] };
      const marker = new google.maps.Marker({
        map,
        position,
        title: property.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#F08336',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('mouseover', () => onPropertyHover(property.id));
      marker.addListener('mouseout', () => onPropertyHover(null));
      marker.addListener('click', () => onPropertySelect(property));

      markersRef.current.set(property.id, marker);
    });
  }, [onPropertyHover, onPropertySelect, properties]);

  const clearAiMarkers = useCallback(() => {
    aiMarkersRef.current.forEach((marker) => marker.setMap(null));
    aiMarkersRef.current = [];
  }, []);

  const renderAiPlaces = useCallback((payload: any) => {
    const map = mapRef.current;
    if (!map || !payload || payload.ok !== true) return;
    const center = payload.center;
    const categories = Array.isArray(payload.categories) ? payload.categories : [];
    clearAiMarkers();

    const bounds = new google.maps.LatLngBounds();
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      bounds.extend(center);
    }

    categories.forEach((group: any) => {
      const label = String(group?.label || '');
      const results = Array.isArray(group?.results) ? group.results : [];
      results.forEach((item: any) => {
        const loc = item?.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;
        const marker = new google.maps.Marker({
          map,
          position: { lat: loc.lat, lng: loc.lng },
          title: item?.name || label,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
          },
        });

        const container = document.createElement('div');
        const titleEl = document.createElement('div');
        titleEl.style.fontWeight = '600';
        titleEl.style.marginBottom = '4px';
        titleEl.textContent = item?.name || '';
        const subEl = document.createElement('div');
        subEl.style.fontSize = '12px';
        subEl.style.color = '#4b5563';
        subEl.textContent = item?.address || '';
        const typeEl = document.createElement('div');
        typeEl.style.fontSize = '11px';
        typeEl.style.color = '#9ca3af';
        typeEl.textContent = label;
        container.appendChild(titleEl);
        container.appendChild(subEl);
        container.appendChild(typeEl);
        const infoWindow = new google.maps.InfoWindow({ content: container });
        marker.addListener('click', () => infoWindow.open({ map, anchor: marker }));

        aiMarkersRef.current.push(marker);
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      });
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 80);
    } else if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setCenter(center);
      map.setZoom(14);
    }
  }, [clearAiMarkers]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      renderAiPlaces(detail);
    };
    window.addEventListener('lumina:places:result', handler as EventListener);
    return () => window.removeEventListener('lumina:places:result', handler as EventListener);
  }, [renderAiPlaces]);

  // Initialize map
  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!containerRef.current) return;
      if (!apiKey) return;
      if (hasInitializedMap.current && mapRef.current) return;

      if (!initialCenterRef.current) {
        initialCenterRef.current = center;
      }

      const { Map } = await loadMaps();
      const map = new Map(containerRef.current, {
        center: initialCenterRef.current,
        zoom: 12,
        gestureHandling: 'greedy',
        clickableIcons: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        mapTypeId: mapType,
        ...(mapId ? { mapId } : {}),
      });
      mapRef.current = map;
      hasInitializedMap.current = true;

      map.addListener('idle', () => {
        updateBounds();
      });

      cleanup = () => {
        try { map.unbindAll(); } catch {}
        clearAiMarkers();
      };
    })();

    return () => cleanup();
  }, [apiKey, center, clearAiMarkers, mapId, mapType, updateBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.setCenter(center);
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setMapTypeId(mapType);
  }, [mapType]);

  // Fit bounds once on initial properties load
  useEffect(() => {
    try {
      const map = mapRef.current;
      if (!map || !properties.length || hasFitBounds.current) return;
      const bounds = new google.maps.LatLngBounds();
      properties.forEach((p) => bounds.extend({ lat: p.coordinates[0], lng: p.coordinates[1] }));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 60);
        hasFitBounds.current = true;
        updateBounds();
      }
    } catch {}
  }, [properties, updateBounds]);

  // Keep markers in sync and update active styles
  useEffect(() => {
    if (!mapRef.current) return;
    syncMarkers();
  }, [syncMarkers]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const isActive = String(id) === selectedPropertyId || id === hoveredPropertyId;
      updateMarkerIcon(marker, isActive);
    });
  }, [hoveredPropertyId, selectedPropertyId, updateMarkerIcon]);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        Google Maps API key is missing.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/40 bg-white/90 p-1 shadow-md backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            mapType === 'roadmap'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          Standard
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            mapType === 'satellite'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
