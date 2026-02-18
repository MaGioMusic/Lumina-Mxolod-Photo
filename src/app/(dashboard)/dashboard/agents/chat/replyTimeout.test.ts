import assert from 'node:assert/strict';
import test from 'node:test';
import type { MutableRefObject } from 'react';
import { clearReplyTimeout, scheduleReplyTimeout, type ReplyTimeoutTimer } from './replyTimeout';

class FakeTimer implements ReplyTimeoutTimer {
  private nextId = 1;
  private callbacks = new Map<number, () => void>();
  clearedIds: number[] = [];

  setTimeout(callback: () => void): number {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  }

  clearTimeout(timeoutId: number): void {
    this.clearedIds.push(timeoutId);
    this.callbacks.delete(timeoutId);
  }

  run(timeoutId: number): void {
    const callback = this.callbacks.get(timeoutId);
    if (!callback) return;
    this.callbacks.delete(timeoutId);
    callback();
  }
}

function createRef(initial: number | null): MutableRefObject<number | null> {
  return { current: initial };
}

test('scheduleReplyTimeout clears previous pending timeout before scheduling new one', () => {
  const timer = new FakeTimer();
  const timeoutRef = createRef(null);
  let callbackRuns = 0;

  scheduleReplyTimeout(timeoutRef, () => {
    callbackRuns += 1;
  }, 800, timer);

  const firstTimeoutId = timeoutRef.current;
  assert.notEqual(firstTimeoutId, null);

  scheduleReplyTimeout(timeoutRef, () => {
    callbackRuns += 1;
  }, 800, timer);

  const secondTimeoutId = timeoutRef.current;
  assert.notEqual(secondTimeoutId, null);
  assert.notEqual(secondTimeoutId, firstTimeoutId);
  assert.deepEqual(timer.clearedIds, [firstTimeoutId]);

  timer.run(secondTimeoutId!);
  assert.equal(callbackRuns, 1);
  assert.equal(timeoutRef.current, null);
});

test('clearReplyTimeout clears timer and resets ref', () => {
  const timer = new FakeTimer();
  const timeoutRef = createRef(42);

  const wasCleared = clearReplyTimeout(timeoutRef, timer);

  assert.equal(wasCleared, true);
  assert.equal(timeoutRef.current, null);
  assert.deepEqual(timer.clearedIds, [42]);
});

test('clearReplyTimeout no-ops when there is no pending timer', () => {
  const timer = new FakeTimer();
  const timeoutRef = createRef(null);

  const wasCleared = clearReplyTimeout(timeoutRef, timer);

  assert.equal(wasCleared, false);
  assert.deepEqual(timer.clearedIds, []);
});
