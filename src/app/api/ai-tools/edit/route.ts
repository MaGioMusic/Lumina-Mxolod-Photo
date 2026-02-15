import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fal } from '@fal-ai/client';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';

/**
 * Nano Banana Pro (Google Gemini-based) image editing endpoint.
 * Model: fal-ai/nano-banana-pro/edit
 * Docs: https://fal.ai/models/fal-ai/nano-banana-pro/edit/api
 *
 * Architecture preservation suffix is appended to every prompt
 * to prevent the AI from modifying structural elements.
 */

const ARCHITECTURE_PRESERVATION_SUFFIX =
  'Do not move, remove, or modify windows, walls, doors, or any architectural elements. Keep the room layout exactly as shown.';

const editSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(5),
  prompt: z.string().min(3).max(2000),
  aspectRatio: z
    .enum(['auto', '21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16'])
    .default('auto'),
  resolution: z.enum(['1K', '2K']).default('2K'),
  outputFormat: z.enum(['jpeg', 'png', 'webp']).default('jpeg'),
  numImages: z.number().int().min(1).max(4).default(1),
});

fal.config({ credentials: process.env.FAL_AI_API_KEY });

/**
 * Ensure image URLs uploaded via our upload endpoint (fal.ai storage)
 * are used directly. For external URLs, re-upload to fal.ai storage
 * to guarantee accessibility.
 */
async function ensureFalStorageUrls(urls: string[]): Promise<string[]> {
  const results: string[] = [];

  for (const url of urls) {
    // fal.ai storage URLs and data URIs can be used directly
    if (url.includes('fal.ai') || url.includes('fal-cdn') || url.startsWith('data:')) {
      results.push(url);
      continue;
    }

    // External URL — fetch and re-upload to fal.ai storage for reliability
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const blob = await response.blob();
      const falUrl = await fal.storage.upload(
        new File([blob], 'input.jpg', { type: blob.type || 'image/jpeg' }),
      );
      results.push(falUrl);
    } catch (error) {
      console.warn(`[ai-tools/edit] Failed to re-upload external URL, using original: ${url}`, error);
      results.push(url); // fallback to original
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const payload = editSchema.parse(body);

    // Ensure all image URLs are accessible by fal.ai
    const safeImageUrls = await ensureFalStorageUrls(payload.imageUrls);

    // Append architecture preservation instruction to prompt
    const enhancedPrompt = `${payload.prompt.trim()} ${ARCHITECTURE_PRESERVATION_SUFFIX}`;

    console.log('[ai-tools/edit] Calling Nano Banana Pro:', {
      imageCount: safeImageUrls.length,
      promptLength: enhancedPrompt.length,
      resolution: payload.resolution,
    });

    const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
      input: {
        prompt: enhancedPrompt,
        image_urls: safeImageUrls,
        aspect_ratio: payload.aspectRatio,
        resolution: payload.resolution,
        output_format: payload.outputFormat,
        num_images: payload.numImages,
        safety_tolerance: '4',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Handle both direct and wrapped response
    const data = result.data;
    const images = data?.images;

    if (!images || images.length === 0) {
      throw new Error('No images generated — the model returned an empty result');
    }

    return NextResponse.json(
      {
        success: true,
        images: images.map((img: { url: string; width?: number; height?: number }, i: number) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          index: i,
        })),
        description: data?.description || '',
        prompt: payload.prompt,
        requestId: result.requestId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[ai-tools/edit] Nano Banana Pro error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid input', details: error.errors } },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to edit image';

    // Provide user-friendly error messages for common issues
    let userMessage = message;
    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      userMessage = 'Image processing timed out. Please try again with a simpler prompt or lower resolution.';
    } else if (message.includes('rate limit') || message.includes('429')) {
      userMessage = 'Too many requests. Please wait a moment and try again.';
    }

    return NextResponse.json(
      { error: { message: userMessage } },
      { status: 500 },
    );
  }
}
