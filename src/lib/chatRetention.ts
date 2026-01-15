const DEFAULT_CHAT_RETENTION_DAYS = 1;
const MAX_CHAT_RETENTION_DAYS = 365;

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function getChatRetentionDays(): number {
  const raw = process.env.CHAT_RETENTION_DAYS;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_CHAT_RETENTION_DAYS;
  return clampInt(parsed, 1, MAX_CHAT_RETENTION_DAYS);
}

export function getChatRetentionMaxAgeSeconds(): number {
  return getChatRetentionDays() * 24 * 60 * 60;
}

export function isoNowPlusChatRetentionDays(): string {
  const days = getChatRetentionDays();
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

