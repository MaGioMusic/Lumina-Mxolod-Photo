'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadMaps, loadMarker, loadPlaces } from '@/lib/googleMaps';

type Coords = { lat: number; lng: number };

interface SinglePropertyGoogleMapProps {
  coordinates: Coords;
  propertyTitle: string;
  propertyPrice: string;
  propertyAddress: string;
  propertyImage?: string;
}

const DEFAULT_CATEGORIES = [
  'pharmacy',
  'supermarket',
  'school',
  'restaurant',
  'cafe',
  'bank',
  'hospital',
  'park',
  'bus_station',
  'subway_station',
];

export default function SinglePropertyGoogleMap({ coordinates, propertyTitle, propertyPrice, propertyAddress, propertyImage }: SinglePropertyGoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || '';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mainMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const placesMarkersRef = useRef<Record<string, Array<google.maps.Marker>>>({});
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [radius, setRadius] = useState<number>(1000);
  const [selected, setSelected] = useState<string[]>(['pharmacy', 'supermarket', 'school', 'subway_station']);
  const [isTransitOn, setTransitOn] = useState<boolean>(true);

  const handleToggle = useCallback((type: string) => {
    setSelected((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : prev.concat(type)));
  }, []);

  const categories = DEFAULT_CATEGORIES;

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      const { Map } = await loadMaps();
      const { AdvancedMarkerElement } = await loadMarker();
      if (!containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: coordinates,
        zoom: 15,
        gestureHandling: 'greedy',
        clickableIcons: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        ...(mapId ? { mapId } : {}),
      });
      mapRef.current = map;

      // Main marker
      if (AdvancedMarkerElement) {
        mainMarkerRef.current = new AdvancedMarkerElement({ position: coordinates, map, title: propertyTitle }) as any;
      } else {
        mainMarkerRef.current = new google.maps.Marker({ position: coordinates, map, title: propertyTitle });
      }

      // Transit layer
      let transitLayer: google.maps.TransitLayer | null = null;
      if (isTransitOn) {
        transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
      }

      const { PlacesService } = await loadPlaces();
      serviceRef.current = new PlacesService(map);

      const doNearby = (type: string) => {
        const svc = serviceRef.current;
        if (!svc) return;
        svc.nearbySearch(
          { location: coordinates, radius, type: type as any },
        (results, status) => {
            if (status !== (google.maps.places.PlacesServiceStatus?.OK || 'OK') || !results) return;
            const ms: google.maps.Marker[] = [];
            for (const r of results) {
              if (!r.geometry?.location) continue;
              const m = new google.maps.Marker({ map, position: r.geometry.location, title: r.name });
              // Build safe content via textContent to avoid HTML injection
              const container = document.createElement('div');
              const titleEl = document.createElement('div');
              titleEl.style.fontWeight = '600';
              titleEl.style.marginBottom = '4px';
              titleEl.textContent = r.name ?? '';
              const subEl = document.createElement('div');
              subEl.style.fontSize = '12px';
              subEl.style.color = '#4b5563';
              subEl.textContent = r.vicinity ?? '';
              container.appendChild(titleEl);
              container.appendChild(subEl);
              const iw = new google.maps.InfoWindow({ content: container });
              m.addListener('click', () => iw.open({ map, anchor: m }));
              ms.push(m);
            }
            placesMarkersRef.current[type] = ms;
          }
        );
      };

      // initial fetch for defaults
      for (const t of selected) doNearby(t);

      cleanup = () => {
        try { transitLayer?.setMap(null as any); } catch {}
        try { (mainMarkerRef.current as any)?.setMap?.(null); } catch {}
        try { Object.values(placesMarkersRef.current).flat().forEach(m => m.setMap(null)); } catch {}
        placesMarkersRef.current = {};
      };
    })();

    return () => { cleanup(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, coordinates.lat, coordinates.lng]);

  // Re-run places fetch whenever filters or radius change
  useEffect(() => {
    const map = mapRef.current;
    const svc = serviceRef.current;
    if (!map || !svc) return;
    // clear existing
    try { Object.values(placesMarkersRef.current).flat().forEach(m => m.setMap(null)); } catch {}
    placesMarkersRef.current = {};
    // fetch again
    selected.forEach((t) => {
      svc.nearbySearch(
        { location: coordinates, radius, type: t as any },
        (results, status) => {
          if (status !== (google.maps.places.PlacesServiceStatus?.OK || 'OK') || !results) return;
          const ms: google.maps.Marker[] = [];
          for (const r of results) {
            if (!r.geometry?.location) continue;
            const m = new google.maps.Marker({ map, position: r.geometry.location, title: r.name });
            // Build safe content via textContent to avoid HTML injection
            const container = document.createElement('div');
            const titleEl = document.createElement('div');
            titleEl.style.fontWeight = '600';
            titleEl.style.marginBottom = '4px';
            titleEl.textContent = r.name ?? '';
            const subEl = document.createElement('div');
            subEl.style.fontSize = '12px';
            subEl.style.color = '#4b5563';
            subEl.textContent = r.vicinity ?? '';
            container.appendChild(titleEl);
            container.appendChild(subEl);
            const iw = new google.maps.InfoWindow({ content: container });
            m.addListener('click', () => iw.open({ map, anchor: m }));
            ms.push(m);
          }
          placesMarkersRef.current[t] = ms;
        }
      );
    });
  }, [selected, radius, coordinates]);

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {DEFAULT_CATEGORIES.map((c) => (
            <label key={c} className="inline-flex items-center gap-1">
              <input type="checkbox" checked={selected.includes(c)} onChange={() => handleToggle(c)} />
              <span className="capitalize">{c.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-1">
            Radius (m)
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="border px-1 py-0.5 rounded">
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={1500}>1500</option>
              <option value={2000}>2000</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="checkbox" checked={isTransitOn} onChange={() => setTransitOn((v) => !v)} /> Transit
          </label>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-[calc(100%-36px)]" />
    </div>
  );
}


