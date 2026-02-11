import { NextRequest } from 'next/server';
import { z } from 'zod';
import { deleteImage, updateImage } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser } from '../../utils';
import { resolveActorContext } from '@/lib/auth/server';

const updateBodySchema = z.object({
  alt: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser(request, ['agent', 'admin']);
    const actor = await resolveActorContext(user);
    const body = await request.json();
    const payload = updateBodySchema.parse(body);
    const image = await updateImage(params.id, payload, actor);
    return jsonResponse(image);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser(request, ['agent', 'admin']);
    const actor = await resolveActorContext(user);
    await deleteImage(params.id, actor);
    return jsonResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
