import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { propertyTypeSchema, transactionTypeSchema } from '@/types/models';
import { listProperties, PropertyListParams } from '@/lib/repo/properties';
import { PropertyType, TransactionType } from '@prisma/client';

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
