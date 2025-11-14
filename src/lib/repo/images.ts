import type { Image } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError } from './errors';
import { mapImage } from './mappers';

export async function listImages(propertyId: string): Promise<Image[]> {
  const records = await prisma.image.findMany({
    where: { propertyId },
    orderBy: { sortOrder: 'asc' },
  });
  return records.map(mapImage);
}

export interface CreateImageInput {
  propertyId: string;
  url: string;
  alt?: string | null;
  sortOrder?: number;
}

export async function createImage(
  input: CreateImageInput,
  actor: { userId: string; agentId?: string | null; isAdmin?: boolean } = { userId: 'anonymous' },
): Promise<Image> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { id: true, agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  if (!actor.isAdmin) {
    const canManage = property.agentId && actor.agentId && property.agentId === actor.agentId;
    if (!canManage) {
      throw new ForbiddenError('You are not allowed to modify images for this property');
    }
  }

  const record = await prisma.image.create({
    data: {
      propertyId: input.propertyId,
      url: input.url,
      alt: input.alt ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return mapImage(record);
}

export interface UpdateImageInput {
  alt?: string | null;
  sortOrder?: number;
}

export async function updateImage(
  id: string,
  updates: UpdateImageInput,
  actor: { userId: string; agentId?: string | null; isAdmin?: boolean } = { userId: 'anonymous' },
): Promise<Image> {
  const record = await prisma.image.findUnique({ where: { id } });
  if (!record) throw new NotFoundError('Image not found');

  const property = await prisma.property.findUnique({
    where: { id: record.propertyId },
    select: { agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  if (!actor.isAdmin) {
    const canManage = property.agentId && actor.agentId && property.agentId === actor.agentId;
    if (!canManage) {
      throw new ForbiddenError('You are not allowed to modify images for this property');
    }
  }

  const updated = await prisma.image.update({
    where: { id },
    data: {
      alt: updates.alt ?? null,
      sortOrder: updates.sortOrder ?? undefined,
    },
  });
  return mapImage(updated);
}

export async function deleteImage(
  id: string,
  actor: { userId: string; agentId?: string | null; isAdmin?: boolean } = { userId: 'anonymous' },
): Promise<void> {
  const existing = await prisma.image.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Image not found');

  const property = await prisma.property.findUnique({
    where: { id: existing.propertyId },
    select: { agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  if (!actor.isAdmin) {
    const canManage = property.agentId && actor.agentId && property.agentId === actor.agentId;
    if (!canManage) {
      throw new ForbiddenError('You are not allowed to delete images for this property');
    }
  }

  await prisma.image.delete({ where: { id: existing.id } });
}
