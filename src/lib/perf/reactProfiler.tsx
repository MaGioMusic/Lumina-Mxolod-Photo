'use client';

import React, { Profiler, type ProfilerOnRenderCallback } from 'react';

type Phase = 'mount' | 'update' | 'nested-update';

export interface ProfilerEvent {
  id: string;
  phase: Phase;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  route: string;
  recordedAt: number;
}

export interface ProfilerStat {
  id: string;
  renderCount: number;
  mountCount: number;
  updateCount: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  maxActualDuration: number;
  maxBaseDuration: number;
  lastRoute: string;
  lastCommitTime: number;
}

declare global {
  interface Window {
    __LUMINA_PROFILER_ENABLED__?: boolean;
    __LUMINA_PROFILE_EVENTS__?: ProfilerEvent[];
    __LUMINA_PROFILE_STATS__?: Record<string, ProfilerStat>;
    __LUMINA_PROFILE_MAX_EVENTS__?: number;
    __LUMINA_PROFILE_RESET__?: () => void;
  }
}

const DEFAULT_MAX_EVENTS = 20_000;

function isEnabled(): boolean {
  return typeof window !== 'undefined' && window.__LUMINA_PROFILER_ENABLED__ === true;
}

function ensureStores() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window.__LUMINA_PROFILE_EVENTS__) {
    window.__LUMINA_PROFILE_EVENTS__ = [];
  }

  if (!window.__LUMINA_PROFILE_STATS__) {
    window.__LUMINA_PROFILE_STATS__ = {};
  }

  if (!window.__LUMINA_PROFILE_RESET__) {
    window.__LUMINA_PROFILE_RESET__ = () => {
      window.__LUMINA_PROFILE_EVENTS__ = [];
      window.__LUMINA_PROFILE_STATS__ = {};
    };
  }

  return {
    events: window.__LUMINA_PROFILE_EVENTS__,
    stats: window.__LUMINA_PROFILE_STATS__,
    maxEvents: window.__LUMINA_PROFILE_MAX_EVENTS__ ?? DEFAULT_MAX_EVENTS,
  };
}

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (!isEnabled()) return;

  const stores = ensureStores();
  if (!stores) return;

  const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
  const event: ProfilerEvent = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    route,
    recordedAt: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  };

  if (stores.events.length < stores.maxEvents) {
    stores.events.push(event);
  }

  const existing = stores.stats[id];
  if (!existing) {
    stores.stats[id] = {
      id,
      renderCount: 1,
      mountCount: phase === 'mount' ? 1 : 0,
      updateCount: phase === 'mount' ? 0 : 1,
      totalActualDuration: actualDuration,
      totalBaseDuration: baseDuration,
      maxActualDuration: actualDuration,
      maxBaseDuration: baseDuration,
      lastRoute: route,
      lastCommitTime: commitTime,
    };
    return;
  }

  existing.renderCount += 1;
  if (phase === 'mount') {
    existing.mountCount += 1;
  } else {
    existing.updateCount += 1;
  }
  existing.totalActualDuration += actualDuration;
  existing.totalBaseDuration += baseDuration;
  existing.maxActualDuration = Math.max(existing.maxActualDuration, actualDuration);
  existing.maxBaseDuration = Math.max(existing.maxBaseDuration, baseDuration);
  existing.lastRoute = route;
  existing.lastCommitTime = commitTime;
};

interface ProfiledSectionProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Wrap expensive trees while keeping instrumentation disabled by default.
 * Enable in-browser with: window.__LUMINA_PROFILER_ENABLED__ = true
 */
export function ProfiledSection({ id, children }: ProfiledSectionProps) {
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

