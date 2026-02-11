'use client';

type GtagWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

function gtag(...args: unknown[]) {
  try {
    const w = window as unknown as GtagWindow;
    w.dataLayer = w.dataLayer || [];
    // Push the full argument list as one dataLayer entry (standard gtag pattern)
    w.dataLayer.push(args);
  } catch {}
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    const w = window as unknown as GtagWindow;
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, params || {});
    }
  } catch {}
}


