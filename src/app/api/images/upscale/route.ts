import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { errorResponse, jsonResponse, requireUser } from '../../utils';
import { resolveActorContext } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

const upscaleBodySchema = z.object({
  imageId: z.string().uuid(),
  scale: z.enum(['2x', '4x']).default('2x'),
});

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const user = requireUser(request, ['agent', 'admin']);
    const actor = await resolveActorContext(user);
    
    const body = await request.json();
    const payload = upscaleBodySchema.parse(body);

    // Get the original image
    const originalImage = await prisma.image.findUnique({
      where: { id: payload.imageId },
      include: { property: { select: { id: true, agentId: true } } },
    });

    if (!originalImage) {
      return errorResponse(new Error('Image not found'));
    }

    // Check permissions
    if (!actor.isAdmin) {
      const canManage = originalImage.property.agentId && actor.agentId && 
        originalImage.property.agentId === actor.agentId;
      if (!canManage) {
        return errorResponse(new Error('You are not allowed to upscale images for this property'));
      }
    }

    // Submit upscaling request to Fal.ai using esrgan model
    const result = await fal.subscribe('fal-ai/esrgan', {
      input: {
        image_url: originalImage.url,
        scale: payload.scale === '4x' ? 4 : 2,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    const upscaledImageUrl = result.data?.image?.url;
    
    if (!upscaledImageUrl) {
      throw new Error('No image generated');
    }

    // Get the highest sort order for this property
    const lastImage = await prisma.image.findFirst({
      where: { propertyId: originalImage.propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const newSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Save the upscaled image to database
    const image = await prisma.image.create({
      data: {
        propertyId: originalImage.propertyId,
        url: upscaledImageUrl,
        alt: `AI upscaled ${payload.scale} version of: ${originalImage.alt || 'property image'}`,
        sortOrder: newSortOrder,
        isAiGenerated: true,
        prompt: `Upscaled ${payload.scale} using ESRGAN`,
        falJobId: result.requestId,
      },
    });

    return jsonResponse({
      success: true,
      image: {
        id: image.id,
        url: upscaledImageUrl,
        scale: payload.scale,
        requestId: result.requestId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Fal.ai upscaling error:', error);
    return errorResponse(error);
  }
}
