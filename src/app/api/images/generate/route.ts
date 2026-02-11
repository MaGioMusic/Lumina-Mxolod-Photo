import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { errorResponse, jsonResponse, requireUser } from '../../utils';
import { resolveActorContext } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

const generateBodySchema = z.object({
  propertyId: z.string().uuid(),
  prompt: z.string().min(10).max(1000),
  negativePrompt: z.string().max(500).optional(),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2', '9:16']).default('16:9'),
  imageSize: z.enum(['landscape_4_3', 'landscape_16_9', 'portrait_16_9', 'square_hd']).default('landscape_16_9'),
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
    const payload = generateBodySchema.parse(body);

    // Verify the property exists and user has access
    const property = await prisma.property.findUnique({
      where: { id: payload.propertyId },
      select: { id: true, agentId: true, title: true },
    });

    if (!property) {
      return errorResponse(new Error('Property not found'));
    }

    // Check permissions
    if (!actor.isAdmin) {
      const canManage = property.agentId && actor.agentId && property.agentId === actor.agentId;
      if (!canManage) {
        return errorResponse(new Error('You are not allowed to generate images for this property'));
      }
    }

    // Enhance prompt for real estate context
    const enhancedPrompt = `Professional real estate photography, ${payload.prompt}, high quality, architectural photography, bright natural lighting, interior design magazine style, 8k resolution, photorealistic`;
    
    const negativePrompt = payload.negativePrompt || 'blurry, low quality, distorted, people, cars, text, watermark, logo, dark, cluttered, messy';

    // Submit generation request to Fal.ai using flux model
    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        image_size: payload.imageSize,
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

    const imageUrl = result.data?.images?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Get the highest sort order for this property
    const lastImage = await prisma.image.findFirst({
      where: { propertyId: payload.propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const newSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Save the generated image to database
    const image = await prisma.image.create({
      data: {
        propertyId: payload.propertyId,
        url: imageUrl,
        alt: `AI generated image: ${payload.prompt.substring(0, 100)}`,
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
        url: imageUrl,
        prompt: payload.prompt,
        requestId: result.requestId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Fal.ai generation error:', error);
    return errorResponse(error);
  }
}
