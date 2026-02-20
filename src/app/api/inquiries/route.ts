import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createInquiry } from '@/lib/repo';
import { errorResponse, jsonResponse, getOptionalUser } from '../utils';

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

// GET /api/inquiries — List inquiries (placeholder)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add auth check and getInquiries repo function
    return jsonResponse({ message: 'GET endpoint placeholder — implement auth and repo function' }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
