'use client';

import Image from 'next/image';
import { Star, Phone, EnvelopeSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { ProfileAgentSummary } from '@/types/profile';

interface AssignedAgentCardProps {
  agent?: ProfileAgentSummary | null;
}

const RATING_STORAGE_PREFIX = 'lumina_agent_rating_';
const clampRating = (value: number) => Math.max(0, Math.min(5, value));

function RatingStars({
  agentId,
  baseRating,
}: {
  agentId: string;
  baseRating?: number | null;
}) {
  const storageKey = useMemo(() => `${RATING_STORAGE_PREFIX}${agentId}`, [agentId]);
  const initialBase = clampRating(baseRating ?? 0);
  const [storedRating, setStoredRating] = useState<number | null>(null);
  const [displayRating, setDisplayRating] = useState<number>(initialBase);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) {
          setStoredRating(clampRating(parsed));
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    setDisplayRating(storedRating !== null ? storedRating : initialBase);
  }, [storedRating, initialBase]);

  const ratingToShow = clampRating(hoverValue ?? displayRating);

  const handleRate = (value: number) => {
    const next = clampRating(value);
    setStoredRating(next);
    setDisplayRating(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {}
    }
  };

  return (
    <div
      className="flex flex-col items-end gap-1"
      onMouseLeave={() => setHoverValue(null)}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          const filled = ratingToShow >= value - 0.3;
          return (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onMouseEnter={() => setHoverValue(value)}
              onFocus={() => setHoverValue(value)}
              onBlur={() => setHoverValue(null)}
              onClick={() => handleRate(value)}
              aria-label={`შეაფასე ${value} ვარსკვლავით`}
              className="rounded-md p-0.5 text-amber-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
            >
              <Star size={16} weight={filled ? 'fill' : 'regular'} className={filled ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'} />
            </motion.button>
          );
        })}
        <motion.span
          key={ratingToShow}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="ml-1 text-xs font-semibold text-slate-600 dark:text-slate-200"
        >
          {ratingToShow.toFixed(1)}
        </motion.span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        დააჭირე ვარსკვლავებს
      </span>
    </div>
  );
}

export default function AssignedAgentCard({ agent }: AssignedAgentCardProps) {
  const router = useRouter();
  if (!agent) return null;

  const openChat = () => {
    const params = new URLSearchParams();
    params.set('contactId', agent.id);
    if (agent.name) params.set('contactName', agent.name);
    if (agent.avatarUrl ?? '') params.set('contactAvatar', agent.avatarUrl as string);
    router.push(`/agents/chat?${params.toString()}`);
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition hover:shadow-[0_18px_55px_rgba(15,23,42,0.1)] dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-100 shadow-sm dark:border-slate-700">
          {agent.avatarUrl ? (
            <Image
              src={agent.avatarUrl}
              alt={agent.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-amber-100 text-lg font-semibold text-amber-700">
              {agent.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">{agent.name}</div>
              {agent.companyName && (
                <div className="text-xs text-slate-500 dark:text-slate-400">{agent.companyName}</div>
              )}
            </div>
            <RatingStars agentId={agent.id} baseRating={agent.rating} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {agent.phone && (
              <a
                href={`tel:${agent.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
              >
                <Phone size={14} weight="bold" />
                {agent.phone}
              </a>
            )}
            <button
              type="button"
              onClick={openChat}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
            >
              <EnvelopeSimple size={14} weight="bold" />
              Message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
