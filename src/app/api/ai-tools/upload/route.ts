import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';

fal.config({ credentials: process.env.FAL_AI_API_KEY });

/** Maximum file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: { message: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` } },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: 'File too large. Maximum size is 10 MB.' } },
        { status: 400 },
      );
    }

    // Upload file to fal.ai storage
    const url = await fal.storage.upload(file);

    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error) {
    console.error('[ai-tools/upload] Error:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to upload file' } },
      { status: 500 },
    );
  }
}
