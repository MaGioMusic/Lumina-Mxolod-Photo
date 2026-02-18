import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getChatRetentionMaxAgeSeconds, isoNowPlusChatRetentionDays } from '@/lib/chatRetention';

const COOKIE_VISITOR = 'lumina_ai_visitor_id';
const COOKIE_CONVERSATION = 'lumina_ai_conversation_id';

const bodySchema = z.object({
  id: z.string().min(8).max(80).optional(), // allow client-generated ids (uuid or fallback)
  role: z.enum(['user', 'assistant']),
  modality: z.enum(['text', 'voice']).default('text'),
  content: z.string().trim().min(1).max(8000),
});

function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function updateRollingSummary(prev: string, userText: string): string {
  const cleaned = userText.replace(/\s+/g, ' ').trim();
  if (!cleaned) return prev || '';

  const lines = (prev || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('Updated:'));

  // Keep only unique last items
  if (!lines.includes(`- ${cleaned}`)) lines.push(`- ${cleaned}`);
  const trimmed = lines.slice(-6); // last 6 bullets

  const header = `Updated: ${new Date().toLocaleString()}`;
  const next = [header, ...trimmed].join('\n');
  return next.slice(0, 1200);
}

export async function POST(req: NextRequest) {
  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    // Dev/local fallback: allow chat UI to continue without persistence when
    // Supabase admin env is missing. This prevents noisy 503 loops in console.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        persisted: false,
        reason: 'SUPABASE_NOT_CONFIGURED',
        summary: '',
      });
    }

    return NextResponse.json(
      {
        error: {
          code: 'SUPABASE_NOT_CONFIGURED',
          message:
            e instanceof Error
              ? e.message
              : 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
        },
      },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid body' } }, { status: 400 });
  }

  const existingVisitor = req.cookies.get(COOKIE_VISITOR)?.value || null;
  const visitorId = existingVisitor || createId();

  const existingConversation = req.cookies.get(COOKIE_CONVERSATION)?.value || null;
  const conversationId = existingConversation || createId();

  const nowIso = new Date().toISOString();
  const expiresAt = isoNowPlusChatRetentionDays();

  // Ensure conversation exists (and belongs to this visitor_id).
  const { data: conv } = await supabase
    .from('ai_conversations')
    .select('id, summary, visitor_id, expires_at')
    .eq('id', conversationId)
    .maybeSingle();

  let summary = typeof conv?.summary === 'string' ? conv.summary : '';

  if (!conv) {
    const { error } = await supabase.from('ai_conversations').insert({
      id: conversationId,
      visitor_id: visitorId,
      summary: '',
      expires_at: expiresAt,
      updated_at: nowIso,
    });
    if (error) {
      console.error('[chat/message] Failed to create conversation', {
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
  } else {
    // Basic guard: prevent writing into a different visitor's conversation.
    const convVisitorId =
      typeof conv.visitor_id === 'string' ? conv.visitor_id : String(conv.visitor_id ?? '');
    if (convVisitorId !== visitorId) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Conversation mismatch' } }, { status: 403 });
    }
    // If expired, create a new conversation (roll forward).
    const convExpiresAtIso =
      typeof conv.expires_at === 'string' ? conv.expires_at : String(conv.expires_at ?? '');
    if (!convExpiresAtIso || convExpiresAtIso <= nowIso) {
      const newId = createId();
      const { error } = await supabase.from('ai_conversations').insert({
        id: newId,
        visitor_id: visitorId,
        summary: '',
        expires_at: expiresAt,
        updated_at: nowIso,
      });
      if (error) {
        console.error('[chat/message] Failed to roll conversation forward', {
          previousConversationId: conversationId,
          newConversationId: newId,
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
      summary = '';
      // overwrite conversation id for this request
      (payload as any)._conversationId = newId;
    }
  }

  const effectiveConversationId = (payload as any)._conversationId || conversationId;
  const messageId = payload.id || createId();

  const { error: msgErr } = await supabase.from('ai_messages').insert({
    id: messageId,
    conversation_id: effectiveConversationId,
    role: payload.role,
    modality: payload.modality,
    content: payload.content,
  });

  if (msgErr) {
    console.error('[chat/message] Failed to store message', {
      messageId,
      effectiveConversationId,
      role: payload.role,
      modality: payload.modality,
      error: msgErr,
    });
    return NextResponse.json(
      {
        error: {
          code: 'DB_WRITE_FAILED',
          message: 'Failed to store message',
          details: process.env.NODE_ENV !== 'production' ? msgErr.message : undefined,
          supabaseHost:
            process.env.NODE_ENV !== 'production' && process.env.SUPABASE_URL
              ? new URL(process.env.SUPABASE_URL).hostname
              : undefined,
        },
      },
      { status: 500 },
    );
  }

  // Update conversation TTL and rolling summary (only on user messages).
  const nextSummary =
    payload.role === 'user' ? updateRollingSummary(summary, payload.content) : summary;

  await supabase
    .from('ai_conversations')
    .update({
      updated_at: nowIso,
      expires_at: expiresAt,
      summary: nextSummary,
    })
    .eq('id', effectiveConversationId);

  const res = NextResponse.json({
    visitorId,
    conversationId: effectiveConversationId,
    messageId,
    summary: nextSummary,
  });

  if (!existingVisitor) {
    res.cookies.set(COOKIE_VISITOR, visitorId, { path: '/', maxAge: getChatRetentionMaxAgeSeconds(), sameSite: 'lax' });
  }
  if (existingConversation !== effectiveConversationId) {
    res.cookies.set(COOKIE_CONVERSATION, effectiveConversationId, { path: '/', maxAge: getChatRetentionMaxAgeSeconds(), sameSite: 'lax' });
  }

  return res;
}

