'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropertyFunctionCallResult } from './usePropertySearch';
import { getVertexToken, type VertexToken } from '@/lib/vertexTokenClient';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'stopped' | 'error';

export interface UseGeminiLiveSessionOptions {
  enabled: boolean;
  isFunctionCallingEnabled?: boolean;
  handleFunctionCall?: (
    fnName: string,
    argsText: string,
    context?: { transport?: 'realtime' | 'websocket' },
  ) => PropertyFunctionCallResult;
  onTranscript?: (text: string) => void;
  onResponseText?: (text: string) => void;
  onError?: (message: string) => void;
}

export interface UseGeminiLiveSessionResult {
  isListening: boolean;
  isMuted: boolean;
  isAiSpeaking: boolean;
  playbackAnalyser: AnalyserNode | null;
  connectionState: ConnectionState;
  startVoice: () => Promise<void>;
  stopVoice: () => Promise<void>;
  toggleMute: () => void;
  sendText: (text: string) => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const toBase64 = (bytes: Uint8Array) =>
  typeof btoa !== 'undefined'
    ? btoa(String.fromCharCode(...bytes))
    : Buffer.from(bytes).toString('base64');

const pcm16ToFloat32 = (pcm: Int16Array) => {
  const float32 = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    float32[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
  }
  return float32;
};

type LuminaLanguage = 'ka' | 'en' | 'ru';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]/{}()*+?.\\\\^$|]/g, '\\\\$&')}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
};

const ensureCid = (): string => {
  if (typeof window === 'undefined') return 'cid';
  const sp = new URLSearchParams(window.location.search);
  let cid = sp.get('cid') || window.sessionStorage.getItem('lumina_cid') || '';
  if (!cid) {
    cid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  }
  try { window.sessionStorage.setItem('lumina_cid', cid); } catch {}
  // Keep cid in URL so snapshot emitters can find it
  try {
    if (!sp.get('cid')) {
      sp.set('cid', cid);
      const next = `${window.location.pathname}?${sp.toString()}${window.location.hash || ''}`;
      window.history.replaceState({}, '', next);
    }
  } catch {}
  return cid;
};

const buildSystemPrompt = (lang: LuminaLanguage, pageContext: { path: string; title: string }) => {
  const langLine =
    lang === 'en'
      ? 'Site language is English → reply in English.'
      : lang === 'ru'
        ? 'Язык сайта — русский → отвечай по-русски.'
        : 'საიტის ენა არის ქართული → უპასუხე ქართულად.';

  return [
    'შენ ხარ Lumina Estate-ის AI ასისტენტი Realtime რეჟიმში (Text + Voice + Tools).',
    'შენი ამოცანაა დაეხმარო მომხმარებელს უძრავი ქონების ძიებაში, ფილტრებში, შედარებაში და კონკრეტული განცხადების გახსნაში.',
    'შეგიძლია იმუშაო როგორც ტექსტით, ისე ხმით; ვებსაიტზე ქმედებები უნდა შესრულდეს მხოლოდ tools-ით.',
    '',
    langLine,
    '',
    'ვებსაიტზე ნებისმიერი ქმედება უნდა შესრულდეს მხოლოდ ხელმისაწვდომი ინსტრუმენტების (tools) მეშვეობით.',
    'არ გამოიგონო ბინები/კლიენტები/მონაცემები. თუ რამე არ იცი, თქვი და შესთავაზე სწორი შემდეგი ქმედება tool-ებით.',
    'ტონი: იყავი მოკლე, პროფესიონალური და თავაზიანი. არ გამოიყენო „ჰაჰა“, სლენგი, ირონია ან ემოჯი (თუ მომხმარებელმა პირდაპირ არ მოითხოვა).',
    '',
    'Off-topic პოლიტიკა:',
    '- თუ კითხვა/ფრაზა უძრავ ქონებას/საიტის ფუნქციებს არ ეხება → უპასუხე 1 მოკლე წინადადებით თავაზიანად და დაუბრუნდი თემას 1 მოკლე დამაზუსტებელი კითხვით (რაიონი/ბიუჯეტი/იყიდება vs ქირავდება).',
    '- არ გააგრძელო off-topic დიალოგი. ყოველთვის დააბრუნე საუბარი ქონების ძებნაზე/ფილტრებზე/შედარებაზე.',
    '- არასდროს დაწერო “ჰაჰა/хаха/haha” ან ხუმრობა ავტომატურად.',
    '',
    'კონტექსტი:',
    `- Page: ${pageContext.title}`,
    `- Path: ${pageContext.path}`,
    '',
    'ქმედებების წესები:',
    '- თუ მომხმარებელი ამბობს “იპოვე/აჩვენე/გაფილტრე” → ჯერ გამოიძახე search_properties ან set_filters. მიღებული toolResponse-იდან მოკლედ უთხარი რამდენია სულ (total_count) და ჩამოთვალე მხოლოდ results_preview (Top N).',
    '- თუ მომხმარებელი ამბობს “კიდევ მაჩვენე/შემდეგი” → გამოიძახე list_results offset/limit-ით და ისევ ჩამოთვალე results_preview.',
    '- თუ ამბობს “გახსენი პირველი/მეორე/…” → open_first_property / open_nth_result და მერე დაელოდე property_snapshot-ს.',
    '- თუ ამბობს “გადადით id …” → navigate_to_property.',
    '- თუ tool-call არ არის ხელმისაწვდომი ან ვერ შესრულდა → არ გამოიგონო შედეგი. თქვი ზუსტად რომ tool ვერ შესრულდა და შესთავაზე კონკრეტული ალტერნატივა (მაგ: სხვა ფილტრი ან ხელახლა ცდა).',
    '',
    'Snapshot პოლიტიკა:',
    '- ნავიგაციის შემდეგ დაელოდე page_snapshot/property_snapshot შეტყობინებას და აღწერე მხოლოდ იქიდან მიღებული ველებით.',
    '- property_snapshot-ის აღწერა იყოს მოკლე (1–3 წინადადება) და მხოლოდ: title, price, address, bedrooms, bathrooms, area, features.',
  ].join('\n');
};

