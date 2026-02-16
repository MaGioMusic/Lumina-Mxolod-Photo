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
    let didAdd = false;
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COMPARE) {
        console.warn('Compare: max 4 items reached');
        return prev;
      }
      didAdd = true;
      return [...prev, id];
    });
    if (didAdd) {
      console.log('analytics:event', 'compare_add', { id });
    }
  }, []);

  const remove = useCallback((id: number) => {
    let didRemove = false;
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      didRemove = next.length !== prev.length;
      return next;
    });
    if (didRemove) {
      console.log('analytics:event', 'compare_remove', { id });
    }
  }, []);

  const toggle = useCallback((id: number) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        console.log('analytics:event', 'compare_remove', { id });
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        console.warn('Compare: max 4 items reached');
        return prev;
      }
      console.log('analytics:event', 'compare_add', { id });
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => {
    setIds((prev) => {
      if (prev.length === 0) return prev;
      console.log('analytics:event', 'compare_clear');
      return [];
    });
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


