const aiToolSideEffectsEnabled = process.env.NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS === '1';
const chatSideEffectsDebugEnabled = process.env.NEXT_PUBLIC_CHAT_SIDEEFFECTS_DEBUG === '1';

const MAX_PREVIEW_DEPTH = 2;
const MAX_PREVIEW_ARRAY_ITEMS = 5;
const MAX_PREVIEW_OBJECT_KEYS = 12;
const REDACTED = '[REDACTED]';
const sensitiveKeyPattern = /(token|secret|password|authorization|cookie|email|phone)/i;

const toSafePreview = (value: unknown, depth = 0): unknown => {
  if (depth > MAX_PREVIEW_DEPTH) return '[depth-limit]';

  if (value === null || value === undefined) return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    return value.length > 96 ? `${value.slice(0, 93)}...` : value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_PREVIEW_ARRAY_ITEMS)
      .map((entry) => toSafePreview(entry, depth + 1));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_PREVIEW_OBJECT_KEYS);
    const safe: Record<string, unknown> = {};
    for (const [key, item] of entries) {
      safe[key] = sensitiveKeyPattern.test(key) ? REDACTED : toSafePreview(item, depth + 1);
    }
    return safe;
  }

  return String(value);
};

export interface ChatSideEffectTraceInput {
  source: string;
  effect: string;
  allowed: boolean;
  detail?: unknown;
}

export const isAiToolSideEffectsEnabled = (): boolean => aiToolSideEffectsEnabled;

export const isChatSideEffectsDebugEnabled = (): boolean => chatSideEffectsDebugEnabled;

export const traceChatSideEffect = ({
  source,
  effect,
  allowed,
  detail,
}: ChatSideEffectTraceInput): void => {
  if (!chatSideEffectsDebugEnabled) return;
  if (typeof window === 'undefined') return;

  const prefix = allowed ? 'ALLOW' : 'BLOCK';
  const message = `[chat-sideeffects:${prefix}] ${source}:${effect}`;
  const safeDetail = toSafePreview(detail);

  if (allowed) {
    console.info(message, safeDetail);
  } else {
    console.warn(message, safeDetail);
  }
};

