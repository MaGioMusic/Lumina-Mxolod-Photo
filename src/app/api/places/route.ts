import { NextResponse } from 'next/server';

type PlaceTypeKey = 'metro' | 'school' | 'kindergarten' | 'market';

const TYPE_MAP: Record<PlaceTypeKey, { type: string; label: string }> = {
  metro: { type: 'subway_station', label: 'Metro' },
  school: { type: 'school', label: 'School' },
  kindergarten: { type: 'preschool', label: 'Kindergarten' },
  market: { type: 'supermarket', label: 'Market' },
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function geocodeAddress(address: string, apiKey: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', apiKey);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.status !== 'OK' || !Array.isArray(json.results) || json.results.length === 0) {
    return null;
  }
  const first = json.results[0];
  const loc = first?.geometry?.location;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
  return {
    location: { lat: loc.lat, lng: loc.lng },
    formattedAddress: String(first.formatted_address || address),
  };
}

async function fetchNearby(
  apiKey: string,
  origin: { lat: number; lng: number },
  radiusMeters: number,
  key: PlaceTypeKey,
) {
  const typeEntry = TYPE_MAP[key];
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${origin.lat},${origin.lng}`);
  url.searchParams.set('radius', String(radiusMeters));
  url.searchParams.set('type', typeEntry.type);
  url.searchParams.set('key', apiKey);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.status !== 'OK' || !Array.isArray(json.results)) {
    return { key, label: typeEntry.label, results: [], status: json.status ?? 'UNKNOWN' };
  }
  const results = json.results.slice(0, 6).map((item: any) => {
    const loc = item?.geometry?.location;
    const lat = typeof loc?.lat === 'number' ? loc.lat : null;
    const lng = typeof loc?.lng === 'number' ? loc.lng : null;
    const distance =
      typeof lat === 'number' && typeof lng === 'number'
        ? Math.round(haversineMeters(origin, { lat, lng }))
        : null;
    return {
      name: String(item?.name ?? ''),
      address: String(item?.vicinity ?? ''),
      location: lat && lng ? { lat, lng } : null,
      distance_m: distance,
      rating: typeof item?.rating === 'number' ? item.rating : null,
      user_ratings_total: typeof item?.user_ratings_total === 'number' ? item.user_ratings_total : null,
    };
  });
  return { key, label: typeEntry.label, results, status: 'OK' };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          address?: string;
          radius_m?: number;
          types?: PlaceTypeKey[];
        }
      | null;
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      '';
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 400 });
    }
    if (!body?.address || typeof body.address !== 'string') {
      return NextResponse.json({ ok: false, error: 'missing_address' }, { status: 400 });
    }
    const radiusRaw = Number(body.radius_m);
    if (!Number.isFinite(radiusRaw) || radiusRaw <= 0) {
      return NextResponse.json({ ok: false, error: 'missing_radius' }, { status: 400 });
    }

    const geocoded = await geocodeAddress(body.address, apiKey);
    if (!geocoded) {
      return NextResponse.json({ ok: false, error: 'geocode_failed' }, { status: 400 });
    }

    const types = Array.isArray(body.types) && body.types.length
      ? body.types.filter((t): t is PlaceTypeKey => t in TYPE_MAP)
      : (['metro', 'school', 'kindergarten', 'market'] as PlaceTypeKey[]);

    const grouped = await Promise.all(
      types.map((key) => fetchNearby(apiKey, geocoded.location, radiusRaw, key)),
    );

    return NextResponse.json({
      ok: true,
      address: geocoded.formattedAddress,
      center: geocoded.location,
      radius_m: radiusRaw,
      categories: grouped,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
