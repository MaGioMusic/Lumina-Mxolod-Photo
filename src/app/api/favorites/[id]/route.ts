import { NextRequest } from 'next/server';
import { removeFavoriteById } from '@/lib/repo';
import { errorResponse, jsonResponse, requireUser } from '../../utils';

interface Params {
  params: { id: string };
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = requireUser(request, ['client', 'agent', 'investor', 'admin']);
    await removeFavoriteById(params.id, user.id);
    return jsonResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
