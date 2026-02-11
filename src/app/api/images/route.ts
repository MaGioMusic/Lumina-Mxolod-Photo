import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createImage, listImages } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser } from '../utils';
import { resolveActorContext } from '@/lib/auth/server';

const listQuerySchema = z.object({
  propertyId: z.string().uuid(),
});

const createBodySchema = z.object({
  propertyId: z.string().uuid(),
  url: z.string().url(),
  alt: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const parsed = listQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return jsonResponse(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'propertyId is required',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const images = await listImages(parsed.data.propertyId);
    return jsonResponse(images);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ['agent', 'admin']);
    const actor = await resolveActorContext(user);
    const body = await request.json();
    const payload = createBodySchema.parse(body);
    const image = await createImage(payload, actor);
    return jsonResponse(image, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
