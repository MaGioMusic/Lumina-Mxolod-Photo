import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';

const stagingSchema = z.object({
  imageUrl: z.string().url(),
  roomType: z
    .enum(['living_room', 'bedroom', 'dining_room', 'office', 'kitchen', 'bathroom'])
    .default('living_room'),
  style: z
    .enum(['modern', 'minimalist', 'scandinavian', 'luxury', 'cozy', 'industrial', 'bohemian'])
    .default('modern'),
  furnishEmpty: z.boolean().default(true),
  preserveStructure: z.boolean().default(true),
});

fal.config({ credentials: process.env.FAL_AI_API_KEY });

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const payload = stagingSchema.parse(body);

    const stagingPrompt = payload.furnishEmpty
      ? `Professional virtual staging, furnish this empty ${roomDescriptions[payload.roomType]} with ${styleDescriptions[payload.style]}, photorealistic furniture placement, perfect lighting, interior design magazine quality`
      : `Professional virtual restaging, redecorate this ${roomDescriptions[payload.roomType]} in ${styleDescriptions[payload.style]} style, furniture rearrangement, improved decor, interior design magazine quality`;

    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: payload.imageUrl,
        prompt: stagingPrompt,
        negative_prompt:
          'distorted furniture, unrealistic proportions, low quality, blurry, watermark',
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

    return NextResponse.json(
      {
        success: true,
        image: {
          url: stagedImageUrl,
          roomType: payload.roomType,
          style: payload.style,
          requestId: result.requestId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[ai-tools/virtual-staging] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid input', details: error.errors } },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to stage image' } },
      { status: 500 },
    );
  }
}
