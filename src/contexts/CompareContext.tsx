'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface CompareContextValue {
  ids: number[];
  isSelected: (id: number) => boolean;
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
  max: number;
}

const MAX_COMPARE = 4;
const STORAGE_KEY = 'lumina_compare';

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const readIdsFromStorage = () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((n) => typeof n === 'number').slice(0, MAX_COMPARE);
      }
    } catch (error) {
      console.error('Compare: unable to parse storage', error);
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    return [];
  };

  // Load from localStorage
  useEffect(() => {
    setIds(readIdsFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [hydrated, ids]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let syncTimer: number | null = null;
    const scheduleSync = () => {
      if (syncTimer) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        setIds(readIdsFromStorage());
      }, 50);
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEY) {
        scheduleSync();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      if (syncTimer) window.clearTimeout(syncTimer);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const isSelected = useCallback((id: number) => ids.includes(id), [ids]);

  const add = useCallback((id: number) => {
    if (ids.includes(id)) return;
    if (ids.length >= MAX_COMPARE) {
      console.warn('Compare: max 4 items reached');
      return;
    }
    const next = [...ids, id];
    setIds(next);
    console.log('analytics:event', 'compare_add', { id });
  }, [ids]);

  const remove = useCallback((id: number) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    console.log('analytics:event', 'compare_remove', { id });
  }, [ids]);

  const toggle = useCallback((id: number) => {
    if (ids.includes(id)) remove(id); else add(id);
  }, [add, ids, remove]);

  const clear = useCallback(() => {
    setIds([]);
    console.log('analytics:event', 'compare_clear');
  }, []);

  const value = useMemo<CompareContextValue>(() => ({ ids, isSelected, add, remove, toggle, clear, max: MAX_COMPARE }), [ids, isSelected, add, remove, toggle, clear]);

  return (
    <CompareContext.Provider value={value}>
      {hydrated ? children : null}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}


