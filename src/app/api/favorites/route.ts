import { NextRequest } from 'next/server';
import { z } from 'zod';
import { addFavorite } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser } from '../utils';

const bodySchema = z.object({
  propertyId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ['client', 'agent', 'investor', 'admin']);
    const body = await request.json();
    const payload = bodySchema.parse(body);

    const favorite = await addFavorite(user.id, payload.propertyId);
    return jsonResponse(favorite, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
