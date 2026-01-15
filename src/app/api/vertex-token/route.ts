'use server';

import { GoogleAuth } from 'google-auth-library';
import { NextRequest } from 'next/server';
import { HttpError } from '@/lib/repo/errors';
import { enforceRateLimit } from '@/lib/security/rateLimiter';
import { ensureRealtimeAccess } from '@/lib/auth/devGuard';

type VertexTokenResponse = {
  accessToken: string;
  expiresAt: number;
  projectId: string;
  region: string;
  model: string;
};

let cachedToken: VertexTokenResponse | null = null;
let mintInFlight: Promise<VertexTokenResponse> | null = null;

const SAFETY_WINDOW_MS = 60_000; // refresh 60s before expiry

// Token endpoint for Gemini Live API (WebSocket) access.
// Returns a short-lived access token plus region/model metadata.
export async function GET(req: NextRequest) {
  let access: ReturnType<typeof ensureRealtimeAccess> | null = null;
  try {
    access = ensureRealtimeAccess(req);
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    console.error('[vertex-token] guard failure', error);
    return json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to authorize vertex live access' } },
      { status: 500 },
    );
  }

  const projectId = process.env.GCP_PROJECT_ID;
  const region = process.env.GCP_REGION || 'us-central1';
  const model = process.env.GEMINI_LIVE_MODEL || 'gemini-live-2.5-flash-native-audio';

  if (!projectId) {
    return json({ error: { code: 'CONFIG_MISSING', message: 'Missing GCP_PROJECT_ID' } }, { status: 500 });
  }

  try {
    if (cachedToken && cachedToken.expiresAt - Date.now() > SAFETY_WINDOW_MS) {
      return json(cachedToken);
    }

    // Only rate-limit when we actually need to mint.
    enforceRateLimit(access!.rateLimitKey, {
      limit: 10,
      windowMs: 60_000,
      feature: 'vertex live token request',
    });

    if (!mintInFlight) {
      mintInFlight = (async (): Promise<VertexTokenResponse> => {
        // Obtain an access token with Cloud Platform scope
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();

        if (!token || !token.token) {
          throw new Error('No access token issued');
        }

        // Compute expiry (best effort): expires_in is not always present, so fall back to 55m
        const expiresInMs =
          typeof token.res?.data?.expires_in === 'number' ? token.res.data.expires_in * 1000 : 55 * 60 * 1000;
        const expiresAt = Date.now() + expiresInMs;

        return {
          accessToken: token.token,
          expiresAt,
          projectId,
          region,
          model,
        };
      })().finally(() => {
        mintInFlight = null;
      });
    }

    cachedToken = await mintInFlight;
    return json(cachedToken);
  } catch (error) {
    console.error('[vertex-token] failed to mint access token', error);
    return json(
      { error: { code: 'TOKEN_ISSUE_FAILED', message: 'Unable to issue Vertex access token' } },
      { status: 500 },
    );
  }
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}
