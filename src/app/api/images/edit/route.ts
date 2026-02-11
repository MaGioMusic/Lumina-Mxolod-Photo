import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { errorResponse, jsonResponse, requireUser } from '../../utils';
import { resolveActorContext } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

const editBodySchema = z.object({
  imageId: z.string().uuid(),
  prompt: z.string().min(10).max(1000),
  negativePrompt: z.string().max(500).optional(),
  strength: z.number().min(0.1).max(1.0).default(0.7),
});

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ['agent', 'admin']);
    const actor = await resolveActorContext(user);
    
    const body = await request.json();
    const payload = editBodySchema.parse(body);

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
        return errorResponse(new Error('You are not allowed to edit images for this property'));
      }
    }

    // Enhance prompt for real estate context
    const enhancedPrompt = `Professional real estate photography, ${payload.prompt}, high quality, architectural photography, bright natural lighting, interior design magazine style, 8k resolution, photorealistic`;
    
    const negativePrompt = payload.negativePrompt || 'blurry, low quality, distorted, people, cars, text, watermark, logo, dark, cluttered, messy';

    // Submit image editing request to Fal.ai using image-to-image model
    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: originalImage.url,
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        strength: payload.strength,
        num_images: 1,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    const editedImageUrl = result.data?.images?.[0]?.url;
    
    if (!editedImageUrl) {
      throw new Error('No image generated');
    }

    // Get the highest sort order for this property
    const lastImage = await prisma.image.findFirst({
      where: { propertyId: originalImage.propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const newSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Save the edited image to database
    const image = await prisma.image.create({
      data: {
        propertyId: originalImage.propertyId,
        url: editedImageUrl,
        alt: `AI edited image: ${payload.prompt.substring(0, 100)}`,
        sortOrder: newSortOrder,
        isAiGenerated: true,
        prompt: payload.prompt,
        falJobId: result.requestId,
      },
    });

    return jsonResponse({
      success: true,
      image: {
        id: image.id,
        url: editedImageUrl,
        prompt: payload.prompt,
        requestId: result.requestId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Fal.ai image editing error:', error);
    return errorResponse(error);
  }
}
