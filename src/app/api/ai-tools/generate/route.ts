import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';

const generateSchema = z.object({
  prompt: z.string().min(3).max(1000),
  negativePrompt: z.string().max(500).optional(),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2', '9:16']).default('16:9'),
  imageSize: z
    .enum(['landscape_4_3', 'landscape_16_9', 'portrait_16_9', 'square_hd'])
    .default('landscape_16_9'),
});

fal.config({ credentials: process.env.FAL_AI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user (any role)
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const payload = generateSchema.parse(body);

    // Enhance prompt for real estate context
    const enhancedPrompt = `Professional real estate photography, ${payload.prompt}, high quality, architectural photography, bright natural lighting, interior design magazine style, 8k resolution, photorealistic`;
    const negativePrompt =
      payload.negativePrompt ||
      'blurry, low quality, distorted, people, cars, text, watermark, logo, dark, cluttered, messy';

    // Call fal.ai Flux model
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

    return NextResponse.json(
      {
        success: true,
        image: {
          url: imageUrl,
          prompt: payload.prompt,
          requestId: result.requestId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[ai-tools/generate] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid input', details: error.errors } },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to generate image' } },
      { status: 500 },
    );
  }
}
