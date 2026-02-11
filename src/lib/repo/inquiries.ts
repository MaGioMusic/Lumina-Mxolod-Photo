import type { Inquiry } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from './errors';
import { mapInquiry } from './mappers';

interface CreateInquiryInput {
  userId: string | null;
  propertyId: string;
  message: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  const record = await prisma.inquiry.create({
    data: {
      userId: input.userId,
      propertyId: input.propertyId,
      agentId: property.agentId,
      message: input.message,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
    },
  });

  return mapInquiry(record);
}
