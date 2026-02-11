import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { errorResponse, jsonResponse, requireUser } from '../../utils';
import { resolveActorContext } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

const stagingBodySchema = z.object({
  imageId: z.string().uuid(),
  roomType: z.enum(['living_room', 'bedroom', 'dining_room', 'office', 'kitchen', 'bathroom']).default('living_room'),
  style: z.enum(['modern', 'minimalist', 'scandinavian', 'luxury', 'cozy', 'industrial', 'bohemian']).default('modern'),
  furnishEmpty: z.boolean().default(true),
  preserveStructure: z.boolean().default(true),
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
    const payload = stagingBodySchema.parse(body);

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
        return errorResponse(new Error('You are not allowed to stage images for this property'));
      }
    }

    // Build staging prompt based on room type and style
    const styleDescriptions: Record<string, string> = {
      modern: 'sleek modern furniture, clean lines, neutral colors with accent pieces',
      minimalist: 'minimalist furniture, uncluttered space, essential items only',
      scandinavian: 'scandinavian furniture, light wood, white walls, cozy textiles',
      luxury: 'luxury furniture, high-end materials, elegant decor, premium finishes',
      cozy: 'cozy warm furniture, comfortable seating, soft lighting, homey atmosphere',
      industrial: 'industrial style, exposed brick, metal accents, raw materials',
      bohemian: 'bohemian decor, eclectic furniture, plants, colorful textiles, artistic',
    };

    const roomDescriptions: Record<string, string> = {
      living_room: 'spacious living room',
      bedroom: 'master bedroom',
      dining_room: 'elegant dining room',
      office: 'home office workspace',
      kitchen: 'modern kitchen',
      bathroom: 'luxury bathroom',
    };

    const stagingPrompt = payload.furnishEmpty
      ? `Professional virtual staging, furnish this empty ${roomDescriptions[payload.roomType]} with ${styleDescriptions[payload.style]}, photorealistic furniture placement, perfect lighting, interior design magazine quality`
      : `Professional virtual restaging, redecorate this ${roomDescriptions[payload.roomType]} in ${styleDescriptions[payload.style]} style, furniture rearrangement, improved decor, interior design magazine quality`;

    // Submit virtual staging request to Fal.ai using image-to-image
    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: originalImage.url,
        prompt: stagingPrompt,
        negative_prompt: 'distorted furniture, unrealistic proportions, low quality, blurry, watermark',
        strength: payload.preserveStructure ? 0.65 : 0.8,
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

    const stagedImageUrl = result.data?.images?.[0]?.url;
    
    if (!stagedImageUrl) {
      throw new Error('No image generated');
    }

    // Get the highest sort order for this property
    const lastImage = await prisma.image.findFirst({
      where: { propertyId: originalImage.propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const newSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Save the staged image to database
    const image = await prisma.image.create({
      data: {
        propertyId: originalImage.propertyId,
        url: stagedImageUrl,
        alt: `AI virtual staged ${payload.roomType} in ${payload.style} style`,
        sortOrder: newSortOrder,
        isAiGenerated: true,
        prompt: stagingPrompt,
        falJobId: result.requestId,
      },
    });

    return jsonResponse({
      success: true,
      image: {
        id: image.id,
        url: stagedImageUrl,
        roomType: payload.roomType,
        style: payload.style,
        requestId: result.requestId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Fal.ai virtual staging error:', error);
    return errorResponse(error);
  }
}
