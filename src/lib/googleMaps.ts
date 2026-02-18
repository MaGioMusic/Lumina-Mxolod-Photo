'use client';

import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let loaderInitialized = false;

function getApiKey(): string {
  // Read only from env; no hardcoded fallback
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
}

function ensureMapsLoader(): void {
  if (loaderInitialized) return;
  const apiKey = getApiKey();
  // თუ გასაღები არაა დაყენებული, ჩუმად გავჩერდეთ (დევში ერთი გაფრთხილება)
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      try { console.warn('[maps] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set; skipping loader init'); } catch {}
    }
    return;
  }
  // setOptions expects { key, v } in current @googlemaps/js-api-loader types
  setOptions({ key: apiKey, v: 'weekly' });
  loaderInitialized = true;
}

export async function loadMaps() {
  ensureMapsLoader();
  return (await importLibrary('maps')) as google.maps.MapsLibrary;
}

export async function loadMarker() {
  ensureMapsLoader();
  return (await importLibrary('marker')) as google.maps.MarkerLibrary;
}

export async function loadPlaces() {
  ensureMapsLoader();
  return (await importLibrary('places')) as google.maps.PlacesLibrary;
}


