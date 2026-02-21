import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { propertyTypeSchema, transactionTypeSchema } from '@/types/models';
import { listProperties, PropertyListParams } from '@/lib/repo/properties';
import { PropertyType, TransactionType } from '@prisma/client';
import { getMockProperties } from '@/lib/mockProperties';
import { prisma } from '@/lib/prisma';
import { requireUser, errorResponse, jsonResponse } from '../utils';

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

export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      console.warn(
        'Invalid query params for /api/properties',
        parsed.error.flatten(),
      );
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // Build Prisma query params
    const listParams: PropertyListParams = {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      city: params.city,
      district: params.district,
      propertyType: params.propertyType as PropertyType | undefined,
      transactionType: params.transactionType as TransactionType | undefined,
      priceMin: params.priceMin,
      priceMax: params.priceMax,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      amenities: params.amenities?.split(',').map(a => a.trim()).filter(Boolean),
      sort: params.sort,
      sortDir: params.sortDir,
    };

    // Graceful fallback for environments where DB is not wired yet
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set; returning mock properties result.');

      const mock = getMockProperties(100);
      const search = (params.search ?? '').toLowerCase().trim();
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 20;

      const filtered = mock.filter((p) => {
        if (search) {
          const hay = `${p.address} ${p.type} ${p.status}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        if (params.transactionType) {
          const target = params.transactionType === 'rent' ? 'for-rent' : 'for-sale';
          if (p.status !== target) return false;
        }
        if (params.propertyType && p.type !== params.propertyType.toLowerCase()) return false;
        if (typeof params.priceMin === 'number' && p.price < params.priceMin) return false;
        if (typeof params.priceMax === 'number' && p.price > params.priceMax) return false;
        if (typeof params.bedrooms === 'number' && p.bedrooms < params.bedrooms) return false;
        if (typeof params.bathrooms === 'number' && p.bathrooms < params.bathrooms) return false;
        return true;
      });

      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      const items = paged.map((p) => ({
        id: `mock-${p.id}`,
        agentId: null,
        title: `Property #${p.id}`,
        description: null,
        price: p.price,
        currency: 'GEL',
        location: `Tbilisi ${p.address}`,
        district: p.address,
        city: 'Tbilisi',
        country: 'Georgia',
        propertyType: p.type,
        transactionType: p.status === 'for-rent' ? 'rent' : 'sale',
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.sqft,
        floor: p.floor ?? null,
        totalFloors: null,
        constructionYear: p.year ?? null,
        condition: 'good',
        furnished: 'furnished',
        amenities: p.amenities ?? [],
        imageUrls: p.images ?? [p.image],
        latitude: null,
        longitude: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFeatured: Boolean(p.isNew),
        featuredUntil: null,
        viewsCount: 0,
      }));

      return NextResponse.json({
        items,
        total: filtered.length,
        page,
        pageSize,
      });
    }

    // Query the database via Prisma
    const result = await listProperties(listParams);

    return NextResponse.json({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    console.error('Error in /api/properties', error);
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

// POST /api/properties — Create new property (agent/admin only)
const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('GEL'),
  location: z.string().min(1, 'Location is required'),
  district: z.string().optional(),
  city: z.string().default('Tbilisi'),
  country: z.string().default('Georgia'),
  propertyType: propertyTypeSchema,
  transactionType: transactionTypeSchema,
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  constructionYear: z.number().int().optional(),
  condition: z.string().optional(),
  furnished: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require agent or admin role
    const user = await requireUser(request, ['agent', 'admin']);

    const body = await request.json();
    const payload = createPropertySchema.parse(body);

    // Create property in database
    const property = await prisma.property.create({
      data: {
        ...payload,
        agentId: user.id,
        status: 'active',
      },
    });

    return jsonResponse(property, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
