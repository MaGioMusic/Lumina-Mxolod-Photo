import { Prisma, PropertyStatus, PropertyType, TransactionType } from '@prisma/client';
import type { Property, PropertyAnalytics, PublicAgent } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { mapProperty, mapPropertyAnalytics, mapPublicAgent } from './mappers';

type PropertySortKey = 'createdAt' | 'price' | 'views';

export interface PropertyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  district?: string;
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  sort?: PropertySortKey;
  sortDir?: 'asc' | 'desc';
}

const toInsensitive = (value?: string) =>
  value ? { equals: value, mode: 'insensitive' as const } : undefined;

const buildWhere = (params: PropertyListParams): Prisma.PropertyWhereInput => {
  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.active,
  };

  if (params.city) where.city = toInsensitive(params.city);
  if (params.district) where.district = toInsensitive(params.district);
  if (params.propertyType) where.propertyType = params.propertyType;
  if (params.transactionType) where.transactionType = params.transactionType;
  if (params.priceMin || params.priceMax) {
    where.price = {};
    if (params.priceMin) where.price.gte = params.priceMin;
    if (params.priceMax) where.price.lte = params.priceMax;
  }
  if (params.bedrooms) where.bedrooms = { gte: params.bedrooms };
  if (params.bathrooms) where.bathrooms = { gte: params.bathrooms };
  if (params.amenities && params.amenities.length > 0) {
    where.amenities = { hasEvery: params.amenities };
  }
  if (params.search) {
    const term = params.search.trim();
    if (term) {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
        { district: { contains: term, mode: 'insensitive' } },
      ];
    }
  }

  return where;
};

const buildOrderBy = (
  sort: PropertySortKey | undefined,
  dir: 'asc' | 'desc' | undefined,
): Prisma.PropertyOrderByWithRelationInput[] => {
  const direction: Prisma.SortOrder = dir ?? 'desc';
  switch (sort) {
    case 'price':
      return [{ price: direction }, { createdAt: 'desc' }];
    case 'views':
      return [{ viewsCount: direction }, { createdAt: 'desc' }];
    default:
      return [{ createdAt: direction }];
  }
};

interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProperties(params: PropertyListParams = {}): Promise<PropertyListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 24));
  const skip = (page - 1) * pageSize;

  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort, params.sortDir);

  const [records, total] = await prisma.$transaction([
    prisma.property.findMany({ where, skip, take: pageSize, orderBy }),
    prisma.property.count({ where }),
  ]);

  return {
    items: records.map(mapProperty),
    total,
    page,
    pageSize,
  };
}

interface PropertyDetailResult {
  property: Property;
  agent: PublicAgent | null;
  analytics: PropertyAnalytics | null;
}

export async function getPropertyDetail(id: string): Promise<PropertyDetailResult | null> {
  const record = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      listings: { orderBy: { dateListed: 'desc' } },
      agent: true,
      analytics: { orderBy: { analyticsDate: 'desc' }, take: 1 },
    },
  });

  if (!record) return null;

  const property = mapProperty(record);
  const agent = record.agent ? mapPublicAgent(record.agent) : null;
  const analytics = record.analytics && record.analytics.length > 0 ? mapPropertyAnalytics(record.analytics[0]) : null;

  return { property, agent, analytics };
}

export const __test = {
  buildWhere,
  buildOrderBy,
};
