import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { propertyTypeSchema, transactionTypeSchema } from '@/types/models';
import { getMockProperties, type MockProperty } from '@/lib/mockProperties';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(60).optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  propertyType: propertyTypeSchema.optional(),
  transactionType: transactionTypeSchema.optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  amenities: z.string().optional(),
  sort: z.enum(['createdAt', 'price', 'views']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

// Minimal shape matching fields actually used by the frontend mapper (convertProperty)
type MockApiProperty = {
  id: string;
  title: string;
  price: number;
  currency: 'GEL' | 'USD' | 'EUR' | 'RUB';
  location: string;
  district?: string | null;
  city: string;
  propertyType: z.infer<typeof propertyTypeSchema>;
  transactionType: z.infer<typeof transactionTypeSchema>;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  floor?: number | null;
  amenities?: string[];
  imageUrls?: string[];
  isFeatured?: boolean;
};

function mapMockToApiProperty(item: MockProperty): MockApiProperty {
  const city = 'Tbilisi';
  const district = item.address;
  const location = `${city} ${district}`.trim();

  // Map mock status to transaction type enum
  const transactionType: z.infer<typeof transactionTypeSchema> =
    item.status === 'for-rent' ? 'rent' : 'sale';

  // Narrow mock type (string) to our propertyTypeSchema union
  const type = (item.type || 'apartment') as z.infer<typeof propertyTypeSchema>;

  return {
    id: `mock-${item.id}`,
    title: `Property #${item.id}`,
    price: item.price,
    currency: 'GEL',
    location,
    district,
    city,
    propertyType: type,
    transactionType,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.sqft,
    floor: item.floor ?? null,
    amenities: item.amenities ?? [],
    imageUrls: item.images ?? [item.image],
    isFeatured: item.isNew ?? false,
  };
}

function applyMockFilters(list: MockProperty[], params: z.infer<typeof querySchema>): MockProperty[] {
  let result = [...list];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((p) =>
      p.address.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
    );
  }

  if (params.city) {
    const c = params.city.toLowerCase();
    result = result.filter(() => c === 'tbilisi' || c === 'თბილისი'); // demo assumption
  }

  if (params.district) {
    const d = params.district.toLowerCase();
    result = result.filter((p) => p.address.toLowerCase().includes(d));
  }

  if (params.propertyType) {
    result = result.filter((p) => p.type === params.propertyType);
  }

  if (params.transactionType) {
    const wantRent = params.transactionType === 'rent';
    result = result.filter((p) =>
      wantRent ? p.status === 'for-rent' : p.status === 'for-sale',
    );
  }

  if (typeof params.priceMin === 'number') {
    result = result.filter((p) => p.price >= params.priceMin!);
  }
  if (typeof params.priceMax === 'number' && params.priceMax > 0) {
    result = result.filter((p) => p.price <= params.priceMax!);
  }

  if (typeof params.bedrooms === 'number') {
    result = result.filter((p) => p.bedrooms >= params.bedrooms!);
  }
  if (typeof params.bathrooms === 'number') {
    result = result.filter((p) => p.bathrooms >= params.bathrooms!);
  }

  if (params.amenities) {
    const requested = params.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (requested.length > 0) {
      result = result.filter((p) =>
        requested.every((a) => p.amenities?.includes(a)),
      );
    }
  }

  // simple sort by price/views/createdAt equivalent – we only have price
  if (params.sort === 'price') {
    const dir = params.sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => (a.price - b.price) * dir);
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      // Demo რეჟიმში არ ვაბრუნებთ 400-ს – უბრალოდ ვლოგავთ და ვხმარობთ default-ებს,
      // რომ UI-მ ყოველთვის იმუშაოს, თუნდაც query-ში უცნაური value შევიდეს.
      console.warn(
        'Invalid query params for /api/properties (mock mode), using defaults instead',
        parsed.error.flatten(),
      );
    }

    const params: z.infer<typeof querySchema> = parsed.success
      ? parsed.data
      : {
          page: 1,
          pageSize: 60,
        };

    // Demo/mock implementation: ემსახურება UI-ს, სანამ რეალურ DB-ს არ დავაკავშირებთ
    const all = getMockProperties(200);
    const filtered = applyMockFilters(all, params);

    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 24));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = filtered.slice(start, end);

    const items = slice.map(mapMockToApiProperty);

    return NextResponse.json({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in /api/properties (mock mode)', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load properties',
        },
      },
      { status: 500 },
    );
  }
}
