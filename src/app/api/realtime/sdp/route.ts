import { NextRequest } from 'next/server';
import { ensureRealtimeAccess } from '@/lib/auth/devGuard';
import { enforceRateLimit } from '@/lib/security/rateLimiter';
import { HttpError } from '@/lib/repo/errors';

// Server-side proxy for SDP exchange to avoid browser CORS/network blocks
export async function POST(req: NextRequest) {
  try {
    const access = ensureRealtimeAccess(req);
    enforceRateLimit(`${access.rateLimitKey}:sdp`, {
      limit: 15,
      windowMs: 60_000,
      feature: 'realtime SDP exchange',
    });

    const model = req.headers.get('x-model') || 'gpt-realtime';
    const ephemeral = req.headers.get('x-ephemeral-token');
    if (!ephemeral) {
      return new Response(JSON.stringify({ error: 'Missing x-ephemeral-token header' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const sdp = await req.text();
    if (!sdp || sdp.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Missing or invalid SDP' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Retry with small exponential backoff on transient errors (timeouts/gateway)
    const attempt = async (_n: number): Promise<Response | null> => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ephemeral}`,
            'Content-Type': 'application/sdp',
            'OpenAI-Beta': 'realtime=v1',
          },
          body: sdp,
          signal: ctrl.signal,
        });
        if (res.ok) return res;
        if ([408, 429, 500, 502, 503, 504].includes(res.status)) return null;
        // Non-retryable
        return res;
      } finally {
        clearTimeout(timer);
      }
    };

    let res: Response | null = null;
    for (let i = 1; i <= 3; i++) {
      res = await attempt(i);
      if (res && res.ok) break;
      if (i < 3) await new Promise(r => setTimeout(r, 500 * Math.pow(2, i - 1)));
    }
    if (!res) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'SDP_UPSTREAM_FAILURE',
            message: 'SDP exchange failed',
            ...(process.env.NODE_ENV !== 'production'
              ? { detail: 'Upstream timeout or gateway error' }
              : {}),
          },
        }),
        { status: 504, headers: { 'content-type': 'application/json' } }
      );
    }

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({
          error: {
            code: 'SDP_UPSTREAM_FAILURE',
            message: 'SDP exchange failed',
            ...(process.env.NODE_ENV !== 'production' ? { detail: text } : {}),
          },
        }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      );
    }

    const answer = await res.text();
    return new Response(answer, {
      status: 200,
      headers: { 'content-type': 'application/sdp' },
    });
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return new Response(
        JSON.stringify({
          error: {
            code: err.code,
            message: err.message,
          },
        }),
        { status: err.status, headers: { 'content-type': 'application/json' } },
      );
    }

    console.error('Unexpected SDP proxy error', err);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unexpected error during SDP proxy',
          ...(process.env.NODE_ENV !== 'production' ? { detail: String(err) } : {}),
        },
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

