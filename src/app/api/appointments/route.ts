import { NextRequest } from 'next/server';
import { z } from 'zod';
import { appointmentTypeSchema } from '@/types/models';
import { createAppointment } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser } from '../utils';

const bodySchema = z.object({
  propertyId: z.string().uuid(),
  scheduledDate: z.string().datetime({ offset: true }),
  type: appointmentTypeSchema.default('viewing'),
  notes: z.string().nullable().optional(),
  meetingLocation: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireUser(request, ['client', 'agent', 'investor', 'admin']);
    const body = await request.json();
    const payload = bodySchema.parse(body);

    const appointment = await createAppointment({
      userId: user.id,
      propertyId: payload.propertyId,
      scheduledDate: new Date(payload.scheduledDate),
      type: payload.type,
      notes: payload.notes ?? null,
      meetingLocation: payload.meetingLocation ?? null,
    });

    return jsonResponse(appointment, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
