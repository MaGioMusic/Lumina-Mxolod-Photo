import { useEffect, useRef, useMemo } from 'react';

'use client';

import { loadMaps, loadMarker } from '@/lib/googleMaps';
import { useRouter } from 'next/navigation';

type GmProperty = {
  id: number | string;
  title?: string;
  price?: string | number;
  image?: string;
  coordinates: [number, number];
  district?: string;
};

interface GoogleMapViewProps {
  properties: GmProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyHighlight?: (id: number | string) => void;
}

export default function GoogleMapView({ properties, center, zoom = 12, onPropertyHighlight }: GoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>([]);
  const router = useRouter();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || '';

  const initialCenter = useMemo(() => {
    if (center) return center;
    return { lat: 41.7151, lng: 44.7661 }; // Tbilisi default
  }, [center]);

  useEffect(() => {
    let cleanup = () => {};
    let focusHandler: EventListener | null = null;

    (async () => {
      const { Map } = await loadMaps();
      const { AdvancedMarkerElement, PinElement } = await loadMarker();

      if (!containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: initialCenter,
        zoom,
        gestureHandling: 'greedy',
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        ...(mapId ? { mapId } : {}),
      });
      mapRef.current = map;

      const ms: Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker> = [];
      for (const p of properties) {
        const position = { lat: p.coordinates[0], lng: p.coordinates[1] };
        let marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
        const canUseAdvanced = Boolean(mapId && AdvancedMarkerElement && PinElement);
        if (canUseAdvanced) {
          const pin = new PinElement({ background: '#F08336', borderColor: '#C96C2E', glyphColor: '#fff', scale: 1.0 });
          marker = new AdvancedMarkerElement({ position, map, content: pin.element, title: String(p.title || p.id) }) as google.maps.marker.AdvancedMarkerElement;
          marker.addListener('gmp-click', () => {
            onPropertyHighlight?.(p.id);
            router.push(`/properties/${p.id}`);
          });
        } else {
          marker = new google.maps.Marker({ position, map, title: String(p.title || p.id) });
          marker.addListener('click', () => {
            onPropertyHighlight?.(p.id);
            router.push(`/properties/${p.id}`);
          });
        }
        ms.push(marker);
      }
      markersRef.current = ms;

      const handler = (e: Event) => {
        try {
          const ce = e as CustomEvent<any>;
          const { lat, lng, zoom: z } = ce.detail || {};
          if (typeof lat === 'number' && typeof lng === 'number') {
            if (typeof z === 'number') map.panTo({ lat, lng }), map.setZoom(z);
            else map.panTo({ lat, lng });
          }
        } catch {}
      };
      focusHandler = handler as EventListener;
      window.addEventListener('lumina:map:focus', focusHandler);

      cleanup = () => {
        try { window.removeEventListener('lumina:map:focus', focusHandler!); } catch {}
        try {
          for (const m of markersRef.current) {
            if ('map' in m) (m as any).map = null;
            if ('setMap' in m) (m as google.maps.Marker).setMap(null);
          }
          markersRef.current = [];
        } catch {}
      };
    })();

    return () => { cleanup(); };
  }, [apiKey, initialCenter, zoom, properties, onPropertyHighlight, router]);

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
}
