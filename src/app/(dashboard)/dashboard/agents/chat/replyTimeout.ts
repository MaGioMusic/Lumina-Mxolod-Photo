import type { MutableRefObject } from 'react';

export interface ReplyTimeoutTimer {
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (timeoutId: number) => void;
}

export const browserReplyTimeoutTimer: ReplyTimeoutTimer = {
  setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clearTimeout: (timeoutId) => window.clearTimeout(timeoutId),
};

export function clearReplyTimeout(
  timeoutRef: MutableRefObject<number | null>,
  timer: ReplyTimeoutTimer = browserReplyTimeoutTimer,
): boolean {
  if (timeoutRef.current === null) return false;
  timer.clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
  return true;
}

export function scheduleReplyTimeout(
  timeoutRef: MutableRefObject<number | null>,
  callback: () => void,
  delayMs: number,
  timer: ReplyTimeoutTimer = browserReplyTimeoutTimer,
): void {
  clearReplyTimeout(timeoutRef, timer);
  timeoutRef.current = timer.setTimeout(() => {
    timeoutRef.current = null;
    callback();
  }, delayMs);
}
