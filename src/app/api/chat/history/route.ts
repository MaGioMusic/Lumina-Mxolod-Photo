import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getChatRetentionMaxAgeSeconds, isoNowPlusChatRetentionDays } from '@/lib/chatRetention';

const COOKIE_VISITOR = 'lumina_ai_visitor_id';
const COOKIE_CONVERSATION = 'lumina_ai_conversation_id';
const MESSAGE_LIMIT = 60;

const querySchema = z.object({
  // optional override for debugging
  conversationId: z.string().uuid().optional(),
});

function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeSupabaseTimestamp(input: unknown): string {
  // Supabase may return timestamps like: 2026-01-14T13:50:01.169252+00:00
  // JS Date parsing is not consistent with 6-digit fractional seconds, so normalize to millis.
  const now = new Date().toISOString();
  if (typeof input !== 'string') return now;

  const trimmed = input.trim();
  if (!trimmed) return now;

  // If we have fractional seconds with more than 3 digits, truncate to 3.
  // Keep timezone suffix (Z or ±HH:MM).
  const m = trimmed.match(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.(\d+))?(Z|[+-]\d{2}:\d{2})$/,
  );
  const normalized = m
    ? `${m[1]}${m[3] ? `.${m[3].slice(0, 3).padEnd(3, '0')}` : ''}${m[4]}`
    : trimmed;

  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return now;
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    // Graceful fallback: do not break UI when chat backend env is missing in local/dev.
    const visitorId = req.cookies.get(COOKIE_VISITOR)?.value || createId();
    const conversationId = req.cookies.get(COOKIE_CONVERSATION)?.value || createId();

    const res = NextResponse.json(
      {
        visitorId,
        conversationId,
        summary: '',
        messages: [],
        degraded: true,
        error: {
          code: 'SUPABASE_NOT_CONFIGURED',
          message:
            e instanceof Error
              ? e.message
              : 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
        },
      },
      { status: 200 },
    );

    res.cookies.set(COOKIE_VISITOR, visitorId, {
      path: '/',
      maxAge: getChatRetentionMaxAgeSeconds(),
      sameSite: 'lax',
    });
    res.cookies.set(COOKIE_CONVERSATION, conversationId, {
      path: '/',
      maxAge: getChatRetentionMaxAgeSeconds(),
      sameSite: 'lax',
    });

    return res;
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    conversationId: url.searchParams.get('conversationId') || undefined,
  });

  const existingVisitor = req.cookies.get(COOKIE_VISITOR)?.value || null;
  const visitorId = existingVisitor || createId();

  const cookieConversationId = req.cookies.get(COOKIE_CONVERSATION)?.value || null;
  const requestedConversationId = parsed.success ? parsed.data.conversationId : undefined;
  const preferredConversationId = requestedConversationId || cookieConversationId || null;

  const nowIso = new Date().toISOString();

  // Find or create a conversation for this visitor.
  let conversation:
    | { id: string; summary: string | null; language: string | null }
    | null = null;

  if (preferredConversationId) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, summary, language, expires_at, visitor_id')
      .eq('id', preferredConversationId)
      .maybeSingle();

    const expiresAtIso =
      typeof data?.expires_at === 'string'
        ? data.expires_at
        : data?.expires_at != null
          ? String(data.expires_at)
          : null;

    if (data && data.visitor_id === visitorId && expiresAtIso && expiresAtIso > nowIso) {
      conversation = {
        id: String(data.id),
        summary: typeof data.summary === 'string' ? data.summary : '',
        language: typeof data.language === 'string' ? data.language : null,
      };
    }
  }

  if (!conversation) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, summary, language, expires_at')
      .eq('visitor_id', visitorId)
      .gt('expires_at', nowIso)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      conversation = {
        id: String(data.id),
        summary: typeof data.summary === 'string' ? data.summary : '',
        language: typeof data.language === 'string' ? data.language : null,
      };
    }
  }

  if (!conversation) {
    const conversationId = createId();
    const expiresAt = isoNowPlusChatRetentionDays();
    const { error } = await supabase.from('ai_conversations').insert({
      id: conversationId,
      visitor_id: visitorId,
      summary: '',
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[chat/history] Failed to create conversation', {
        conversationId,
        visitorId,
        error,
      });
      return NextResponse.json(
        {
          error: {
            code: 'DB_WRITE_FAILED',
            message: 'Failed to create conversation',
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
            supabaseHost:
              process.env.NODE_ENV !== 'production' && process.env.SUPABASE_URL
                ? new URL(process.env.SUPABASE_URL).hostname
                : undefined,
          },
        },
        { status: 500 },
      );
    }
    conversation = { id: conversationId, summary: '', language: null };
  }

  const { data: messages, error: msgErr } = await supabase
    .from('ai_messages')
    .select('id, role, modality, content, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .limit(MESSAGE_LIMIT);

  if (msgErr) {
    console.error('[chat/history] Failed to load messages', {
      conversationId: conversation.id,
      error: msgErr,
    });
    return NextResponse.json(
      {
        error: {
          code: 'DB_READ_FAILED',
          message: 'Failed to load messages',
          details: process.env.NODE_ENV !== 'production' ? msgErr.message : undefined,
        },
      },
      { status: 500 },
    );
  }

  const res = NextResponse.json({
    visitorId,
    conversationId: conversation.id,
    summary: conversation.summary ?? '',
    messages: (messages || []).map((m) => ({
      id: m.id,
      role: m.role,
      modality: m.modality || 'text',
      content: m.content,
      createdAt: normalizeSupabaseTimestamp(m.created_at),
    })),
  });

  // Keep cookies stable for 30 days.
  if (!existingVisitor) {
    res.cookies.set(COOKIE_VISITOR, visitorId, {
      path: '/',
      maxAge: getChatRetentionMaxAgeSeconds(),
      sameSite: 'lax',
    });
  }
  if (cookieConversationId !== conversation.id) {
    res.cookies.set(COOKIE_CONVERSATION, conversation.id, {
      path: '/',
      maxAge: getChatRetentionMaxAgeSeconds(),
      sameSite: 'lax',
    });
  }

  return res;
}

