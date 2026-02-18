'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface PropertySnapshotProps {
  id: string;
  title: string;
  price: number | string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  type?: string;
  features?: string[];
}

export default function PropertySnapshotEmitter(props: PropertySnapshotProps) {
  const sp = useSearchParams();
  const cid = sp?.get('cid') || (typeof window !== 'undefined' ? window.sessionStorage.getItem('lumina_cid') : null);

  useEffect(() => {
    if (!cid) return;
    try {
      const channel = new BroadcastChannel(`lumina-ai-${cid}`);
      channel.postMessage({ type: 'property_snapshot', ...props });
      channel.close();
    } catch {}
    // Also persist a fallback snapshot so the chat can consume it later (same-tab nav)
    try {
      const key = `lumina_snapshots_${cid}`;
      const existing = JSON.parse(window.sessionStorage.getItem(key) || '[]');
      existing.push({ type: 'property_snapshot', ...props, ts: Date.now() });
      window.sessionStorage.setItem(key, JSON.stringify(existing));
    } catch {}
    // run only once per cid/props identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  return null;
}


