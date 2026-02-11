import { Prisma } from '@prisma/client';
import type { Favorite } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from './errors';
import { mapFavorite } from './mappers';

export async function addFavorite(userId: string, propertyId: string): Promise<Favorite> {
  try {
    const record = await prisma.favorite.create({
      data: { userId, propertyId },
    });
    return mapFavorite(record);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictError('Property already favorited');
    }
    throw error;
  }
}

export async function removeFavoriteById(id: string, userId: string): Promise<void> {
  const favorite = await prisma.favorite.findUnique({ where: { id } });
  if (!favorite) throw new NotFoundError('Favorite not found');
  if (favorite.userId !== userId) throw new ForbiddenError();
  await prisma.favorite.delete({ where: { id } });
}

async function removeFavoriteByProperty(propertyId: string, userId: string): Promise<void> {
  const favorite = await prisma.favorite.findFirst({ where: { propertyId, userId } });
  if (!favorite) throw new NotFoundError('Favorite not found');
  await prisma.favorite.delete({ where: { id: favorite.id } });
}
