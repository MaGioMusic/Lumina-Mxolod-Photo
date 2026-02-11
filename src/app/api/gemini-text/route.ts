'use server';

import { GoogleAuth } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { HttpError } from '@/lib/repo/errors';
import { ensureRealtimeAccess } from '@/lib/auth/devGuard';
import { enforceRateLimit } from '@/lib/security/rateLimiter';

const bodySchema = z.object({
  text: z.string().min(1).max(4000),
});

type VertexGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function POST(req: NextRequest) {
  try {
    const access = await ensureRealtimeAccess(req);
    enforceRateLimit(access.rateLimitKey, {
      limit: 20,
      windowMs: 60_000,
      feature: 'gemini text request',
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    console.error('[gemini-text] guard failure', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to authorize gemini text access' } },
      { status: 500 },
    );
  }

  const projectId = process.env.GCP_PROJECT_ID;
  const region = process.env.GCP_REGION || 'us-central1';
  // IMPORTANT: "gemini-live-*" models are for the Live (realtime) API and are NOT supported
  // by the standard generateContent API used here.
  // Use a text-capable model via GEMINI_TEXT_MODEL (recommended).
  const model =
    process.env.GEMINI_TEXT_MODEL ||
    process.env.GEMINI_MODEL ||
    'gemini-2.0-flash';

  if (!projectId) {
    return NextResponse.json({ error: { code: 'CONFIG_MISSING', message: 'Missing GCP_PROJECT_ID' } }, { status: 500 });
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body' } }, { status: 400 });
  }

  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (!token?.token) {
      throw new Error('No access token issued');
    }

    const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:generateContent`;
    const vertexRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: payload.text }],
          },
        ],
        generationConfig: {
          candidateCount: 1,
          maxOutputTokens: 1024,
          temperature: 0.8,
        },
      }),
    });

    if (!vertexRes.ok) {
      const detail = await vertexRes.text().catch(() => '');
      return NextResponse.json(
        { error: { code: 'VERTEX_ERROR', message: `Vertex error: ${vertexRes.status}${detail ? ` - ${detail}` : ''}` } },
        { status: 502 },
      );
    }

    const data = (await vertexRes.json()) as VertexGenerateContentResponse;
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => (typeof p.text === 'string' ? p.text : ''))
        .join('')
        .trim() || '';

    if (!text) {
      return NextResponse.json({ error: { code: 'EMPTY_RESPONSE', message: 'Model returned no text' } }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('[gemini-text] request failed', error);
    return NextResponse.json(
      { error: { code: 'GEMINI_TEXT_FAILED', message: 'Gemini text request failed' } },
      { status: 500 },
    );
  }
}