export function useGeminiLiveSession({
  enabled,
  isFunctionCallingEnabled = false,
  handleFunctionCall,
  onTranscript,
  onResponseText,
  onError,
}: UseGeminiLiveSessionOptions): UseGeminiLiveSessionResult {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const wsRef = useRef<WebSocket | null>(null);
  const sessionTypeRef = useRef<'voice' | 'text' | null>(null);
  const allowAudioOutRef = useRef(false);
  const lastOutputTranscriptRef = useRef<string>('');
  // IMPORTANT: use separate AudioContexts for capture vs playback.
  // Mixing them causes sample-rate/timebase issues and "chipmunk/fast" playback.
  const captureAudioCtxRef = useRef<AudioContext | null>(null);
  const playbackAudioCtxRef = useRef<AudioContext | null>(null);
  const playbackNextTimeRef = useRef(0);
  const audioOutDebugOnceRef = useRef(false);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const [playbackAnalyser, setPlaybackAnalyser] = useState<AnalyserNode | null>(null);
  const speakingUntilRef = useRef<number>(0);
  const speakingTimerRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionReadyRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cidRef = useRef<string>('');
  const bcRef = useRef<BroadcastChannel | null>(null);
  const toolDebugOnceRef = useRef(false);
  const lastSnapshotKeyRef = useRef<string>('');

  const markAiSpeakingForMs = useCallback((ms: number) => {
    const until = Date.now() + ms;
    speakingUntilRef.current = Math.max(speakingUntilRef.current, until);
    setIsAiSpeaking(true);
    if (speakingTimerRef.current) window.clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      if (now >= speakingUntilRef.current) {
        setIsAiSpeaking(false);
      }
    }, ms);
  }, []);

  const stopPlaybackNow = useCallback(() => {
    // Stop any already-scheduled audio chunks immediately (barge-in).
    const sources = playbackSourcesRef.current;
    playbackSourcesRef.current = [];
    for (const s of sources) {
      try { s.onended = null; } catch {}
      try { s.stop(0); } catch {}
      try { s.disconnect(); } catch {}
    }
    const ctx = playbackAudioCtxRef.current;
    playbackNextTimeRef.current = ctx ? ctx.currentTime : 0;
    playbackAnalyserRef.current = null;
    setPlaybackAnalyser(null);
    speakingUntilRef.current = 0;
    if (speakingTimerRef.current) {
      window.clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    setIsAiSpeaking(false);
  }, []);

  const toolHandler = useMemo(() => {
    if (!isFunctionCallingEnabled) return null;
    if (!handleFunctionCall) return null;
    return handleFunctionCall;
  }, [handleFunctionCall, isFunctionCallingEnabled]);

  const closeAll = useCallback(async () => {
    setIsListening(false);
    setConnectionState('stopped');
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    sessionTypeRef.current = null;
    allowAudioOutRef.current = false;
    try { mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop()); } catch {}
    mediaStreamRef.current = null;
    try { processorRef.current?.disconnect(); } catch {}
    processorRef.current = null;
    try { captureAudioCtxRef.current?.close(); } catch {}
    captureAudioCtxRef.current = null;
    stopPlaybackNow();
    try { playbackAudioCtxRef.current?.close(); } catch {}
    playbackAudioCtxRef.current = null;
    playbackNextTimeRef.current = 0;
    playbackAnalyserRef.current = null;
    setPlaybackAnalyser(null);
    speakingUntilRef.current = 0;
    if (speakingTimerRef.current) {
      window.clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    setIsAiSpeaking(false);
    try { bcRef.current?.close(); } catch {}
    bcRef.current = null;
  }, [stopPlaybackNow]);

  useEffect(() => {
    return () => { void closeAll(); };
  }, [closeAll]);

  const stopVoice = useCallback(async () => {
    await closeAll();
  }, [closeAll]);

  const toggleMute = useCallback(() => {
    const track = mediaStreamRef.current?.getAudioTracks?.()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  }, []);

  const handleAudioOut = useCallback(async (base64Audio: string, sampleRate: number) => {
    try {
      const bytes = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0));
      const pcm = new Int16Array(bytes.buffer);
      const float32 = pcm16ToFloat32(pcm);
      const ctx = playbackAudioCtxRef.current ?? new AudioContext();
      playbackAudioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const buffer = ctx.createBuffer(1, float32.length, sampleRate);
      buffer.copyToChannel(float32, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Route playback through an analyser so UI can visualize Gemini speech.
      let analyser = playbackAnalyserRef.current;
      if (!analyser) {
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        analyser.connect(ctx.destination);
        playbackAnalyserRef.current = analyser;
        setPlaybackAnalyser(analyser);
      }
      source.connect(analyser);
      playbackSourcesRef.current.push(source);
      source.onended = () => {
        const arr = playbackSourcesRef.current;
        const idx = arr.indexOf(source);
        if (idx >= 0) arr.splice(idx, 1);
        // If nothing is queued/playing anymore, drop speaking state quickly.
        if (arr.length === 0) {
          speakingUntilRef.current = 0;
          if (speakingTimerRef.current) {
            window.clearTimeout(speakingTimerRef.current);
            speakingTimerRef.current = null;
          }
          setIsAiSpeaking(false);
        }
      };
      // Queue chunks to avoid overlap (overlap sounds "fast/garbled")
      const now = ctx.currentTime;
      const startAt = Math.max(playbackNextTimeRef.current, now + 0.01);
      source.start(startAt);
      playbackNextTimeRef.current = startAt + buffer.duration;

      // Consider AI speaking while queued playback is active.
      const queuedMs = Math.max(0, (playbackNextTimeRef.current - now) * 1000);
      markAiSpeakingForMs(Math.ceil(queuedMs) + 80);
    } catch (error) {
      console.error('[Gemini] audio playback failed', error);
    }
  }, [markAiSpeakingForMs]);

  const startVoice = useCallback(async () => {
    if (!enabled) return;
    if (wsRef.current) {
      if (sessionTypeRef.current === 'voice') return;
      // If a text session is open, restart in voice mode (Live API allows one response modality).
      await closeAll();
    }
    sessionTypeRef.current = 'voice';
    setConnectionState('connecting');
    setIsListening(false);
    setIsMuted(false);
    sessionReadyRef.current = false;

    try {
      cidRef.current = ensureCid();
      // Prefer local proxy in development because browsers can't attach
      // Authorization headers to WebSocket upgrades.
      const proxyBaseEnv = (process.env.NEXT_PUBLIC_GEMINI_LIVE_PROXY_URL || '').trim();
      const proxyModel = (process.env.NEXT_PUBLIC_GEMINI_LIVE_PROXY_MODEL || '').trim();
      const useProxy = (process.env.NEXT_PUBLIC_GEMINI_LIVE_USE_PROXY || '').trim() === '1';

      let wsUrl: string;
      let token: VertexToken | null = null;

      const defaultProxyBase = (() => {
        // Only used when explicitly enabled (NEXT_PUBLIC_GEMINI_LIVE_USE_PROXY=1)
        // or NEXT_PUBLIC_GEMINI_LIVE_PROXY_URL is set.
        if (process.env.NODE_ENV !== 'development') return '';
        if (typeof window === 'undefined') return 'ws://localhost:3001';
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname || 'localhost';
        return `${proto}://${host}:3001`;
      })();

      // IMPORTANT: Do NOT default to the proxy unless explicitly enabled.
      // If port 3001 isn't running, the WS connection will fail immediately.
      const proxyBase = proxyBaseEnv || (useProxy ? defaultProxyBase : '');

      if (proxyBase) {
        const model = proxyModel || 'gemini-live-2.5-flash-native-audio';
        const sep = proxyBase.includes('?') ? '&' : '?';
        wsUrl = `${proxyBase}${sep}model=${encodeURIComponent(model)}`;
        console.log('[Gemini] connecting via local proxy', { proxyBase, model });
      } else {
        token = await getVertexToken();
        // Direct browser WebSocket may fail in some environments; proxy is recommended.
        wsUrl = `wss://${token.region}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent?access_token=${encodeURIComponent(token.accessToken)}`;
        console.log('[Gemini] connecting via Vertex AI', {
          region: token.region,
          projectId: token.projectId,
          model: token.model,
        });
      }
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = 'arraybuffer';

      ws.onopen = async () => {
        setConnectionState('connected');
        allowAudioOutRef.current = true;
        lastOutputTranscriptRef.current = '';
        const langCookie = (getCookieValue('lumina_language') || '').toLowerCase();
        const lang: LuminaLanguage = (langCookie === 'en' || langCookie === 'ru' ? (langCookie as LuminaLanguage) : 'ka');
        const pageContext = {
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          title: typeof document !== 'undefined' ? document.title : 'Lumina Estate',
        };
        const systemPrompt = buildSystemPrompt(lang, pageContext);

        // Setup message
        // Note: Vertex Live API WebSocket examples use snake_case fields and
        // lowercase modalities ("audio", "text").
        const setupPayload = {
          setup: {
            // When connected via proxy, the proxy will inject the server-side model
            // if model is omitted.
            model: token
              ? `projects/${token.projectId}/locations/${token.region}/publishers/google/models/${token.model}`
              : undefined,
            generation_config: {
              // Live API allows only ONE response modality in setup.
              // Use AUDIO and enable transcriptions if you want text alongside audio.
              response_modalities: ['audio'],
            },
            // Enable transcriptions so we can show text while response modality is AUDIO.
            input_audio_transcription: {},
            output_audio_transcription: {},
            // System prompt (language + site context)
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            // Realtime input behavior (VAD + barge-in)
            realtime_input_config: {
              // Ensure speaking interrupts the model (OpenAI-like barge-in).
              activity_handling: 'START_OF_ACTIVITY_INTERRUPTS',
            },
            // Tools (function calling)
            ...(toolHandler
              ? {
                  tools: [
                    {
                      function_declarations: [
                        {
                          name: 'search_properties',
                          description:
                            'Search properties with filters; navigate to /properties with the filters applied.',
                          parameters: {
                            type: 'object',
                            properties: {
                              query: { type: 'string' },
                              district: { type: 'string' },
                              min_price: { type: 'number' },
                              max_price: { type: 'number' },
                              bedrooms: { type: 'number' },
                              bathrooms: { type: 'number' },
                              status: { type: 'string', enum: ['for-sale', 'for-rent'] },
                              property_type: {
                                type: 'string',
                                enum: ['apartment', 'house', 'villa', 'studio', 'penthouse'],
                              },
                              min_sqft: { type: 'number' },
                              max_sqft: { type: 'number' },
                              is_new: { type: 'boolean' },
                              limit: { type: 'number' },
                              sort_by: { type: 'string', enum: ['price_asc', 'price_desc', 'newest'] },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'set_filters',
                          description: 'Update property list filters and navigate to listing page.',
                          parameters: {
                            type: 'object',
                            properties: {
                              q: { type: 'string' },
                              district: { type: 'string' },
                              priceMin: { type: 'number' },
                              priceMax: { type: 'number' },
                              rooms: { type: 'number' },
                              status: { type: 'string', enum: ['for-sale', 'for-rent'] },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_first_property',
                          description: 'Open the first property from last search results.',
                          parameters: {
                            type: 'object',
                            properties: {
                              new_tab: { type: 'boolean', default: false },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_nth_result',
                          description: 'Open the Nth property from the last search results. Index is 1-based.',
                          parameters: {
                            type: 'object',
                            properties: {
                              index: { type: 'number' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['index'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'navigate_to_property',
                          description: 'Navigate to a specific property details page by id.',
                          parameters: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['id'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_page',
                          description: 'Open an arbitrary page path in this app (e.g. /properties).',
                          parameters: {
                            type: 'object',
                            properties: {
                              path: { type: 'string' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['path'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'list_results',
                          description:
                            'List more properties from the last search results (pagination). Returns a preview slice only.',
                          parameters: {
                            type: 'object',
                            properties: {
                              offset: { type: 'number' },
                              limit: { type: 'number' },
                            },
                            additionalProperties: false,
                          },
                        },
                      ],
                    },
                  ],
                }
              : {}),
          },
        };
        // Do not log setup payload (may contain system instructions).
        ws.send(JSON.stringify(setupPayload));

        // Listen for page/property snapshots and stream them into the session
        try {
          const cid = cidRef.current;
          if (cid && typeof BroadcastChannel !== 'undefined') {
            const ch = new BroadcastChannel(`lumina-ai-${cid}`);
            bcRef.current = ch;
            ch.onmessage = (ev) => {
              try {
                const payload = ev.data;
                if (!payload || typeof payload !== 'object') return;
                // Provide snapshot context as client content
                if (ws.readyState !== WebSocket.OPEN) return;
                // Avoid sending identical snapshots repeatedly (prevents repeated answers).
                const snapshotKey = (() => {
                  try {
                    const p: any = payload as any;
                    // Prefer stable keys if present
                    if (p?.type && p?.id) return `${String(p.type)}:${String(p.id)}`;
                    return JSON.stringify(payload);
                  } catch {
                    return String(Date.now());
                  }
                })();
                if (snapshotKey && snapshotKey === lastSnapshotKeyRef.current) return;
                lastSnapshotKeyRef.current = snapshotKey;
                // Live API prefers snake_case fields.
                ws.send(
                  JSON.stringify({
                    client_content: {
                      turns: [
                        {
                          role: 'user',
                          parts: [{ text: JSON.stringify(payload) }],
                        },
                      ],
                      // IMPORTANT: snapshots are context updates.
                      // If we mark them as a completed user turn, the model may answer again.
                      turn_complete: false,
                    },
                  }),
                );
              } catch {}
            };
          }
        } catch {}

        // Audio capture
        let stream: MediaStream;
        try {
          const strictConstraints = {
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            } as MediaTrackConstraints,
          };
          try {
            stream = await navigator.mediaDevices.getUserMedia(strictConstraints);
          } catch (err: any) {
            const name = String(err?.name || '');
            // Windows/Chrome can throw NotFoundError when no default mic exists
            // or when constraints can't be satisfied. Retry with relaxed constraints.
            if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError') {
              let audioInputCount = 0;
              try {
                const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
                const audioInputs = Array.isArray(devices)
                  ? devices.filter((d) => d?.kind === 'audioinput')
                  : [];
                audioInputCount = audioInputs.length;
                console.warn('[Gemini] mic strict constraints failed, retrying with audio:true', {
                  name,
                  audioInputCount,
                });
              } catch {}
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } else {
              throw err;
            }
          }
        } catch (err) {
          console.error('[Gemini] microphone permission denied or unavailable', err);
          try {
            const name = String((err as any)?.name || '');
            if (name === 'NotFoundError') {
              onError?.(
                'No microphone detected (0 input devices). Check Windows Sound → Input and Windows Privacy → Microphone access, then reload.',
              );
            } else if (name === 'NotAllowedError' || name === 'SecurityError') {
              onError?.('Microphone permission is blocked. Allow mic access in the browser/site settings and retry.');
            } else {
              onError?.('Microphone is unavailable. Check your input device and permissions, then retry.');
            }
          } catch {}
          setConnectionState('error');
          try { ws.close(1000, 'mic unavailable'); } catch {}
          return;
        }
        mediaStreamRef.current = stream;
        const ctx = new AudioContext({ sampleRate: 16000 });
        captureAudioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          // Don't stream audio until the server acknowledges setup.
          if (!sessionReadyRef.current) return;
          const input = event.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          const b64 = toBase64(new Uint8Array(pcm16.buffer));
          try {
            ws.send(JSON.stringify({
              realtime_input: {
                media_chunks: [
                  {
                    mime_type: 'audio/pcm',
                    data: b64,
                  },
                ],
              },
            }));
          } catch {
            // ignore send errors
          }
        };
        source.connect(processor);
        // Avoid playing mic audio back to speakers (echo), but keep node alive.
        const zeroGain = ctx.createGain();
        zeroGain.gain.value = 0;
        processor.connect(zeroGain);
        zeroGain.connect(ctx.destination);
        setIsListening(true);
      };

      ws.onmessage = (event) => {
        try {
          // Some servers/proxies may deliver JSON frames as ArrayBuffer/Blob.
          const raw = event.data;
          let text: string | null = null;
          if (typeof raw === 'string') {
            text = raw;
          } else if (raw instanceof ArrayBuffer) {
            text = new TextDecoder('utf-8').decode(new Uint8Array(raw));
          } else if (raw instanceof Blob) {
            // Blob -> async, so punt to a separate async parse
            void raw.text().then((t) => {
              try {
                const data = JSON.parse(t);
                // Any valid server message indicates the session is ready
                sessionReadyRef.current = true;
                // If the server signals interruption, stop any queued playback immediately.
                const interrupted =
                  Boolean((data as any)?.serverContent?.interrupted) ||
                  Boolean((data as any)?.server_content?.interrupted);
                if (interrupted) stopPlaybackNow();
                const outTr =
                  (data as any)?.serverContent?.outputTranscription?.text ??
                  (data as any)?.server_content?.output_transcription?.text;
                if (typeof outTr === 'string' && outTr.length) {
                  const prev = lastOutputTranscriptRef.current;
                  const delta = outTr.startsWith(prev) ? outTr.slice(prev.length) : outTr;
                  lastOutputTranscriptRef.current = outTr;
                  if (delta) onResponseText?.(delta);
                }
                const parts = data?.serverContent?.modelTurn?.parts || [];
                for (const part of parts) {
                  if (allowAudioOutRef.current && part?.inlineData?.mimeType?.includes('audio/pcm')) {
                    const mt = String(part.inlineData.mimeType || '');
                    const m = /rate=(\d+)/.exec(mt);
                    const rate = m ? Number(m[1]) : 24000;
                    void handleAudioOut(part.inlineData.data, rate);
                  }
                  if (part?.text) onResponseText?.(part.text);
                }
                const inTr = data?.inputTranscription?.text;
                if (inTr) onTranscript?.(inTr);
              } catch (e) {
                console.error('[Gemini] message parse error', e);
              }
            });
            return;
          } else {
            text = String(raw);
          }

          if (!text) return;
          const data = JSON.parse(text);
          // Any valid server message indicates the session is ready
          sessionReadyRef.current = true;

          // If the server signals interruption, stop any queued playback immediately.
          const interrupted =
            Boolean((data as any)?.serverContent?.interrupted) ||
            Boolean((data as any)?.server_content?.interrupted);
          if (interrupted) stopPlaybackNow();

          const outTr =
            (data as any)?.serverContent?.outputTranscription?.text ??
            (data as any)?.server_content?.output_transcription?.text;
          if (typeof outTr === 'string' && outTr.length) {
            const prev = lastOutputTranscriptRef.current;
            const delta = outTr.startsWith(prev) ? outTr.slice(prev.length) : outTr;
            lastOutputTranscriptRef.current = outTr;
            if (delta) onResponseText?.(delta);
          }

          // Tool calling (if enabled)
          if (toolHandler) {
            // Different transports/SDKs may wrap tool calls differently.
            const toolCall =
              (data?.toolCall ||
                data?.tool_call ||
                data?.toolCalls ||
                data?.tool_calls ||
                data?.serverContent?.toolCall ||
                data?.serverContent?.tool_call ||
                data?.server_content?.tool_call ||
                data?.server_content?.toolCall) as any;
            const fnCalls =
              toolCall?.functionCalls ||
              toolCall?.function_calls ||
              toolCall?.functionCalls?.calls ||
              toolCall?.function_calls?.calls ||
              toolCall?.calls;
            if (Array.isArray(fnCalls) && fnCalls.length) {
              if (!toolDebugOnceRef.current) {
                toolDebugOnceRef.current = true;
                try {
                  console.log('[Gemini] tool call received', {
                    calls: fnCalls.map((c: any) => ({
                      id: c?.id || c?.callId || c?.call_id,
                      name: c?.name || c?.functionName || c?.function_name,
                    })),
                  });
                } catch {}
              }
              for (const call of fnCalls) {
                const id = String(call?.id || call?.callId || call?.call_id || '');
                const name = String(call?.name || call?.functionName || call?.function_name || '');
                const args = call?.args ?? call?.arguments ?? call?.argsText ?? call?.args_text ?? '{}';
                const argsText = typeof args === 'string' ? args : JSON.stringify(args);
                if (!name) continue;
                const res = toolHandler(name, argsText, { transport: 'realtime' });
                if (!res?.handled) continue;
                try {
                  // Vertex/Gemini Live API prefers snake_case message fields.
                  // If we send camelCase here, the server may ignore tool outputs.
                  const toolResponseSnake = {
                    tool_response: {
                      function_responses: [
                        {
                          ...(id ? { id } : {}),
                          name,
                          response: res.payload || { ok: true },
                        },
                      ],
                    },
                  };
                  if (!toolDebugOnceRef.current) {
                    // If somehow first log didn't run, ensure at least one response log.
                    toolDebugOnceRef.current = true;
                  }
                  try {
                    console.log('[Gemini] tool response sent', {
                      id: id || undefined,
                      name,
                      // Avoid logging huge payloads; just keys.
                      responseKeys: res.payload ? Object.keys(res.payload) : ['ok'],
                    });
                  } catch {}
                  ws.send(
                    // IMPORTANT: tool response message_type is a oneof.
                    // Do NOT include multiple variants (camelCase + snake_case) in one message,
                    // otherwise the server will close with 1007 "oneof already set".
                    JSON.stringify(toolResponseSnake),
                  );
                } catch {}
              }
              return;
            }
          }

          const parts = data?.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            if (allowAudioOutRef.current && part?.inlineData?.mimeType?.includes('audio/pcm')) {
              const mt = String(part.inlineData.mimeType || '');
              const m = /rate=(\d+)/.exec(mt);
              const rate = m ? Number(m[1]) : 24000;
              if (!audioOutDebugOnceRef.current) {
                audioOutDebugOnceRef.current = true;
                console.log('[Gemini] audio out format', { mimeType: mt, parsedRate: rate });
              }
              void handleAudioOut(part.inlineData.data, rate);
            }
            if (part?.text) {
              onResponseText?.(part.text);
            }
          }
          const inTr = data?.inputTranscription?.text;
          if (inTr) onTranscript?.(inTr);
          const done =
            data?.serverContent?.generationComplete ||
            data?.serverContent?.turnComplete ||
            data?.server_content?.generation_complete ||
            data?.server_content?.turn_complete;
          if (done) {
            // keep session alive; optional
          }
        } catch (error) {
          console.error('[Gemini] message parse error', error);
        }
      };

      ws.onerror = (err) => {
        // WebSocket "error" events are not very descriptive in browsers (often prints as {}).
        // Log URL + readyState so we can tell if this is a proxy/port issue vs auth issue.
        let errType: string | undefined;
        try { errType = (err as any)?.type; } catch {}
        console.error('[Gemini] websocket error', {
          type: errType,
          url: ws.url,
          readyState: ws.readyState,
        });
        try { onError?.('Voice connection error. Please retry.'); } catch {}
        setConnectionState('error');
        // Allow immediate retry if the socket gets stuck in a bad state.
        try { if (wsRef.current === ws) wsRef.current = null; } catch {}
        try { ws.close(); } catch {}
      };
      ws.onclose = (evt) => {
        console.warn('[Gemini] websocket closed', {
          code: evt.code,
          reason: evt.reason,
          wasClean: evt.wasClean,
          readyState: ws.readyState,
        });
        // Allow re-connecting after a close (without requiring page refresh)
        if (wsRef.current === ws) wsRef.current = null;
        allowAudioOutRef.current = false;
        sessionReadyRef.current = false;
        stopPlaybackNow();
        try { bcRef.current?.close(); } catch {}
        bcRef.current = null;
        // Stop mic processing when socket closes
        try { processorRef.current?.disconnect(); } catch {}
        processorRef.current = null;
        try { mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop()); } catch {}
        mediaStreamRef.current = null;
        setIsListening(false);
        setConnectionState('stopped');
      };
    } catch (error) {
      console.error('[Gemini] start failed', error);
      await closeAll();
      setConnectionState('error');
    }
  }, [closeAll, enabled, handleAudioOut, onResponseText, onTranscript]);

  const startText = useCallback(async () => {
    if (wsRef.current) return;
    sessionTypeRef.current = 'text';
    setConnectionState('connecting');
    setIsListening(false);
    setIsMuted(false);
    sessionReadyRef.current = false;

    try {
      cidRef.current = ensureCid();
      const proxyBaseEnv = (process.env.NEXT_PUBLIC_GEMINI_LIVE_PROXY_URL || '').trim();
      const proxyModel = (process.env.NEXT_PUBLIC_GEMINI_LIVE_PROXY_MODEL || '').trim();
      const useProxy = (process.env.NEXT_PUBLIC_GEMINI_LIVE_USE_PROXY || '').trim() === '1';

      let wsUrl: string;
      let token: VertexToken | null = null;

      const defaultProxyBase = (() => {
        if (process.env.NODE_ENV !== 'development') return '';
        if (typeof window === 'undefined') return 'ws://localhost:3001';
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname || 'localhost';
        return `${proto}://${host}:3001`;
      })();

      const proxyBase = proxyBaseEnv || (useProxy ? defaultProxyBase : '');
      if (proxyBase) {
        const model = proxyModel || 'gemini-live-2.5-flash-native-audio';
        const sep = proxyBase.includes('?') ? '&' : '?';
        wsUrl = `${proxyBase}${sep}model=${encodeURIComponent(model)}`;
        console.log('[Gemini] connecting (text) via local proxy', { proxyBase, model });
      } else {
        token = await getVertexToken();
        wsUrl = `wss://${token.region}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent?access_token=${encodeURIComponent(token.accessToken)}`;
        console.log('[Gemini] connecting (text) via Vertex AI', {
          region: token.region,
          projectId: token.projectId,
          model: token.model,
        });
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = 'arraybuffer';

      ws.onopen = async () => {
        setConnectionState('connected');
        // Text mode: don't play audio chunks even if they arrive.
        allowAudioOutRef.current = false;
        lastOutputTranscriptRef.current = '';
        try {
          console.log('[Gemini] websocket open (text)');
        } catch {}

        const langCookie = (getCookieValue('lumina_language') || '').toLowerCase();
        const lang: LuminaLanguage = (langCookie === 'en' || langCookie === 'ru' ? (langCookie as LuminaLanguage) : 'ka');
        const pageContext = {
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          title: typeof document !== 'undefined' ? document.title : 'Lumina Estate',
        };
        const systemPrompt = buildSystemPrompt(lang, pageContext);

        const setupPayload = {
          setup: {
            model: token
              ? `projects/${token.projectId}/locations/${token.region}/publishers/google/models/${token.model}`
              : undefined,
            generation_config: {
              // IMPORTANT: native-audio live models do NOT support TEXT modality.
              // We keep AUDIO modality but read the assistant text via outputTranscription.
              response_modalities: ['audio'],
            },
            // Enable transcriptions so we can show text while response modality is AUDIO.
            input_audio_transcription: {},
            output_audio_transcription: {},
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            ...(toolHandler
              ? {
                  tools: [
                    {
                      function_declarations: [
                        {
                          name: 'search_properties',
                          description:
                            'Search properties with filters; navigate to /properties with the filters applied.',
                          parameters: {
                            type: 'object',
                            properties: {
                              query: { type: 'string' },
                              district: { type: 'string' },
                              min_price: { type: 'number' },
                              max_price: { type: 'number' },
                              bedrooms: { type: 'number' },
                              bathrooms: { type: 'number' },
                              status: { type: 'string', enum: ['for-sale', 'for-rent'] },
                              property_type: {
                                type: 'string',
                                enum: ['apartment', 'house', 'villa', 'studio', 'penthouse'],
                              },
                              min_sqft: { type: 'number' },
                              max_sqft: { type: 'number' },
                              is_new: { type: 'boolean' },
                              limit: { type: 'number' },
                              sort_by: { type: 'string', enum: ['price_asc', 'price_desc', 'newest'] },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'set_filters',
                          description: 'Update property list filters and navigate to listing page.',
                          parameters: {
                            type: 'object',
                            properties: {
                              q: { type: 'string' },
                              district: { type: 'string' },
                              priceMin: { type: 'number' },
                              priceMax: { type: 'number' },
                              rooms: { type: 'number' },
                              status: { type: 'string', enum: ['for-sale', 'for-rent'] },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_first_property',
                          description: 'Open the first property from last search results.',
                          parameters: {
                            type: 'object',
                            properties: {
                              new_tab: { type: 'boolean', default: false },
                            },
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_nth_result',
                          description: 'Open the Nth property from the last search results. Index is 1-based.',
                          parameters: {
                            type: 'object',
                            properties: {
                              index: { type: 'number' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['index'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'navigate_to_property',
                          description: 'Navigate to a specific property details page by id.',
                          parameters: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['id'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'open_page',
                          description: 'Open an arbitrary page path in this app (e.g. /properties).',
                          parameters: {
                            type: 'object',
                            properties: {
                              path: { type: 'string' },
                              new_tab: { type: 'boolean', default: false },
                            },
                            required: ['path'],
                            additionalProperties: false,
                          },
                        },
                        {
                          name: 'list_results',
                          description:
                            'List more properties from the last search results (pagination). Returns a preview slice only.',
                          parameters: {
                            type: 'object',
                            properties: {
                              offset: { type: 'number' },
                              limit: { type: 'number' },
                            },
                            additionalProperties: false,
                          },
                        },
                      ],
                    },
                  ],
                }
              : {}),
          },
        };
        ws.send(JSON.stringify(setupPayload));

        // Listen for page/property snapshots and stream them into the session
        try {
          const cid = cidRef.current;
          if (cid && typeof BroadcastChannel !== 'undefined') {
            const ch = new BroadcastChannel(`lumina-ai-${cid}`);
            bcRef.current = ch;
            ch.onmessage = (ev) => {
              try {
                const payload = ev.data;
                if (!payload || typeof payload !== 'object') return;
                if (ws.readyState !== WebSocket.OPEN) return;
                const snapshotKey = (() => {
                  try {
                    const p: any = payload as any;
                    if (p?.type && p?.id) return `${String(p.type)}:${String(p.id)}`;
                    return JSON.stringify(payload);
                  } catch {
                    return String(Date.now());
                  }
                })();
                if (snapshotKey && snapshotKey === lastSnapshotKeyRef.current) return;
                lastSnapshotKeyRef.current = snapshotKey;
                ws.send(
                  JSON.stringify({
                    client_content: {
                      turns: [
                        {
                          role: 'user',
                          parts: [{ text: JSON.stringify(payload) }],
                        },
                      ],
                      turn_complete: false,
                    },
                  }),
                );
              } catch {}
            };
          }
        } catch {}
      };

      ws.onmessage = (event) => {
        try {
          // Some servers/proxies may deliver JSON frames as ArrayBuffer/Blob.
          const raw = event.data;
          let text: string | null = null;
          if (typeof raw === 'string') {
            text = raw;
          } else if (raw instanceof ArrayBuffer) {
            text = new TextDecoder('utf-8').decode(new Uint8Array(raw));
          } else if (raw instanceof Blob) {
            // Blob -> async, so punt to a separate async parse
            void raw.text().then((t) => {
              try {
                const data = JSON.parse(t);
                // Any valid server message indicates the session is ready
                sessionReadyRef.current = true;
                // If the server signals interruption, stop any queued playback immediately.
                const interrupted =
                  Boolean((data as any)?.serverContent?.interrupted) ||
                  Boolean((data as any)?.server_content?.interrupted);
                if (interrupted) stopPlaybackNow();
                const outTr =
                  (data as any)?.serverContent?.outputTranscription?.text ??
                  (data as any)?.server_content?.output_transcription?.text;
                if (typeof outTr === 'string' && outTr.length) {
                  const prev = lastOutputTranscriptRef.current;
                  const delta = outTr.startsWith(prev) ? outTr.slice(prev.length) : outTr;
                  lastOutputTranscriptRef.current = outTr;
                  if (delta) onResponseText?.(delta);
                }
                const parts = data?.serverContent?.modelTurn?.parts || [];
                for (const part of parts) {
                  if (allowAudioOutRef.current && part?.inlineData?.mimeType?.includes('audio/pcm')) {
                    const mt = String(part.inlineData.mimeType || '');
                    const m = /rate=(\d+)/.exec(mt);
                    const rate = m ? Number(m[1]) : 24000;
                    void handleAudioOut(part.inlineData.data, rate);
                  }
                  if (part?.text) onResponseText?.(part.text);
                }
                const inTr = data?.inputTranscription?.text;
                if (inTr) onTranscript?.(inTr);
              } catch (e) {
                console.error('[Gemini] message parse error', e);
              }
            });
            return;
          } else {
            text = String(raw);
          }

          if (!text) return;
          const data = JSON.parse(text);
          // Any valid server message indicates the session is ready
          sessionReadyRef.current = true;

          // If the server signals interruption, stop any queued playback immediately.
          const interrupted =
            Boolean((data as any)?.serverContent?.interrupted) ||
            Boolean((data as any)?.server_content?.interrupted);
          if (interrupted) stopPlaybackNow();

          const outTr =
            (data as any)?.serverContent?.outputTranscription?.text ??
            (data as any)?.server_content?.output_transcription?.text;
          if (typeof outTr === 'string' && outTr.length) {
            const prev = lastOutputTranscriptRef.current;
            const delta = outTr.startsWith(prev) ? outTr.slice(prev.length) : outTr;
            lastOutputTranscriptRef.current = outTr;
            if (delta) onResponseText?.(delta);
          }

          // Tool calling (if enabled)
          if (toolHandler) {
            // Different transports/SDKs may wrap tool calls differently.
            const toolCall =
              (data?.toolCall ||
                data?.tool_call ||
                data?.toolCalls ||
                data?.tool_calls ||
                data?.serverContent?.toolCall ||
                data?.serverContent?.tool_call ||
                data?.server_content?.tool_call ||
                data?.server_content?.toolCall) as any;
            const fnCalls =
              toolCall?.functionCalls ||
              toolCall?.function_calls ||
              toolCall?.functionCalls?.calls ||
              toolCall?.function_calls?.calls ||
              toolCall?.calls;
            if (Array.isArray(fnCalls) && fnCalls.length) {
              if (!toolDebugOnceRef.current) {
                toolDebugOnceRef.current = true;
                try {
                  console.log('[Gemini] tool call received', {
                    calls: fnCalls.map((c: any) => ({
                      id: c?.id || c?.callId || c?.call_id,
                      name: c?.name || c?.functionName || c?.function_name,
                    })),
                  });
                } catch {}
              }
              for (const call of fnCalls) {
                const id = String(call?.id || call?.callId || call?.call_id || '');
                const name = String(call?.name || call?.functionName || call?.function_name || '');
                const args = call?.args ?? call?.arguments ?? call?.argsText ?? call?.args_text ?? '{}';
                const argsText = typeof args === 'string' ? args : JSON.stringify(args);
                if (!name) continue;
                const res = toolHandler(name, argsText, { transport: 'realtime' });
                if (!res?.handled) continue;
                try {
                  const toolResponseSnake = {
                    tool_response: {
                      function_responses: [
                        {
                          ...(id ? { id } : {}),
                          name,
                          response: res.payload || { ok: true },
                        },
                      ],
                    },
                  };
                  try {
                    console.log('[Gemini] tool response sent', {
                      id: id || undefined,
                      name,
                      responseKeys: res.payload ? Object.keys(res.payload) : ['ok'],
                    });
                  } catch {}
                  ws.send(JSON.stringify(toolResponseSnake));
                } catch {}
              }
              return;
            }
          }

          const parts = data?.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            if (allowAudioOutRef.current && part?.inlineData?.mimeType?.includes('audio/pcm')) {
              const mt = String(part.inlineData.mimeType || '');
              const m = /rate=(\d+)/.exec(mt);
              const rate = m ? Number(m[1]) : 24000;
              if (!audioOutDebugOnceRef.current) {
                audioOutDebugOnceRef.current = true;
                console.log('[Gemini] audio out format', { mimeType: mt, parsedRate: rate });
              }
              void handleAudioOut(part.inlineData.data, rate);
            }
            if (part?.text) {
              onResponseText?.(part.text);
            }
          }
          const inTr = data?.inputTranscription?.text;
          if (inTr) onTranscript?.(inTr);
        } catch (error) {
          console.error('[Gemini] message parse error', error);
        }
      };

      ws.onerror = (err) => {
        let errType: string | undefined;
        try {
          errType = (err as any)?.type;
        } catch {}
        console.error('[Gemini] websocket error', {
          type: errType,
          url: ws.url,
          readyState: ws.readyState,
        });
        try {
          onError?.('Connection error. Please retry.');
        } catch {}
        setConnectionState('error');
        try {
          if (wsRef.current === ws) wsRef.current = null;
        } catch {}
        try {
          ws.close();
        } catch {}
      };

      ws.onclose = (evt) => {
        console.warn('[Gemini] websocket closed', {
          code: evt.code,
          reason: evt.reason,
          wasClean: evt.wasClean,
          readyState: ws.readyState,
        });
        if (wsRef.current === ws) wsRef.current = null;
        allowAudioOutRef.current = false;
        sessionReadyRef.current = false;
        stopPlaybackNow();
        try {
          bcRef.current?.close();
        } catch {}
        bcRef.current = null;
        try {
          processorRef.current?.disconnect();
        } catch {}
        processorRef.current = null;
        try {
          mediaStreamRef.current?.getTracks()?.forEach((t) => t.stop());
        } catch {}
        mediaStreamRef.current = null;
        setIsListening(false);
        setConnectionState('stopped');
      };
    } catch (error) {
      console.error('[Gemini] start (text) failed', error);
      await closeAll();
      setConnectionState('error');
    }
  }, [closeAll, onResponseText, onTranscript, toolHandler]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = (text || '').trim();
      if (!trimmed) return;

      // If we are currently in a voice session, restart in text mode so replies are text-first.
      if (wsRef.current && sessionTypeRef.current === 'voice') {
        await closeAll();
      }

      if (!wsRef.current) {
        await startText();
      }

      const waitForOpen = async () => {
        const deadline = Date.now() + 5000;
        while (Date.now() < deadline) {
          const ws = wsRef.current;
          if (ws && ws.readyState === WebSocket.OPEN) return ws;
          await new Promise((r) => setTimeout(r, 50));
        }
        return null;
      };

      const ws = await waitForOpen();
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('Gemini text session not connected');
      }

      lastOutputTranscriptRef.current = '';
      sessionReadyRef.current = true;
      ws.send(
        JSON.stringify({
          client_content: {
            turns: [
              {
                role: 'user',
                parts: [{ text: trimmed }],
              },
            ],
            turn_complete: true,
          },
        }),
      );
      try {
        console.log('[Gemini] sent text', { length: trimmed.length });
      } catch {}
    },
    [closeAll, startText],
  );

  return {
    isListening,
    isMuted,
    isAiSpeaking,
    playbackAnalyser,
    connectionState,
    startVoice,
    stopVoice,
    toggleMute,
    sendText,
    audioRef,
  };
}
