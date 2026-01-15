import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

let cached:
  | ReturnType<typeof createClient>
  | null = null;

function extractHostFromEnvLine(value: string): string | null {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function debugEnvSupabaseUrlSource() {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const cwd = process.cwd();
    const candidates = ['.env.local', '.env'];
    for (const filename of candidates) {
      const p = path.join(cwd, filename);
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, 'utf8');
      const match = content.match(/^SUPABASE_URL\s*=\s*(.+)\s*$/m);
      if (!match) continue;
      const raw = match[1]!.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      const host = extractHostFromEnvLine(raw);
      console.log(`[supabase/admin] SUPABASE_URL found in ${filename}:`, host ?? '(invalid url)');
      return;
    }
    console.log('[supabase/admin] SUPABASE_URL not found in .env.local or .env (using process.env)');
  } catch {
    // ignore
  }
}

function base64UrlDecode(input: string): string {
  // base64url -> base64
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function deriveSupabaseUrlFromJwtIssuer(serviceRoleKey: string): string | null {
  // Supabase keys are JWTs; payload.iss typically looks like:
  // "https://<project-ref>.supabase.co/auth/v1"
  const parts = serviceRoleKey.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadJson = base64UrlDecode(parts[1]!);
    const payload = JSON.parse(payloadJson) as { iss?: string; ref?: string };

    // Preferred: issuer is a full URL
    const iss = payload.iss;
    if (iss) {
      try {
        const issUrl = new URL(iss);
        if (issUrl.hostname.endsWith('supabase.co')) return issUrl.origin;
      } catch {
        // ignore
      }
    }

    // Fallback: some Supabase JWTs include "ref" (project ref)
    if (payload.ref && /^[a-z0-9]{12,}$/.test(payload.ref)) {
      return `https://${payload.ref}.supabase.co`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Supabase admin client (service role) for server-side only usage.
 *
 * IMPORTANT:
 * - Never import this from client components.
 * - Requires env vars:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseAdmin() {
  if (cached) return cached;

  const rawUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Supabase admin env missing: SUPABASE_SERVICE_ROLE_KEY');
  }
  // Quick sanity check: Supabase keys are JWTs (3 dot-separated parts)
  if (serviceRoleKey.split('.').length < 3) {
    throw new Error(
      'Supabase admin env invalid: SUPABASE_SERVICE_ROLE_KEY must be the full "service_role" JWT (do not truncate with "...")',
    );
  }

  // If URL is missing or looks like a placeholder, try derive from JWT issuer.
  const derivedUrl = deriveSupabaseUrlFromJwtIssuer(serviceRoleKey);
  const isPlaceholderUrl = !!rawUrl && rawUrl.toLowerCase().includes('your_project_ref');

  // Dev-only safety net: if env still has placeholder, use the project's known URL
  // so the app works for local demo even when .env.local wasn't updated correctly.
  const DEV_FALLBACK_URL = 'https://uvhfznpsixghjxjxoztr.supabase.co';

  const url =
    !rawUrl || isPlaceholderUrl
      ? derivedUrl || (process.env.NODE_ENV !== 'production' ? DEV_FALLBACK_URL : rawUrl)
      : rawUrl;

  if (process.env.NODE_ENV !== 'production' && isPlaceholderUrl && url) {
    console.warn(
      '[supabase/admin] SUPABASE_URL is placeholder; using fallback host:',
      new URL(url).hostname,
    );
  }

  if (!url) {
    throw new Error('Supabase admin env missing: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  debugEnvSupabaseUrlSource();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('Supabase admin env invalid: SUPABASE_URL is not a valid URL');
  }

  // Common misconfig: using .supabase.com instead of .supabase.co
  if (!parsedUrl.hostname.endsWith('supabase.co')) {
    throw new Error(
      `Supabase admin env invalid: SUPABASE_URL host must end with "supabase.co" (got "${parsedUrl.hostname}")`,
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    // Safe to log hostname; never log service role key.
    console.log('[supabase/admin] Using SUPABASE_URL host:', parsedUrl.hostname);
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}

