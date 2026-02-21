import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createInquiry, getInquiries } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser, getOptionalUser } from '../utils';

const bodySchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().min(1),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().min(5).max(20).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getOptionalUser(request);

    const body = await request.json();
    const payload = bodySchema.parse(body);

    const inquiry = await createInquiry({
      userId: user?.id ?? null,
      propertyId: payload.propertyId,
      message: payload.message,
      contactEmail: payload.contactEmail ?? null,
      contactPhone: payload.contactPhone ?? null,
    });

    return jsonResponse(inquiry, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

// GET /api/inquiries — List inquiries (agent/admin only)
export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ['agent', 'admin']);
    const inquiries = await getInquiries();
    return jsonResponse(inquiries);
  } catch (error) {
    return errorResponse(error);
  }
}
