import { ListingStatus, Prisma, type CurrencyType } from '@prisma/client';
import type { Listing } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError } from './errors';
import { mapListing } from './mappers';

export interface ListListingsParams {
  propertyId?: string;
  status?: ListingStatus;
  page?: number;
  pageSize?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListingListResult {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listListings(params: ListListingsParams = {}): Promise<ListingListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.ListingWhereInput = {};
  if (params.propertyId) where.propertyId = params.propertyId;
  if (params.status) where.status = params.status;
  if (params.dateFrom || params.dateTo) {
    where.dateListed = {};
    if (params.dateFrom) where.dateListed.gte = params.dateFrom;
    if (params.dateTo) where.dateListed.lte = params.dateTo;
  }

  const [records, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dateListed: 'desc' },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items: records.map(mapListing),
    total,
    page,
    pageSize,
  };
}

export interface CreateListingInput {
  propertyId: string;
  userId: string;
  agentId?: string | null;
  price: string;
  currency: CurrencyType;
  status?: ListingStatus;
  expiryDate?: Date | null;
  notes?: string | null;
}

export async function createListing(
  input: CreateListingInput,
  actor: { userId: string; agentId?: string | null; isAdmin?: boolean } = { userId: 'anonymous' },
): Promise<Listing> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  const isPrivileged = Boolean(actor.isAdmin);
  if (!isPrivileged) {
    const canManage = property.agentId && actor.agentId && property.agentId === actor.agentId;
    if (!canManage) {
      throw new ForbiddenError('You are not allowed to create listings for this property');
    }
  }

  const resolvedAgentId = isPrivileged ? input.agentId ?? property.agentId : property.agentId;

  const record = await prisma.listing.create({
    data: {
      propertyId: input.propertyId,
      agentId: resolvedAgentId ?? null,
      userId: input.userId,
      price: new Prisma.Decimal(input.price),
      currency: input.currency,
      status: input.status ?? ListingStatus.active,
      expiryDate: input.expiryDate ?? null,
      notes: input.notes ?? null,
    },
  });

  return mapListing(record);
}
