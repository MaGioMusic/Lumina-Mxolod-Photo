import { Prisma, type AppointmentType } from '@prisma/client';
import type { Appointment } from '@/types/models';
import { prisma } from '@/lib/prisma';
import { ConflictError, NotFoundError } from './errors';
import { mapAppointment } from './mappers';

interface CreateAppointmentInput {
  userId: string;
  propertyId: string;
  scheduledDate: Date;
  type: AppointmentType;
  notes?: string | null;
  meetingLocation?: string | null;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { agentId: true },
  });
  if (!property) throw new NotFoundError('Property not found');

  try {
    const record = await prisma.appointment.create({
      data: {
        clientId: input.userId,
        agentId: property.agentId,
        propertyId: input.propertyId,
        scheduledDate: input.scheduledDate,
        type: input.type,
        notes: input.notes ?? null,
        meetingLocation: input.meetingLocation ?? null,
      },
    });
    return mapAppointment(record);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictError('Appointment slot already taken');
    }
    throw error;
  }
}
