'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { ChatLauncherButton } from './chatLauncherButton';
import { HybridChatPanel } from './hybridChatPanel';
import type { ChatMessage } from './ChatMessageComponent';
import { usePropertySearch } from '@/hooks/ai/usePropertySearch';
import { runtimeFlags } from '@/lib/flags';
import { useGeminiLiveSession } from '@/hooks/ai/useGeminiLiveSession';
import { useLanguage } from '@/contexts/LanguageContext';

const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
});

type PersistedChatMessage = ChatMessage & {
  modality?: 'text' | 'voice';
};

export default function AIChatComponent() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const [messages, setMessages] = useState<PersistedChatMessage[]>([]);
  const [chatSummary, setChatSummary] = useState('');
  const hydratedFromDbRef = useRef(false);
  const persistedMessageIdsRef = useRef<Set<string>>(new Set());
  const lastSavedTranscriptRef = useRef<string>('');
  const assistantDraftIdRef = useRef<string | null>(null);
  const assistantFlushTimerRef = useRef<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Voice feature flag: default from env, URL can disable with ?voice=0
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const voiceDefaultOn = runtimeFlags.voiceDefaultOn;
  const isVoiceEnabled = searchParams?.get('voice') === '0' ? false : voiceDefaultOn;
  // Function-calling: default from env, URL can disable with ?fc=0
  const fcDefaultOn = runtimeFlags.functionCallingDefaultOn;
  const isFunctionCallingEnabled = searchParams?.get('fc') === '0' ? false : fcDefaultOn;

  const { handleFunctionCall } = usePropertySearch({ isChatOpen: isOpen });

  const [lastTranscript, setLastTranscript] = useState('');
  const safeVoiceEnabled = isVoiceEnabled && voiceSupported && !voiceError;

  const nearbyConfig = useMemo(() => {
    return {
      keywords: [
        'near', 'nearby', 'around', 'close to', 'what is around', 'near me',
        'ახლოს', 'გარშემო', 'მახლობლად', 'თან', 'შუასადაც',
        'рядом', 'вокруг', 'поблизости',
      ],
      typeMap: [
        { key: 'metro', patterns: ['metro', 'subway', 'station', 'მეტრო', 'метро'] },
        { key: 'school', patterns: ['school', 'schools', 'სკოლა', 'школа'] },
        { key: 'kindergarten', patterns: ['kindergarten', 'детский сад', 'садик', 'საბავშვო ბაღი', 'ბაღი'] },
        { key: 'market', patterns: ['market', 'markets', 'supermarket', 'სუპერმარკეტი', 'მარკეტი', 'рынок', 'магазин'] },
      ],
    };
  }, []);

  const extractRadiusMeters = useCallback((raw: string) => {
    const text = raw.toLowerCase();
    const kmMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(km|კმ|kilometer|kilometre|км)\b/);
    if (kmMatch) {
      const value = Number(kmMatch[1].replace(',', '.'));
      if (Number.isFinite(value)) return Math.round(value * 1000);
    }
    const mMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(m|მ|meter|метр)\b/);
    if (mMatch) {
      const value = Number(mMatch[1].replace(',', '.'));
      if (Number.isFinite(value)) return Math.round(value);
    }
    return null;
  }, []);

  const extractTypes = useCallback((raw: string) => {
    const lower = raw.toLowerCase();
    const types: string[] = [];
    nearbyConfig.typeMap.forEach((entry) => {
      if (entry.patterns.some((p) => lower.includes(p))) {
        types.push(entry.key);
      }
    });
    return types.length ? Array.from(new Set(types)) : undefined;
  }, [nearbyConfig.typeMap]);

  const stripTokens = useCallback((raw: string) => {
    let cleaned = raw;
    cleaned = cleaned.replace(/(\d+(?:[.,]\d+)?)\s*(km|კმ|kilometer|kilometre|км|m|მ|meter|метр)\b/gi, ' ');
    nearbyConfig.typeMap.forEach((entry) => {
      entry.patterns.forEach((p) => {
        const re = new RegExp(`\\b${p}\\b`, 'gi');
        cleaned = cleaned.replace(re, ' ');
      });
    });
    nearbyConfig.keywords.forEach((kw) => {
      const re = new RegExp(`\\b${kw}\\b`, 'gi');
      cleaned = cleaned.replace(re, ' ');
    });
    return cleaned.replace(/\s{2,}/g, ' ').trim();
  }, [nearbyConfig]);

  useEffect(() => {
    mountedRef.current = true;
    const supported =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia;
    setVoiceSupported(Boolean(supported));
    if (!supported) {
      setVoiceError('Voice capture is not supported in this browser or context.');
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Gemini hook (the only supported provider)
  const {
    isListening: geminiListening,
    isMuted: geminiMuted,
    isAiSpeaking: geminiAiSpeaking,
    playbackAnalyser: geminiPlaybackAnalyser,
    startVoice: startGeminiVoice,
    stopVoice: stopGeminiVoice,
    toggleMute: toggleGeminiMute,
    sendText: sendGeminiText,
  } = useGeminiLiveSession({
    enabled: safeVoiceEnabled,
    isFunctionCallingEnabled,
    handleFunctionCall,
    onTranscript: setLastTranscript,
    onError: (msg) => setVoiceError(msg),
    onResponseText: (txt) => {
      appendAssistantDelta(txt);
    },
  });

  const isListening = geminiListening;
  const isAiSpeaking = geminiAiSpeaking;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const createId = () => {
    try {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    } catch {}
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const appendUserMessage = useCallback((content: string, modality: 'text' | 'voice' = 'text') => {
    const msg: PersistedChatMessage = {
      id: createId(),
      role: 'user',
      content,
      isPartial: false,
      isFinal: true,
      timestamp: new Date(),
      modality,
    };
    setMessages((prev) => [...prev, msg]);
    return msg.id;
  }, []);

  const appendAssistantDelta = useCallback((delta: string) => {
    if (!delta) return;
    setMessages((prev) => {
      const id = assistantDraftIdRef.current || createId();
      const existingIdx = prev.findIndex((m) => m.id === id);
      assistantDraftIdRef.current = id;

      if (existingIdx >= 0) {
        const next = [...prev];
        const cur = next[existingIdx]!;
        next[existingIdx] = {
          ...cur,
          content: `${cur.content}${delta}`,
          isPartial: true,
          isFinal: false,
        };
        return next;
      }

      const nextMsg: PersistedChatMessage = {
        id,
        role: 'assistant',
        content: delta,
        isPartial: true,
        isFinal: false,
        timestamp: new Date(),
        modality: 'text',
      };
      return [...prev, nextMsg];
    });

    // Debounced "finalize" so we don't create a new bubble per token.
    if (assistantFlushTimerRef.current) window.clearTimeout(assistantFlushTimerRef.current);
    assistantFlushTimerRef.current = window.setTimeout(() => {
      const draftId = assistantDraftIdRef.current;
      assistantDraftIdRef.current = null;
      if (!draftId) return;
      setMessages((prev) => prev.map((m) => (m.id === draftId ? { ...m, isPartial: false, isFinal: true } : m)));
    }, 700);
  }, []);

  const maybeHandleNearbyFallback = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return { handled: false };
    const lower = text.toLowerCase();
    const isNearbyIntent = nearbyConfig.keywords.some((k) => lower.includes(k)) ||
      nearbyConfig.typeMap.some((entry) => entry.patterns.some((p) => lower.includes(p)));
    if (!isNearbyIntent) return { handled: false };

    const radius = extractRadiusMeters(text);
    const types = extractTypes(text);
    const address = stripTokens(text);

    if (!address || address.length < 3) {
      appendAssistantDelta(`${t('aiAskAddress')}\n`);
      return { handled: true };
    }
    if (!radius) {
      appendAssistantDelta(`${t('aiAskRadius')}\n`);
      return { handled: true };
    }

    appendAssistantDelta(`${t('aiNearbySearchStarted')}\n`);
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address, radius_m: radius, types }),
      });
      const data = await res.json().catch(() => null);
      if (data) {
        window.dispatchEvent(new CustomEvent('lumina:places:result', { detail: data }));
      }
      if (!data || data.ok !== true) {
        appendAssistantDelta(`${t('aiNearbySearchFailed')}\n`);
        return { handled: true };
      }
      const total = Array.isArray(data.categories)
        ? data.categories.reduce((acc: number, cat: any) => acc + (Array.isArray(cat.results) ? cat.results.length : 0), 0)
        : 0;
      if (total === 0) {
        appendAssistantDelta(`${t('aiNearbySearchNoResults')}\n`);
      }
      return { handled: true };
    } catch {
      appendAssistantDelta(`${t('aiNearbySearchFailed')}\n`);
      return { handled: true };
    }
  }, [appendAssistantDelta, extractRadiusMeters, extractTypes, nearbyConfig, stripTokens, t]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const clickedInsideCap =
        !!target &&
        target instanceof Element &&
        Boolean(target.closest('[data-lumina-ai-inside="1"]'));

      if (isOpen && 
          chatRef.current && 
          buttonRef.current &&
          !clickedInsideCap &&
          !chatRef.current.contains(target as Node) &&
          !buttonRef.current.contains(target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Persist chat open/closed state across navigations
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lumina_ai_chat_open') : null;
      if (stored === '1') setIsOpen(true);
        } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lumina_ai_chat_open', isOpen ? '1' : '0');
      }
    } catch {}
  }, [isOpen]);

  // Auto-restart voice after SPA navigation when flagged (debounced)
  // (moved below after voice helper definitions)

  const matchesNavigateTrigger = (raw: string | undefined | null): boolean => {
    if (!raw) return false;
    const m = raw.toLowerCase();
    const triggers = [
      'properties', 'property', 'listings', 'go to properties', 'open properties',
      'უძრავი', 'უძრავი ქონება', 'ქონება', 'განცხადებები', 'ბინების გვერდზე', 'ბინები', 'სახლები', 'გავიდეთ უძრავზე', 'გადადი უძრავი', 'მაჩვენე უძრავი'
    ];
    return triggers.some(t => m.includes(t));
  };

  // Fallback: keyword-based navigation when function-calling doesn't trigger
  useEffect(() => {
    if (matchesNavigateTrigger(message)) {
                try {
                  window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0');
                  // Only auto-start voice after navigation if we were already in voice mode.
                  window.sessionStorage.setItem('lumina_ai_autostart_mode', isListening ? 'voice' : 'text');
                } catch {}
                  router.push('/properties');
                }
  }, [message, isOpen, router]);

  // Additional fallback: navigate based on latest voice transcript
  useEffect(() => {
    if (matchesNavigateTrigger(lastTranscript)) {
                try {
                  window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0');
                  window.sessionStorage.setItem('lumina_ai_autostart_mode', isListening ? 'voice' : 'text');
                } catch {}
                router.push('/properties');
    }
  }, [lastTranscript, isOpen, router]);

  const startVoice = useCallback(async () => {
    if (!voiceSupported) {
      setVoiceError('Voice capture is not available in this browser.');
      return;
    }
    try {
      setVoiceError(null);
      try { window.sessionStorage.setItem('lumina_ai_autostart_mode', 'voice'); } catch {}
      await startGeminiVoice();
    } catch (err) {
      console.error('AI voice failed to start', err);
      if (mountedRef.current) {
        setVoiceError('Voice session failed to start. Check mic permissions and retry.');
      }
    }
  }, [startGeminiVoice, voiceSupported]);

  const stopVoice = useCallback(async () => {
    try {
      await stopGeminiVoice();
      try { window.sessionStorage.setItem('lumina_ai_autostart_mode', 'text'); } catch {}
      // Persist the final voice transcript as a user message once per stop.
      const finalTranscript = (lastTranscript || '').trim();
      if (finalTranscript && finalTranscript !== lastSavedTranscriptRef.current) {
        lastSavedTranscriptRef.current = finalTranscript;
        appendUserMessage(finalTranscript, 'voice');
        void maybeHandleNearbyFallback(finalTranscript);
      }
    } catch (err) {
      console.error('AI voice failed to stop cleanly', err);
    }
  }, [appendUserMessage, lastTranscript, maybeHandleNearbyFallback, stopGeminiVoice]);

  const persistMessage = useCallback(async (m: PersistedChatMessage) => {
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: m.id,
          role: m.role,
          modality: m.modality ?? 'text',
          content: m.content,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`chat persistence failed: ${res.status}${text ? ` - ${text}` : ''}`);
      }
      const json = (await res.json().catch(() => null)) as any;
      if (json && typeof json.summary === 'string') {
        setChatSummary(json.summary);
      }
    } catch (err) {
      // allow retry on next render
      persistedMessageIdsRef.current.delete(m.id);
      console.warn('[chat] persist failed', err);
    }
  }, []);

  const safeParseTimestamp = useCallback((value: unknown): Date => {
    if (typeof value !== 'string') return new Date();

    // Try normalize microsecond timestamps coming from Supabase (e.g. ".169252+00:00")
    const trimmed = value.trim();
    const m = trimmed.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.(\d+))?(Z|[+-]\d{2}:\d{2})$/,
    );
    const normalized = m
      ? `${m[1]}${m[3] ? `.${m[3].slice(0, 3).padEnd(3, '0')}` : ''}${m[4]}`
      : trimmed;

    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }, []);

  // Load history on mount (anon-first). This also bootstraps visitor/conversation cookies.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/chat/history', { method: 'GET' });
        if (!res.ok) return;
        const json = (await res.json()) as any;
        const rows = Array.isArray(json?.messages) ? json.messages : [];
        const hydrated: PersistedChatMessage[] = rows
          .map((r: any) => ({
            id: String(r.id),
            role: r.role === 'assistant' ? 'assistant' : 'user',
            content: String(r.content ?? ''),
            isPartial: false,
            isFinal: true,
            timestamp: safeParseTimestamp(r.createdAt),
            modality: r.modality === 'voice' ? 'voice' : 'text',
          }))
          .filter((m: PersistedChatMessage) => m.content.trim().length > 0);

        if (cancelled) return;
        setMessages(hydrated);
        persistedMessageIdsRef.current = new Set(hydrated.map((m) => m.id));
        if (typeof json?.summary === 'string') setChatSummary(json.summary);
      } catch {
        // ignore (demo/offline)
      } finally {
        hydratedFromDbRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [safeParseTimestamp]);

  // Persist newly-finalized messages (text + voice) once.
  useEffect(() => {
    if (!hydratedFromDbRef.current) return;
    for (const m of messages) {
      if (!m.isFinal) continue;
      if (persistedMessageIdsRef.current.has(m.id)) continue;
      persistedMessageIdsRef.current.add(m.id);
      void persistMessage(m);
    }
  }, [messages, persistMessage]);

  useEffect(() => {
    let t: number | null = null;
    try {
      const key = 'lumina_ai_autostart';
      const should = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
      const mode = typeof window !== 'undefined' ? window.sessionStorage.getItem('lumina_ai_autostart_mode') : null;
      if (should === '1') {
        try { window.sessionStorage.removeItem(key); } catch {}
        // Only auto-start voice if navigation came from voice mode.
        if (mode === 'voice' && safeVoiceEnabled && !isListening) {
          t = window.setTimeout(() => {
            void startVoice();
          }, 350);
        }
      }
    } catch {}
    return () => { if (t) window.clearTimeout(t); };
  }, [pathname, safeVoiceEnabled, startVoice, isListening]);

  return (
    <>
      {voiceError ? (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 10001,
            fontSize: 12,
            color: '#991b1b',
            background: '#fff6f6',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '8px 10px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            maxWidth: 260,
            lineHeight: 1.5,
          }}
        >
          ხმოვანი რეჟიმი დროებით მიუწვდომელია: {voiceError}
        </div>
      ) : null}

      <style jsx global>{`
        /* From Uiverse.io by Cobp */
        .container-ai-input {
          --perspective: 1000px;
          --translateY: 45px;
          position: fixed;
          bottom: -100px;
          right: -110px;
          width: 320px;
          height: 320px;
          z-index: 9999;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          transform-style: preserve-3d;
          pointer-events: auto; /* enable hover tracking grid */
        }

        .container-ai-input.is-open {
          pointer-events: none; /* release interactions when chat window is open */
        }

        .container-wrap {
          display: flex;
          align-items: center;
          justify-items: center;
          position: absolute;
          left: 160px;
          top: 182px; /* proportional to reduced container */
          transform: translateX(-50%) translateY(-50%);
          z-index: 9;
          transform-style: preserve-3d;
          cursor: pointer;
          padding: 4px;
          transition: all 0.3s ease;
          pointer-events: auto; /* clickable */
        }

        .container-wrap:hover {
          padding: 0;
        }

        .container-wrap:active {
          transform: translateX(-50%) translateY(-50%) scale(0.95);
        }

        .container-wrap:after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-55%);
          width: 3.2rem;
          height: 3.0rem;
          background-image: linear-gradient(135deg, rgba(240,131,54,0.22), rgba(212,175,55,0.18));
          border-radius: 1.2rem;
          transition: all 0.3s ease;
        }

        .container-wrap:hover:after {
          transform: translateX(-50%) translateY(-50%);
          height: 3.3rem;
        }

        .card {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          will-change: transform;
          transition: all 0.6s ease;
          border-radius: 1.2rem;
          display: flex;
          align-items: center;
          transform: translateZ(30px);
          justify-content: center;
        }

        .card:hover {
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.10);
        }

        .background-blur-balls {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: 100%;
          height: 100%;
          z-index: -10;
          border-radius: 1.2rem;
          transition: all 0.3s ease;
          background-color: transparent; /* remove white haze that muddies colors */
          overflow: hidden;
        }

        .balls {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          animation: rotate-background-balls 10s linear infinite;
        }

        .container-wrap:hover .balls {
          animation-play-state: paused;
        }

        .background-blur-balls .ball {
          width: 1.6rem;
          height: 1.6rem;
          position: absolute;
          border-radius: 50%;
          filter: blur(18px);
        }

        .background-blur-balls .ball.violet {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: #F08336; /* Lumina Orange */
        }

        .background-blur-balls .ball.green {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: #D4AF37; /* Lumina Gold */
        }

        .background-blur-balls .ball.rosa {
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          background-color: #FFB86B; /* Warm Orange */
        }

        .background-blur-balls .ball.cyan {
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          background-color: #FFC98D; /* Soft Amber */
        }

        .content-card {
          width: 3.0rem;
          height: 3.0rem;
          display: flex;
          border-radius: 1.2rem;
          transition: all 0.3s ease;
          overflow: hidden;
          background-image: linear-gradient(135deg, #F08336 0%, #D4AF37 60%, #F9B572 100%);
          box-shadow: 0 6px 14px rgba(240, 131, 54, 0.20), 0 2px 6px rgba(212, 175, 55, 0.18);
        }

        .background-blur-card { width: 100%; height: 100%; background: transparent; backdrop-filter: none; }

        .eyes {
          position: absolute;
          left: 50%;
          bottom: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 16px;
          gap: 0.7rem;
          transition: all 0.3s ease;
        }

        .eyes .eye {
          width: 8px;
          height: 16px;
          background-color: #fff;
          border-radius: 10px;
          animation: animate-eyes 10s infinite linear;
          transition: all 0.3s ease;
        }

        .eyes.happy {
          display: none;
          color: #fff;
          gap: 0;
        }

        .eyes.happy svg {
          width: 35px;
        }

        /* On hover show smiling (closed) eyes and hide open eyes */
        .container-wrap:hover .eyes .eye { display: none; }
        .container-wrap:hover .eyes.happy { display: flex; }

        .eyes.happy { gap: 0.5rem; align-items: center; justify-content: center; }
        .eyes.happy .eye-arc { width: 18px; height: 8px; }

        .container-ai-chat {
          position: fixed;
          bottom: 120px;
          right: 24px;
          /* Slightly larger than before; still safe on mobile. */
          width: min(420px, calc(100vw - 24px));
          height: min(560px, calc(100vh - 160px));
          padding: 0;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 10000;
          transition: all 0.3s ease;
        }

        .container-ai-chat.open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        /* Suggestions "cap" that sits OUTSIDE the panel (like a hat) */
        .lumina-aiCap {
          position: absolute;
          /* Lift it higher so it doesn't overlap panel content */
          top: -56px;
          left: 12px;
          right: 52px; /* keep space for the close button */
          z-index: 10001;
          /* Match the reference: tabs floating above, no big rounded container */
          padding: 0;
          border-radius: 0;
          background: transparent;
          border: none;
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
          box-shadow: none;
          overflow: visible;
          pointer-events: auto;
        }
        .lumina-aiCap .chat-marquee {
          margin: 0;
        }
        /* Cap-style suggestions: "tabs" row (static, horizontal scroll) */
        .lumina-aiCap .chat-marquee {
          width: 100%;
          /* restore marquee behavior */
          overflow: hidden;
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 1) 18%,
            rgba(0, 0, 0, 1) 82%,
            rgba(0, 0, 0, 0)
          );
        }
        .lumina-aiCap .chat-marquee > ul {
          animation: scroll-marquee-left 30s linear infinite;
          justify-content: space-around;
          gap: 10px;
          padding: 0;
          margin: 0;
        }
        .lumina-aiCap .chat-marquee:hover > ul { animation-play-state: paused !important; }
        .lumina-aiCap .chat-marquee > ul[aria-hidden="true"] { display: flex; }
        .lumina-aiCap .chat-marquee > ul > li > button {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 12px;
          /* Match chat panel look: dark glass, not bright */
          background: rgba(17, 17, 17, 0.80);
          border: 1px solid rgba(31, 41, 55, 0.80); /* gray-800 */
          color: rgba(255, 255, 255, 0.86);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }
        .lumina-aiCap .chat-marquee > ul > li > button:hover {
          background: rgba(17, 17, 17, 0.88);
          border-color: rgba(240, 131, 54, 0.28); /* soft orange accent */
          color: rgba(255, 255, 255, 0.92);
        }

        html:not(.dark) .lumina-aiCap .chat-marquee > ul > li > button {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(229, 231, 235, 1); /* gray-200 */
          color: rgba(15, 23, 42, 0.80);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }
        html:not(.dark) .lumina-aiCap .chat-marquee > ul > li > button:hover {
          background: rgba(255, 255, 255, 0.96);
          border-color: rgba(240, 131, 54, 0.28);
          color: rgba(15, 23, 42, 0.92);
        }

        /* Voice mode should NOT render a big rectangle behind Orb */
        .container-ai-chat.voice-active {
          width: auto;
          height: auto;
          background: transparent !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Hybrid AI panel (Uiverse-inspired, flat CSS) */
        .lumina-aiPanel {
          /* Match site header tone (#111111) */
          --primary-color: #111111;
          --neutral-color: rgba(255, 255, 255, 0.86);
          --accent-color: #d4af37; /* Lumina gold */
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          border-radius: 14px; /* more rectangular */
          overflow: hidden;
          /* Header-like glass: dark + blur */
          background: rgba(17, 17, 17, 0.78);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(31, 41, 55, 0.80); /* gray-800 */
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45);
          position: relative;
        }

        /* Light theme (header is white) */
        html:not(.dark) .lumina-aiPanel {
          --primary-color: #ffffff;
          --neutral-color: rgba(15, 23, 42, 0.78);
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(243, 244, 246, 1); /* gray-100 */
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.12);
        }

        .lumina-aiPanel.voice-active {
          background: transparent !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
          overflow: visible;
          width: auto;
          height: auto;
        }

        /* Ensure inner containers don't paint a panel in voice mode (light/dark). */
        .container-ai-chat.voice-active .lumina-aiPanel__body {
          background: transparent !important;
        }

        /* floating close (no header bar) */
        .lumina-aiClose {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(31, 41, 55, 0.80); /* gray-800 */
          background: rgba(17, 17, 17, 0.30);
          color: rgba(255, 255, 255, 0.90);
          cursor: pointer;
          transition: transform 0.12s ease, background 0.12s ease;
          z-index: 2;
        }
        .lumina-aiClose:hover { transform: translateY(-1px); background: rgba(17, 17, 17, 0.42); }
        .lumina-aiClose:active { transform: scale(0.96); }

        html:not(.dark) .lumina-aiClose {
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(229, 231, 235, 1); /* gray-200 */
          color: rgba(15, 23, 42, 0.82);
        }
        html:not(.dark) .lumina-aiClose:hover { background: rgba(255, 255, 255, 0.92); }

        .lumina-aiPanel__body {
          position: relative;
          display: flex;
          flex: 1 1 auto;
          min-height: 0;
          flex-direction: column;
        }

        .lumina-aiPanel__messages {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          padding: 12px;
          /* Input is now in normal flow (not overlay), so no huge bottom padding needed. */
          padding-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: transparent;
        }

        .lumina-aiPanel__empty {
          margin: auto;
          text-align: center;
          color: rgba(255, 255, 255, 0.70);
          padding: 18px 12px;
          border: 1px dashed rgba(212, 175, 55, 0.20);
          border-radius: 14px;
          max-width: 320px;
        }
        .lumina-aiPanel__emptyTitle { font-weight: 700; color: rgba(255,255,255,0.88); margin-bottom: 6px; }
        .lumina-aiPanel__emptySub { font-size: 12px; }

        html:not(.dark) .lumina-aiPanel__empty {
          color: rgba(15, 23, 42, 0.70);
          border-color: rgba(229, 231, 235, 1);
        }
        html:not(.dark) .lumina-aiPanel__emptyTitle { color: rgba(15, 23, 42, 0.88); }
        html:not(.dark) .lumina-aiPanel__emptySub { color: rgba(15, 23, 42, 0.65); }

        /* Uiverse "AI-Input" (flat CSS, no nesting) */
        .AI-Input {
          --primary-color: #0f172a; /* Lumina deep navy */
          --neutral-color: rgba(255, 255, 255, 0.86);
          --accent-color: #d4af37; /* Lumina gold */
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          /* Keep input anchored at the bottom *without* overlapping messages. */
          position: relative;
          left: auto;
          bottom: auto;
          transform: none;
          width: calc(100% - 24px);
          max-width: 40em;
          user-select: none;
          margin: 8px auto 12px auto;
          z-index: 1;
        }

        .chat-marquee {
          --gap: 1em;
          display: flex;
          gap: var(--gap);
          /* Default (when used elsewhere); cap overrides to margin:0 */
          margin: 10px 12px 0 12px;
          width: 100%;
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 1) 20%,
            rgba(0, 0, 0, 1) 80%,
            rgba(0, 0, 0, 0)
          );
          overflow: hidden;
          transition: all 0.2s ease-in-out;
        }
        .chat-marquee > ul {
          display: flex;
          gap: var(--gap);
          flex-shrink: 0;
          justify-content: space-around;
          list-style: none;
          animation: scroll-marquee-left 30s linear infinite;
          padding: 0;
          margin: 0;
        }
        .chat-marquee:hover > ul { animation-play-state: paused !important; }
        .chat-marquee > ul > li { display: flex; }
        .chat-marquee > ul > li > button {
          padding: 0.5rem 1rem;
          background-color: rgba(17, 17, 17, 0.86);
          border: 1px solid rgba(31, 41, 55, 0.80); /* gray-800 */
          border-radius: 10px;
          color: var(--neutral-color);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease-in-out, transform 0.1s ease-in-out;
          white-space: nowrap;
        }
        .chat-marquee > ul > li > button:hover {
          background-color: rgba(255, 255, 255, 0.06);
          border-color: rgba(212, 175, 55, 0.28); /* subtle gold on hover */
          color: rgba(255, 255, 255, 0.92);
        }
        .chat-marquee > ul > li > button:active { transform: scale(0.98); }

        @keyframes scroll-marquee-left {
          to {
            transform: translateX(calc(-100% - var(--gap)));
          }
        }

        .chat-container {
          position: relative;
          width: 100%;
          background: rgba(17, 17, 17, 0.92);
          border: 1px solid rgba(31, 41, 55, 0.80); /* gray-800 */
          border-radius: 18px; /* closer to reference */
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.3, 1.5, 0.6, 1);
        }
        /* Subtle header-button orange accent when user is typing */
        .chat-container:focus-within {
          border-color: rgba(240, 131, 54, 0.45); /* #F08336, softened */
          box-shadow: 0 0 0 3px rgba(240, 131, 54, 0.10);
        }
        .chat-container::before {
          content: "";
          position: absolute;
          top: -9rem;
          left: -6rem;
          width: 15rem;
          height: 15rem;
          background: radial-gradient(
            circle,
            rgba(212, 175, 55, 0.55) 0%,
            rgba(212, 175, 55, 0.12) 22%,
            rgba(17, 17, 17, 0.92) 70%
          );
          filter: blur(10px);
          border-radius: 50%;
          z-index: 0;
          transition: all 1s cubic-bezier(0.3, 1.5, 0.6, 1);
        }
        .chat-container:focus-within::before {
          top: -6rem;
          left: 50%;
          filter: blur(50px);
        }

        .chat-wrapper {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          padding: 0.95rem;
          transition: all 0.2s ease-in-out;
        }

        #chat-input {
          padding: 0.6rem;
          width: 100%;
          min-height: 3rem;
          max-height: 10rem;
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          line-height: 1.5;
          outline: none;
          resize: none;
        }
        #chat-input::placeholder { color: var(--neutral-color); }

        html:not(.dark) .chat-container {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(243, 244, 246, 1); /* gray-100 */
        }
        html:not(.dark) .chat-container::before {
          /* Remove the dark "smudge" on light theme */
          background: radial-gradient(
            circle,
            rgba(240, 131, 54, 0.22) 0%,
            rgba(240, 131, 54, 0.08) 28%,
            rgba(255, 255, 255, 0.92) 72%
          );
          filter: blur(14px);
        }
        html:not(.dark) .chat-container:focus-within::before {
          filter: blur(40px);
        }
        html:not(.dark) #chat-input {
          color: rgba(15, 23, 42, 0.92);
        }
        html:not(.dark) #chat-input::placeholder {
          color: rgba(15, 23, 42, 0.50);
        }

        .button-bar {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          width: 100%;
        }

        .left-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .right-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .left-buttons > button,
        .right-buttons > button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 1px solid rgba(212, 175, 55, 0.16);
          border-radius: 50%;
          cursor: pointer;
          background: rgba(212, 175, 55, 0.06);
          color: rgba(255, 255, 255, 0.92);
          transition: all 0.2s ease-in-out, transform 0.1s ease-in-out;
        }
        html:not(.dark) .right-buttons > button {
          border: 1px solid rgba(229, 231, 235, 1); /* gray-200 */
          background: rgba(240, 131, 54, 0.10); /* soft orange */
          color: rgba(15, 23, 42, 0.75);
        }
        html:not(.dark) .right-buttons > button:hover {
          box-shadow: 0.2rem 0.2rem 0.5rem 0.2rem rgba(15, 23, 42, 0.10);
        }

        /* Left buttons match site primary CTA (orange). */
        .left-buttons > button {
          border: 1px solid rgba(240, 131, 54, 0.22);
          background: #F08336;
          color: #ffffff;
        }
        .left-buttons > button:hover {
          background: #e0743a;
        }

        /* Mic button matches site primary CTA (orange). */
        .right-buttons > button:first-child {
          border: 1px solid rgba(240, 131, 54, 0.22);
          background: #F08336;
          color: #ffffff;
        }
        .right-buttons > button:first-child:hover {
          background: #e0743a;
        }
        .left-buttons > button:hover,
        .right-buttons > button:hover {
          box-shadow: 0.2rem 0.2rem 0.5rem 0.2rem rgba(0, 0, 0, 0.2);
          transform: translateY(-10%) scale(1.03);
        }
        .left-buttons > button:active,
        .right-buttons > button:active { transform: scale(0.95); }
        .right-buttons > button:disabled { opacity: 0.35; cursor: not-allowed; }

        .lumina-aiVoiceFloating {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 10px;
        }

        .lumina-aiVoiceFloating__orb {
          width: 90px;
          height: 90px;
          border-radius: 9999px;
          overflow: hidden;
        }

        .lumina-aiVoiceFloating__controls {
          display: flex;
          gap: 14px;
          align-items: center;
          justify-content: center;
        }

        .lumina-aiVoiceFloating__btn {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          border: 1px solid rgba(212, 175, 55, 0.22);
          background: rgba(15, 23, 42, 0.35);
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .lumina-aiVoiceFloating__btn:hover {
          transform: translateY(-1px);
          background: rgba(15, 23, 42, 0.45);
        }
        .lumina-aiVoiceFloating__btn:active { transform: scale(0.96); }

        .chat {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          border-radius: 15px;
          width: 100%;
          height: 100%;
          padding: 4px;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.92);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          position: relative; /* for center visualizer */
        }

        @supports ((-webkit-backdrop-filter: blur(6px)) or (backdrop-filter: blur(6px))) {
          .chat {
            background-color: rgba(255, 255, 255, 0.70);
            -webkit-backdrop-filter: blur(8px) saturate(120%);
            backdrop-filter: blur(8px) saturate(120%);
            border: 1px solid rgba(255, 255, 255, 0.35);
          }
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px 8px 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .chat-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #999;
        }

        .close-button:hover {
          background-color: #f5f5f5;
          color: #666;
        }

        .chat-bot {
          position: relative;
          display: flex;
          height: 100%;
          transition: all 0.3s ease;
        }

        .chat-bot textarea {
          background-color: transparent;
          border-radius: 16px;
          border: none;
          width: 100%;
          height: 100%;
          color: #8b8b8b;
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 400;
          padding: 10px;
          resize: none;
          outline: none;
        }

        .chat-bot textarea::-webkit-scrollbar {
          width: 6px;
          height: 10px;
        }

        .chat-bot textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-bot textarea::-webkit-scrollbar-thumb {
          background: #dedfe0;
          border-radius: 5px;
        }

        .chat-bot textarea::-webkit-scrollbar-thumb:hover {
          background: #8b8b8b;
          cursor: pointer;
        }

        .chat-bot textarea::placeholder {
          color: #dedfe0;
          transition: all 0.3s ease;
        }

        .chat-bot textarea:focus::placeholder {
          color: #8b8b8b;
        }

        .options {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 10px;
        }

        .options button {
          transition: all 0.3s ease;
        }

        .btns-add {
          display: flex;
          gap: 8px;
        }

        .btns-add button {
          display: flex;
          color: rgba(0, 0, 0, 0.1);
          background-color: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btns-add button:hover {
          transform: translateY(-5px);
          color: #8b8b8b;
        }

        /* Voice mic visual (compact adaptation of Uiverse.io by Spacious74) */
        .voice-mic {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(-135deg, #ce11e7, #031cfddc);
          border: 2px solid #ffffff;
          box-shadow: inset 0 0 18px 8px #ffffff, 0 0 12px 6px #ffffff;
          overflow: visible;
        }

        .voice-mic .echo { position: absolute; inset: 0; pointer-events: none; }

        .voice-mic .echo span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0px;
          height: 0px;
          opacity: 1;
          border-radius: 50%;
          border: 2px #ffffff solid;
          animation: voice-echo 2.5s ease infinite;
        }

        .voice-mic .echo span:nth-of-type(2) { animation-delay: 0.2s; }
        .voice-mic .echo span:nth-of-type(3) { animation-delay: 0.4s; }

        @keyframes voice-echo {
          0% { width: 0px; height: 0px; opacity: 0.9; }
          100% { width: 46px; height: 46px; opacity: 0; }
        }

        .voice-mic .mic {
          filter: drop-shadow(0 0 6px #ffffff);
          animation: voice-mic-rot 2.5s linear infinite;
        }

        @keyframes voice-mic-rot {
          0% { transform: rotateY(0deg); }
          50%, 60%, 70%, 80%, 90% { transform: rotateY(360deg); }
          100% { transform: rotateY(360deg); }
        }

        .btn-submit {
          display: flex;
          padding: 2px;
          background-image: linear-gradient(135deg, #F08336, #D4AF37, #F9B572);
          border-radius: 6px;
          box-shadow: inset 0 4px 2px -2px rgba(255, 255, 255, 0.5);
          cursor: pointer;
          border: none;
          outline: none;
          opacity: 0.7;
          transition: all 0.15s ease;
        }

        .btn-submit i {
          width: 20px;
          height: 20px;
          padding: 4px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          backdrop-filter: blur(3px);
          color: #cfcfcf;
        }

        .btn-submit svg {
          transition: all 0.3s ease;
          width: 16px;
          height: 16px;
        }

        .btn-submit:hover {
          opacity: 1;
        }

        .btn-submit:hover svg {
          color: #f3f6fd;
          filter: drop-shadow(0 0 5px #ffffff);
        }

        .btn-submit:focus svg {
          color: #f3f6fd;
          filter: drop-shadow(0 0 5px #ffffff);
          transform: scale(1.2) rotate(45deg) translateX(-2px) translateY(1px);
        }

        .btn-submit:active {
          transform: scale(0.92);
        }

        .area {
          position: absolute;
          width: 20%;
          height: 33.33%;
          z-index: 2;
          pointer-events: auto; /* allow hover targeting for tilt effect */
        }

        .area:nth-child(1) { top: 0; left: 0; }
        .area:nth-child(2) { top: 0; left: 20%; }
        .area:nth-child(3) { top: 0; left: 40%; }
        .area:nth-child(4) { top: 0; left: 60%; }
        .area:nth-child(5) { top: 0; left: 80%; }
        .area:nth-child(6) { top: 33.33%; left: 0; }
        .area:nth-child(7) { top: 33.33%; left: 20%; }
        .area:nth-child(8) { top: 33.33%; left: 40%; }
        .area:nth-child(9) { top: 33.33%; left: 60%; }
        .area:nth-child(10) { top: 33.33%; left: 80%; }
        .area:nth-child(11) { top: 66.66%; left: 0; }
        .area:nth-child(12) { top: 66.66%; left: 20%; }
        .area:nth-child(13) { top: 66.66%; left: 40%; }
        .area:nth-child(14) { top: 66.66%; left: 60%; }
        .area:nth-child(15) { top: 66.66%; left: 80%; }

        .area:nth-child(15):hover ~ .container-wrap .card,
        .area:nth-child(15):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(-15deg) rotateY(15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(14):hover ~ .container-wrap .card,
        .area:nth-child(14):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(-15deg) rotateY(7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(13):hover ~ .container-wrap .card,
        .area:nth-child(13):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(-15deg) rotateY(0) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(12):hover ~ .container-wrap .card,
        .area:nth-child(12):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(-15deg) rotateY(-7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(11):hover ~ .container-wrap .card,
        .area:nth-child(11):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(-15deg) rotateY(-15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(10):hover ~ .container-wrap .card,
        .area:nth-child(10):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(0) rotateY(15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(9):hover ~ .container-wrap .card,
        .area:nth-child(9):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(0) rotateY(7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(8):hover ~ .container-wrap .card,
        .area:nth-child(8):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(0) rotateY(0) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(7):hover ~ .container-wrap .card,
        .area:nth-child(7):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(0) rotateY(-7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(6):hover ~ .container-wrap .card,
        .area:nth-child(6):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(0) rotateY(-15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(5):hover ~ .container-wrap .card,
        .area:nth-child(5):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(15deg) rotateY(15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(4):hover ~ .container-wrap .card,
        .area:nth-child(4):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(15deg) rotateY(7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(3):hover ~ .container-wrap .card,
        .area:nth-child(3):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(15deg) rotateY(0) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(2):hover ~ .container-wrap .card,
        .area:nth-child(2):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(15deg) rotateY(-7deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(1):hover ~ .container-wrap .card,
        .area:nth-child(1):hover ~ .container-wrap .eyes .eye {
          transform: perspective(var(--perspective)) rotateX(15deg) rotateY(-15deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }

        .area:nth-child(15):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(15):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(-10deg) rotateY(8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(14):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(14):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(-10deg) rotateY(4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(13):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(13):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(-10deg) rotateY(0deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(12):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(12):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(-10deg) rotateY(-4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(11):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(11):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(-10deg) rotateY(-8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(10):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(10):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(0deg) rotateY(8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(9):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(9):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(0deg) rotateY(4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(8):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(8):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(0deg) rotateY(0deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(7):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(7):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(0deg) rotateY(-4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(6):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(6):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(0deg) rotateY(-8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(5):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(5):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(10deg) rotateY(8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(4):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(4):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(10deg) rotateY(4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(3):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(3):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(10deg) rotateY(0deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(2):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(2):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(10deg) rotateY(-4deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }
        .area:nth-child(1):hover ~ .container-wrap .card .container-ai-chat .chat .options button,
        .area:nth-child(1):hover ~ .container-wrap .card .container-ai-chat .chat .chat-bot {
          transform: perspective(var(--perspective)) rotateX(10deg) rotateY(-8deg) translateZ(var(--translateY)) scale3d(1, 1, 1);
        }

        @keyframes rotate-background-balls {
          from {
            transform: translateX(-50%) translateY(-50%) rotate(360deg);
          }
          to {
            transform: translateX(-50%) translateY(-50%) rotate(0);
          }
        }

        /* Center voice visualizer styles (blob morph + voice-reactive scale) */
        .voice-center-blobs {
          position: absolute;
          left: 50%;
          top: 52%;
          transform: translate(-50%, -50%);
          width: 240px;
          height: 240px;
          pointer-events: none;
          display: none;
          filter: drop-shadow(0 0 24px rgba(164, 196, 255, 0.35));
          z-index: 0;
        }
        .voice-center-blobs.on {
          display: block;
        }
        .voice-center-blobs .blobs {
          width: 100%;
          height: 100%;
          max-height: 100%;
          max-width: 100%;
        }
        .voice-center-blobs svg {
          position: relative;
          height: 100%;
          z-index: 2;
        }
        .voice-center-blobs .blob {
          animation: rotate 25s infinite alternate ease-in-out;
          transform-origin: 50% 50%;
          opacity: 0.75;
        }
        .voice-center-blobs .blob.alt {
          animation-direction: alternate-reverse;
          opacity: 0.35;
        }
        .voice-center-blobs .blob path {
          animation: blob-anim-1 5s infinite alternate cubic-bezier(0.45, 0.2, 0.55, 0.8);
          transform-origin: 50% 50%;
          transform: scale(0.8);
          transition: fill 800ms ease;
        }
        .voice-center-blobs .blob-1 path {
          fill: var(--blob-1, #bb74ff);
          filter: blur(16px);
        }
        .voice-center-blobs .blob-2 {
          animation-duration: 18s;
          animation-direction: alternate-reverse;
        }
        .voice-center-blobs .blob-2 path {
          fill: var(--blob-2, #7c7dff);
          animation-name: blob-anim-2;
          animation-duration: 7s;
          filter: blur(12px);
          transform: scale(0.78);
        }
        .voice-center-blobs .blob-3 {
          animation-duration: 23s;
        }
        .voice-center-blobs .blob-3 path {
          fill: var(--blob-3, #a0f8ff);
          animation-name: blob-anim-3;
          animation-duration: 6s;
          filter: blur(8px);
          transform: scale(0.76);
        }
        .voice-center-blobs .blob-4 {
          animation-duration: 31s;
          animation-direction: alternate-reverse;
          opacity: 0.9;
        }
        .voice-center-blobs .blob-4 path {
          fill: var(--blob-4, #ffffff);
          animation-name: blob-anim-4;
          animation-duration: 10s;
          filter: blur(120px);
          transform: scale(0.5);
        }
        @keyframes blob-anim-1 {
          0% {
            d: path('M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z');
          }
          30% {
            d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z');
          }
          70% {
            d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
          100% {
            d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z');
          }
        }
        @keyframes blob-anim-2 {
          0% {
            d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
          40% {
            d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z');
          }
          80% {
            d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z');
          }
          100% {
            d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
        }
        @keyframes blob-anim-3 {
          0% {
            d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z');
          }
          35% {
            d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z');
          }
          75% {
            d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
          100% {
            d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
        }
        @keyframes blob-anim-4 {
          0% {
            d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z');
          }
          30% {
          d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z');
          }
          70% {
            d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z');
          }
          100% {
            d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z');
          }
        }

        @keyframes animate-eyes {
          46% {
            height: 26px;
          }
          48% {
            height: 10px;
          }
          50% {
            height: 26px;
          }
          96% {
            height: 26px;
          }
          98% {
            height: 10px;
          }
          100% {
            height: 26px;
          }
        }

        /* (removed) top-left Orb overlay */
      `}</style>

      <ChatLauncherButton isOpen={isOpen} onToggle={handleToggle} buttonRef={buttonRef} />

      <HybridChatPanel
        isOpen={isOpen}
        panelRef={chatRef}
        onClose={() => setIsOpen(false)}
        messages={messages}
        value={message}
        onChange={setMessage}
        onSend={() => {
          try {
            ChatMessageSchema.parse({ message });
            appendUserMessage(message, 'text');
            try { window.sessionStorage.setItem('lumina_ai_autostart_mode', 'text'); } catch {}
            void maybeHandleNearbyFallback(message).then((result) => {
              if (result?.handled) {
                setMessage('');
                return;
              }
              void sendGeminiText(message).catch((err) => {
                console.error('Gemini live text send failed', err);
                appendAssistantDelta('\n\n[Error] Could not reach AI session. Please retry.');
              });
            });
            setMessage('');
          } catch (error) {
            console.error('Invalid message:', error);
          }
        }}
        isListening={isListening}
        isAiSpeaking={isAiSpeaking}
        isMuted={geminiMuted}
        onStartVoice={startVoice}
        onStopVoice={stopVoice}
        onToggleMute={toggleGeminiMute}
        orbAnalyser={geminiPlaybackAnalyser}
      />
    </>
  );
}
