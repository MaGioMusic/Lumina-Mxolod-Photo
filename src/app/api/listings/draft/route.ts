import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, jsonResponse, requireUser } from '../../utils';

const roomSchema = z.enum(['living-room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'other']);

const photoSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  room: roomSchema,
  enhanced: z.boolean(),
  selectedForListing: z.boolean(),
});

const createDraftSchema = z.object({
  photos: z.array(photoSchema).min(1).max(40),
});

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ['agent', 'admin']);

    const body = await request.json();
    const payload = createDraftSchema.parse(body);

    const selected = payload.photos.filter((photo) => photo.selectedForListing);
    if (selected.length === 0) {
      return jsonResponse(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'At least one selected-for-listing photo is required',
          },
        },
        { status: 400 },
      );
    }

    const roomBreakdown = roomSchema.options
      .map((room) => ({ room, count: selected.filter((photo) => photo.room === room).length }))
      .filter((item) => item.count > 0);

    const draft = {
      id: `draft_${Date.now()}_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      totalSelected: selected.length,
      totalEnhanced: selected.filter((photo) => photo.enhanced).length,
      coverImageUrl: selected[0].url,
      roomBreakdown,
      photos: selected.map((photo) => ({
        id: photo.id,
        url: photo.url,
        room: photo.room,
        enhanced: photo.enhanced,
      })),
    };

    return jsonResponse({ draft }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
