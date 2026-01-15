export interface VertexToken {
  accessToken: string;
  expiresAt: number;
  projectId: string;
  region: string;
  model: string;
}

let cachedToken: VertexToken | null = null;
let inFlight: Promise<VertexToken> | null = null;

const DEFAULT_SAFETY_WINDOW_MS = 60_000; // refresh 60s before expiry

function isValidToken(token: unknown): token is VertexToken {
  const t = token as VertexToken;
  return Boolean(
    t &&
      typeof t === 'object' &&
      typeof t.accessToken === 'string' &&
      typeof t.projectId === 'string' &&
      typeof t.region === 'string' &&
      typeof t.model === 'string' &&
      typeof t.expiresAt === 'number' &&
      t.accessToken &&
      t.projectId &&
      t.region &&
      t.model &&
      Number.isFinite(t.expiresAt),
  );
}

export async function getVertexToken(options?: {
  forceRefresh?: boolean;
  safetyWindowMs?: number;
}): Promise<VertexToken> {
  const safetyWindowMs = options?.safetyWindowMs ?? DEFAULT_SAFETY_WINDOW_MS;

  if (!options?.forceRefresh && cachedToken) {
    const remaining = cachedToken.expiresAt - Date.now();
    if (remaining > safetyWindowMs) return cachedToken;
  }

  if (!options?.forceRefresh && inFlight) return inFlight;

  inFlight = (async () => {
    const res = await fetch('/api/vertex-token', { method: 'GET' });
    if (!res.ok) {
      let detail = '';
      try {
        detail = await res.text();
      } catch {}
      throw new Error(`vertex-token failed: ${res.status}${detail ? ` - ${detail}` : ''}`);
    }
    const json = (await res.json()) as unknown;
    if (!isValidToken(json)) {
      throw new Error('vertex-token failed: invalid payload');
    }
    cachedToken = json;
    return json;
  })()
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

