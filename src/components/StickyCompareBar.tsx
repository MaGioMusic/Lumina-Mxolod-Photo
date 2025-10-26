'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCompare } from '@/contexts/CompareContext';
import { getMockPropertyById } from '@/lib/mockProperties';
import { useLanguage } from '@/contexts/LanguageContext';
import { Scale, ChevronUp, Pin, PinOff } from 'lucide-react';

export default function StickyCompareBar() {
  const { ids, remove, clear } = useCompare();
  const { t } = useLanguage();
  const router = useRouter();

  // Add bottom offset only when items exist
  useEffect(() => {
    const cls = 'has-compare-bar';
    if (ids.length > 0) {
      document.documentElement.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
    }
    return () => document.documentElement.classList.remove(cls);
  }, [ids.length]);

  const qs = ids.join(',');

  // Mini-collapse & pin
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);

  // When collapsed and not pinned, reduce main bottom padding
  useEffect(() => {
    const pillCls = 'has-compare-pill';
    if (ids.length > 0 && collapsed && !pinned) {
      document.documentElement.classList.add(pillCls);
    } else {
      document.documentElement.classList.remove(pillCls);
    }
    return () => document.documentElement.classList.remove(pillCls);
  }, [ids.length, collapsed, pinned]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const cur = window.scrollY;
      if (!pinned) {
        // Collapse on downward scroll, expand on upward
        if (cur > last + 4) setCollapsed(true);
        else if (cur < last - 4) setCollapsed(false);
      }
      last = cur;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pinned]);

  // Hover near bottom to expand
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!pinned && collapsed && window.innerHeight - e.clientY < 24) {
        setCollapsed(false);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [collapsed, pinned]);

  // Collapsed content (pill)
  const Collapsed = useMemo(() => (
    <div className="w-full max-w-5xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 rounded-full shadow-md p-2">
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-2 py-1 text-gray-700 dark:text-gray-200"
          onClick={() => setCollapsed(false)}
          aria-label="Expand compare bar"
        >
          <Scale className="w-4 h-4 text-[#F08336]" />
          <span className="text-xs font-medium">{ids.length}</span>
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            aria-pressed={pinned}
            onClick={() => setPinned((v) => !v)}
            className="p-1 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            title={pinned ? 'Unpin' : 'Pin'}
          >
            {pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          {ids.length >= 2 ? (
            <a href={`/compare?id=${qs}`} className="px-3 py-1 text-xs rounded-full text-white bg-[#F08336] hover:bg-orange-600">
              {t('compareNow') || 'Compare now'}
            </a>
          ) : (
            <button disabled className="px-3 py-1 text-xs rounded-full text-white bg-orange-300 cursor-not-allowed" title={t('minTwoObjects') || 'მინ. 2 ობიექტი'}>
              {t('compareNow') || 'Compare now'}
            </button>
          )}
        </div>
      </div>
    </div>
  ), [ids.length, pinned, qs, t]);

  if (ids.length === 0) {
    return null;
  }

  return (
    <div role="region" aria-label="Comparison bar" className="fixed bottom-4 inset-x-0 z-[10010] flex justify-center px-4">
      <div className={`w-full max-w-5xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 rounded-xl shadow-lg shadow-orange-500/10 transition-all duration-200 ${collapsed ? 'p-0 rounded-full' : 'p-3'}`}>
        {collapsed ? (
          Collapsed
        ) : (
        <div className="flex items-center gap-3 overflow-auto">
          {ids.map((id) => {
            const p = getMockPropertyById(id);
            if (!p) return null;
            return (
              <div key={id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                <div className="relative w-10 h-10 rounded overflow-hidden">
                  <Image src={p.image} alt={`Property ${id}`} fill className="object-cover" />
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 min-w-[80px]">
                  {'$'}{p.price.toLocaleString()}
                </div>
                <button
                  onClick={() => remove(id)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                  aria-label={t('remove') || 'Remove'}
                >
                  ✕
                </button>
              </div>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              aria-pressed={pinned}
              onClick={() => setPinned((v) => !v)}
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
              title={pinned ? 'Unpin' : 'Pin'}
            >
              {pinned ? <span className="inline-flex items-center gap-1"><Pin className="w-3 h-3" /> Pin</span> : <span className="inline-flex items-center gap-1"><PinOff className="w-3 h-3" /> Pin</span>}
            </button>
            <button
              onClick={clear}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t('clearAll') || 'Clear all'}
            </button>

            {ids.length < 2 ? (
              <button
                disabled
                className={`px-3 py-1.5 text-xs rounded-md text-white bg-orange-300 cursor-not-allowed`}
                title={t('minTwoObjects') || 'მინ. 2 ობიექტი'}
                aria-disabled
              >
                {t('compareNow') || 'Compare now'}
              </button>
            ) : (
              <a
                href={`/compare?id=${qs}`}
                onClick={() => console.log('analytics:event', 'compare_open', { ids })}
                className="px-3 py-1.5 text-xs rounded-md text-white bg-[#F08336] hover:bg-orange-600"
              >
                {t('compareNow') || 'Compare now'}
              </a>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}


