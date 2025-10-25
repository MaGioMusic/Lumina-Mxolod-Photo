'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { Microphone } from '@phosphor-icons/react';
import { GeminiVoiceButton } from './GeminiVoiceButton';
import { getMockProperties, MockProperty } from '@/lib/mockProperties';

const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
});

export default function AIChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Voice feature flag: default from env, URL can disable with ?voice=0
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showInlineResults = searchParams.get('show') === '1';
  const voiceEnv = (process.env.NEXT_PUBLIC_VOICE_DEFAULT || '1');
  const voiceDefaultOn = voiceEnv !== '0';
  const isVoiceEnabled = searchParams.get('voice') === '0' ? false : voiceDefaultOn;
  const isGeminiEnabled = searchParams.get('gemini') === '1';
  const isClientVadEnabled = searchParams.get('clientvad') === '1';
  // Realtime mode toggle: A = server VAD only; B = manual (VAD off + client-side VAD)
  const rtMode = (searchParams.get('rtmode') || 'a').toLowerCase();
  const isModeA = rtMode === 'a';
  const isModeB = rtMode === 'b';
  const useClientVad = isModeB || isClientVadEnabled;
  // Function-calling: default from env, URL can disable with ?fc=0
  const fcEnv = (process.env.NEXT_PUBLIC_FC_DEFAULT || '1');
  const fcDefaultOn = fcEnv !== '0';
  const isFunctionCallingEnabled = searchParams.get('fc') === '0' ? false : fcDefaultOn;
  // NEW: Force WebSocket mode instead of WebRTC (?ws=1)
  const useWebSocket = searchParams.get('ws') === '1';

  // Realtime voice session state
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'stopped'>('idle');
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const keepaliveTimerRef = useRef<number | null>(null);
  const disconnectedTimerRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const dcHealthCheckRef = useRef<number | null>(null);
  // Voice visualizer (center of chat) refs
  // Center voice visual (canvas waveform)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const centerCircleRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const amplitudeRef = useRef<number>(0);
  const remoteAmplitudeRef = useRef<number>(0);
  const [micLevel, setMicLevel] = useState(0);
  const [aiLevel, setAiLevel] = useState(0);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);
  const speechStartTimeRef = useRef<number>(0);
  const lastCommitAtRef = useRef<number>(0);
  const lastRecvBytesRef = useRef<number>(0);
  const lastRecvAtRef = useRef<number>(Date.now());
  const nudgeSentAtRef = useRef<number>(0);
  const restartingRef = useRef<boolean>(false);
  const sessionGenRef = useRef<number>(0);
  const sdpAbortRef = useRef<AbortController | null>(null);
  const oaiDcRef = useRef<RTCDataChannel | null>(null);
  const inFlightResponseRef = useRef<boolean>(false);
  const toolArgsRef = useRef<Map<string, { name?: string; argsText: string }>>(new Map());
  const [searchResults, setSearchResults] = useState<MockProperty[]>([]);
  const [lastSearchSummary, setLastSearchSummary] = useState<string>('');

  // Fallback: keyword-based navigation when function-calling doesn't trigger
  useEffect(() => {
    if (!message) return;
    const m = message.toLowerCase();
    const triggers = [
      'properties', 'property', 'listings', 'go to properties', 'open properties',
      'უძრავი', 'ქონება', 'უძრავი ქონება', 'განცხადებები', 'ბინები', 'სახლები'
    ];
    if (triggers.some(t => m.includes(t))) {
      try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
      router.push('/properties');
    }
  }, [message, isOpen, router]);

  const runPropertySearch = (rawArgs: any): MockProperty[] => {
    try {
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : (rawArgs || {});
      const all = getMockProperties(100);
      let list = all.slice();
      if (args.query && typeof args.query === 'string') {
        const q = args.query.toLowerCase();
        list = list.filter(p =>
          String(p.address).toLowerCase().includes(q) ||
          String(p.type).toLowerCase().includes(q)
        );
      }
      if (args.district && typeof args.district === 'string') {
        list = list.filter(p => p.address === args.district);
      }
      if (Number.isFinite(args.min_price)) list = list.filter(p => p.price >= Number(args.min_price));
      if (Number.isFinite(args.max_price)) list = list.filter(p => p.price <= Number(args.max_price));
      if (Number.isFinite(args.bedrooms)) list = list.filter(p => p.bedrooms >= Number(args.bedrooms));
      if (Number.isFinite(args.bathrooms)) list = list.filter(p => p.bathrooms >= Number(args.bathrooms));
      if (args.status && (args.status === 'for-sale' || args.status === 'for-rent')) list = list.filter(p => p.status === args.status);
      if (args.property_type && typeof args.property_type === 'string') list = list.filter(p => p.type === args.property_type);
      if (Number.isFinite(args.min_sqft)) list = list.filter(p => p.sqft >= Number(args.min_sqft));
      if (Number.isFinite(args.max_sqft)) list = list.filter(p => p.sqft <= Number(args.max_sqft));
      if (typeof args.is_new === 'boolean') list = list.filter(p => Boolean(p.isNew) === Boolean(args.is_new));
      if (args.sort_by === 'price_asc') list.sort((a,b) => a.price - b.price);
      if (args.sort_by === 'price_desc') list.sort((a,b) => b.price - a.price);
      const limit = Number.isFinite(args.limit) ? Math.max(1, Math.min(20, Number(args.limit))) : 6;
      return list.slice(0, limit);
    } catch {
      return getMockProperties(6);
    }
  };
  const requestModelResponse = () => {
    const dc = oaiDcRef.current;
    if (!dc || dc.readyState !== 'open') {
      console.warn('[OAI] requestModelResponse failed: DataChannel not open');
      return;
    }
    if (inFlightResponseRef.current) {
      console.log('[OAI] response.create suppressed (in-flight)');
      return;
    }
    try {
      // Manually commit buffered audio and ask for response
      dc.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      dc.send(JSON.stringify({ type: 'response.create', response: { max_output_tokens: 4096 } }));
      console.log('[OAI] → commit + response.create');
      inFlightResponseRef.current = true;
      
      // WATCHDOG: Force reset after 15 seconds if no response
      window.setTimeout(() => {
        if (inFlightResponseRef.current) {
          console.warn('[OAI] ⚠️ WATCHDOG: Force reset inFlightResponseRef after 15s timeout');
          inFlightResponseRef.current = false;
          // Clear buffer to prevent accumulation
          try {
            const dcCheck = oaiDcRef.current;
            if (dcCheck && dcCheck.readyState === 'open') {
              dcCheck.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
              console.log('[OAI] → buffer cleared by watchdog');
            }
          } catch {}
        }
      }, 15000);
    } catch (err) {
      console.error('[OAI] requestModelResponse error:', err);
      inFlightResponseRef.current = false;
    }
  };

  const toggleMute = () => {
    try {
      const stream = localStreamRef.current;
      const track = stream?.getAudioTracks?.()[0];
      if (!track) return;
      const next = !track.enabled;
      track.enabled = next;
      setIsMuted(!next);
    } catch {}
  };
  // Gemini Live WS transport
  const gemWsRef = useRef<WebSocket | null>(null);
  const gemNodeRef = useRef<AudioWorkletNode | null>(null);
  const gemStreamRef = useRef<MediaStream | null>(null);
  const gemCommitTimerRef = useRef<number | null>(null);
  const gemHasPendingRef = useRef<boolean>(false);
  const [useGeminiFallback, setUseGeminiFallback] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      ChatMessageSchema.parse({ message });
      console.log('Sending message:', message);
      setMessage('');
    } catch (error) {
      console.error('Invalid message:', error);
    }
  };

  // --- VOICE: OpenAI Realtime over WebRTC ---
  const stopVoice = async () => {
    setIsListening(false);
    setConnectionState('stopped');
    try { sdpAbortRef.current?.abort(); } catch {}
    sdpAbortRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (keepaliveTimerRef.current) {
      window.clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
    if (disconnectedTimerRef.current) {
      window.clearTimeout(disconnectedTimerRef.current);
      disconnectedTimerRef.current = null;
    }
    if (statsIntervalRef.current) {
      window.clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    if (dcHealthCheckRef.current) {
      window.clearInterval(dcHealthCheckRef.current);
      dcHealthCheckRef.current = null;
    }
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      peerRef.current?.getSenders().forEach((s) => {
        try { s.track?.stop(); } catch {}
      });
      peerRef.current?.close();
    } catch {}
    localStreamRef.current = null;
    peerRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { audioContextRef.current?.close(); } catch {}
    audioContextRef.current = null;
    analyserRef.current = null;
    setRemainingMs(0);
  };

  const startVoice = async () => {
    if (isGeminiEnabled) {
      await startGemini();
      return;
    }
    if (!isVoiceEnabled) {
      console.warn('Voice feature is disabled. Add ?voice=1 to URL to enable.');
      return;
    }
    if (isListening || peerRef.current) return;
    
    // Reset state for new session
    inFlightResponseRef.current = false;
    console.log('[OAI] Starting new voice session, resetting inFlightResponseRef');
    
    setConnectionState('connecting');
    try {
      const myGen = ++sessionGenRef.current;
      // 1) Ask our server for ephemeral session credentials
      const tokenRes = await fetch('/api/realtime/token');
      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        throw new Error('Token endpoint error: ' + text);
      }
      const tokenJson = await tokenRes.json();
      const ephemeralToken: string | undefined = tokenJson?.client_secret?.value;
      const model: string = tokenJson?.model || 'gpt-realtime';
      if (!ephemeralToken) throw new Error('Missing ephemeral token');

      // 2) Prepare WebRTC
      const turnUrl = (process.env.NEXT_PUBLIC_TURN_URL || '').trim();
      const turnUser = (process.env.NEXT_PUBLIC_TURN_USERNAME || '').trim();
      const turnPass = (process.env.NEXT_PUBLIC_TURN_PASSWORD || '').trim();
      const iceServers: RTCIceServer[] = [
        { urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] },
      ];
      if (turnUrl && turnUser && turnPass) {
        iceServers.push({ urls: [turnUrl], username: turnUser, credential: turnPass });
      }
      const pc = new RTCPeerConnection({ iceServers });
      peerRef.current = pc;
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState as any);
        console.log('[RTC] connectionstatechange ->', pc.connectionState);
        const st = pc.connectionState;
        if (!restartingRef.current && (st === 'failed' || st === 'closed')) {
          restartingRef.current = true;
          console.warn('[RTC] state', st, '→ recreating session');
          stopVoice().then(() => {
            setTimeout(() => { restartingRef.current = false; startVoice(); }, 400);
          });
        }
      };
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log('[RTC] iceconnectionstatechange ->', state);
        if (state === 'failed') {
          try { (pc as any).restartIce?.(); } catch {}
          if (!restartingRef.current) {
            restartingRef.current = true;
            setTimeout(() => {
              console.warn('[RTC] ICE failed → recreating session');
              stopVoice().then(() => {
                setTimeout(() => { restartingRef.current = false; startVoice(); }, 400);
              });
            }, 800);
          }
        }
        if (state === 'disconnected') {
          if (!disconnectedTimerRef.current) {
            disconnectedTimerRef.current = window.setTimeout(() => {
              try { (pc as any).restartIce?.(); } catch {}
              disconnectedTimerRef.current && window.clearTimeout(disconnectedTimerRef.current);
              disconnectedTimerRef.current = null;
            }, 2000);
          }
        }
      };
      pc.addEventListener('icecandidateerror', (e) => {
        console.warn('ICE candidate error:', e);
      });

      // Periodic getStats logging to debug drops
      statsIntervalRef.current = window.setInterval(async () => {
        try {
          const stats = await pc.getStats();
          let selectedPair: any = null;
          stats.forEach((s) => {
            if (s.type === 'transport' && s.selectedCandidatePairId) {
              selectedPair = stats.get(s.selectedCandidatePairId);
            }
          });
          const audioRecv = Array.from(stats.values()).find((s: any) => s.type === 'inbound-rtp' && s.kind === 'audio');
          const audioSend = Array.from(stats.values()).find((s: any) => s.type === 'outbound-rtp' && s.kind === 'audio');
          const senders = pc.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio');
          
          console.log('[RTC][stats]', {
            state: pc.connectionState,
            ice: pc.iceConnectionState,
            pair: selectedPair ? { state: selectedPair.state, local: selectedPair.localCandidateId, remote: selectedPair.remoteCandidateId, currentRtt: selectedPair.currentRoundTripTime } : null,
            recv: audioRecv ? { bytes: audioRecv.bytesReceived, jitter: audioRecv.jitter, packetsLost: audioRecv.packetsLost } : null,
            send: audioSend ? { 
              bytes: audioSend.bytesSent, 
              packets: audioSend.packetsSent,
              retransmits: audioSend.retransmittedPacketsSent,
              trackEnabled: audioSender?.track?.enabled,
              trackMuted: audioSender?.track?.muted,
              trackReadyState: audioSender?.track?.readyState
            } : null,
          });

          // Watchdog: only consider stall if no recv growth for >30s (to avoid false restarts when model is just silent)
    const now = Date.now();
          const recvBytes = (audioRecv && typeof audioRecv.bytesReceived === 'number') ? audioRecv.bytesReceived : 0;
          if (pc.connectionState === 'connected') {
            if (recvBytes > lastRecvBytesRef.current) {
              lastRecvBytesRef.current = recvBytes;
              lastRecvAtRef.current = now;
              nudgeSentAtRef.current = 0; // reset nudge
            } else if (!restartingRef.current && (now - lastRecvAtRef.current) > 30000) {
              console.warn('[RTC][watchdog] No remote audio growth for 30s. Restarting ICE...');
              try { (pc as any).restartIce?.(); } catch {}
          } /* no auto-nudge to avoid duplicate response triggers */
          }
        } catch {}
      }, 4000);

      // Remote audio playback
      pc.ontrack = (event) => {
        console.log('[AUDIO] 🔊 Remote track received:', {
          kind: event.track.kind,
          id: event.track.id,
          readyState: event.track.readyState,
          muted: event.track.muted,
          streams: event.streams.length
        });
        
        // CRITICAL FIX: Unmute the remote track!
        if (event.track.muted) {
          console.warn('[AUDIO] ⚠️ Remote track is muted! This is expected initially.');
        }
        event.track.enabled = true; // Ensure track is enabled
        
        if (!audioRef.current) {
          console.warn('[AUDIO] ⚠️ audioRef.current is null!');
          return;
        }
        const [remoteStream] = event.streams;
        audioRef.current.srcObject = remoteStream;
        audioRef.current.volume = 1.0; // Ensure volume is at 100%
        audioRef.current.muted = false; // Ensure <audio> element is not muted
        console.log('[AUDIO] ✅ Remote stream assigned to <audio> element');
        
        // Try to play explicitly (in case autoPlay fails)
        audioRef.current.play().then(() => {
          console.log('[AUDIO] ✅ Audio playback started successfully', {
            volume: audioRef.current?.volume,
            muted: audioRef.current?.muted,
            paused: audioRef.current?.paused
          });
        }).catch((err) => {
          console.error('[AUDIO] ⚠️ Audio playback failed:', err);
        });

        // Build remote analyser (AI output) for level meter
        try {
          const ctx = audioContextRef.current;
          if (ctx) {
            const source = ctx.createMediaStreamSource(remoteStream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.85;
            source.connect(analyser);
            remoteAnalyserRef.current = analyser;
          }
        } catch {}
      };

      // Ensure bidirectional audio m-line exists early
      // NOTE: We'll add track manually below, so transceiver will be created automatically

      // Local mic (with robust constraints)
      const local = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as MediaTrackConstraints,
      });
      localStreamRef.current = local;
      const localTrack = local.getAudioTracks()[0];
      console.log('[MIC] 🎤 Got microphone track:', {
        id: localTrack?.id,
        label: localTrack?.label,
        enabled: localTrack?.enabled,
        muted: localTrack?.muted,
        readyState: localTrack?.readyState
      });
      if (localTrack) {
        localTrack.enabled = true;
        const sender = pc.addTrack(localTrack, local);
        console.log('[MIC] ✅ Track added to PeerConnection:', {
          trackId: sender.track?.id,
          streamIds: sender.track ? Array.from((sender as any).streams || []).map((s: any) => s.id) : []
        });
      }
      setIsMuted(false);

      // Init center visualizer using WebAudio analyser
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx: AudioContext = new Ctx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(local);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
          analyserRef.current.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128; // -1..1
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          const level = Math.min(1, Math.max(0, rms * 2));
          amplitudeRef.current = level;
          setMicLevel(level);
          
          // 🔴 DEBUG: Log mic level every 2 seconds when speaking
          const now = Date.now();
          const w = window as any;
          if (!w._lastMicLog || now - w._lastMicLog > 2000) {
            if (level > 0.05) {
              console.log('[MIC] 🎤 Level:', (level * 100).toFixed(1) + '%', { 
                rms: rms.toFixed(3), 
                speaking: isSpeakingRef.current 
              });
            }
            w._lastMicLog = now;
          }

          // Optional client-side VAD (off by default; enable with ?clientvad=1)
          if (isClientVadEnabled) {
            const startThresh = 0.12; // start when above
            const stopThresh = 0.06;  // stop when below
            const stopHoldMs = 1800;  // wait longer silence before commit (per support)
            const minSpeechDurationMs = 900; // require at least this much speech before commit
            const commitCooldownMs = 1200;   // debounce between commits

            // Speech start
            if (!isSpeakingRef.current && level > startThresh) {
              isSpeakingRef.current = true;
              speechStartTimeRef.current = Date.now();
              if (silenceTimerRef.current) { window.clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
              // In manual mode, start of a new user turn → clear server buffer
              if (isModeB) {
                try { const dc = oaiDcRef.current; if (dc && dc.readyState === 'open') { dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' })); console.log('[OAI][client-vad] start → buffer.clear'); } } catch {}
              }
            }

            // If user resumes speaking during pending silence timer, cancel it
            if (isSpeakingRef.current && level > startThresh && silenceTimerRef.current) {
              window.clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }

            // Silence detection → schedule commit
            if (isSpeakingRef.current && level < stopThresh && !silenceTimerRef.current) {
              silenceTimerRef.current = window.setTimeout(() => {
                // Still silent? Double-check instantaneous level
                const currentLevel = amplitudeRef.current;
                if (currentLevel >= stopThresh) { silenceTimerRef.current = null; return; }

                const speechDuration = Date.now() - speechStartTimeRef.current;
                const sinceLastCommit = Date.now() - lastCommitAtRef.current;

                // Guard: require minimum speech duration
                if (speechDuration < minSpeechDurationMs) {
                  try { console.log('[OAI][client-vad] speech too short → skip commit', speechDuration); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }

                // Guard: debounce frequent commits
                if (sinceLastCommit < commitCooldownMs) {
                  try { console.log('[OAI][client-vad] debounce commit (cooldown)'); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }

                // Guard: ensure DC open before committing
                const dc = oaiDcRef.current;
                if (!dc || dc.readyState !== 'open') {
                  try { console.warn('[OAI][client-vad] DC not open → skip commit'); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }

                isSpeakingRef.current = false;
                silenceTimerRef.current && window.clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
                lastCommitAtRef.current = Date.now();
                // Trigger manual commit + response
                try { console.log('[OAI][client-vad] stop detected → commit'); } catch {}
                requestModelResponse();
              }, stopHoldMs);
            }
          }

          // Remote (AI) level
          if (remoteAnalyserRef.current) {
            const rd = new Uint8Array(remoteAnalyserRef.current.frequencyBinCount);
            remoteAnalyserRef.current.getByteTimeDomainData(rd);
            let rsum = 0;
            for (let i = 0; i < rd.length; i++) {
              const v = (rd[i] - 128) / 128;
              rsum += v * v;
            }
            const rrms = Math.sqrt(rsum / rd.length);
            const rlevel = Math.min(1, Math.max(0, rrms * 2));
            remoteAmplitudeRef.current = rlevel;
            setAiLevel(rlevel);
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.warn('Center visualizer init failed:', e);
      }

      // Ensure at least one audio transceiver exists (sender added via addTrack above)

      // 2.5) Create DataChannel BEFORE createOffer (MUST be done by client!)
      // OpenAI expects us to create it, then they'll open it after SDP exchange
      const oaiDc = pc.createDataChannel('oai-events', { 
        ordered: true,
        // Label MUST be 'oai-events' for OpenAI Realtime API
      });
      oaiDcRef.current = oaiDc;
      console.log('[OAI] DataChannel created (client-side)', { 
        label: oaiDc.label, 
        readyState: oaiDc.readyState,
        id: oaiDc.id 
      });
      
      oaiDc.onopen = () => {
        console.log('[OAI] ✅ DataChannel OPENED!', { readyState: oaiDc.readyState });
        // Configure VAD per mode
        // 🔴 CRITICAL: For interrupt to work, we MUST use server-side turn_detection!
        // Client VAD (turn_detection: null) disables OpenAI's ability to detect user speech!
        if (useClientVad) {
          // Even in "manual" mode, keep semantic_vad active for interrupts!
          const sessionUpdate = {
            type: 'session.update',
            session: {
              turn_detection: { type: 'semantic_vad', eagerness: 'auto', create_response: false, interrupt_response: true },
            },
          } as any;
          try { oaiDc.send(JSON.stringify(sessionUpdate)); } catch {}
          console.log('[OAI] session.update turn_detection=semantic_vad with manual response (client VAD)');
        } else {
          const sessionUpdate = {
            type: 'session.update',
            session: {
              turn_detection: { type: 'semantic_vad', eagerness: 'auto', create_response: true, interrupt_response: true },
            },
          } as any;
          try { oaiDc.send(JSON.stringify(sessionUpdate)); } catch {}
          console.log('[OAI] session.update turn_detection=semantic_vad with auto-response (server VAD)');
        }
        
        // Start periodic health check
        dcHealthCheckRef.current = window.setInterval(() => {
          const dcCheck = oaiDcRef.current;
          if (!dcCheck || dcCheck.readyState !== 'open') {
            console.warn('[OAI] ⚠️ Health check: DataChannel not open!', dcCheck?.readyState);
            if (inFlightResponseRef.current) {
              console.warn('[OAI] ⚠️ Resetting inFlightResponseRef due to closed channel');
              inFlightResponseRef.current = false;
            }
          }
        }, 5000);
      };
      
      oaiDc.onclose = (ev: any) => {
        console.warn('[OAI] ⚠️ DataChannel closed!', {
          readyState: oaiDc.readyState,
          label: oaiDc.label,
          code: ev?.code,
          reason: ev?.reason,
          wasClean: ev?.wasClean
        });
        inFlightResponseRef.current = false;
        if (dcHealthCheckRef.current) {
          window.clearInterval(dcHealthCheckRef.current);
          dcHealthCheckRef.current = null;
        }
      };
      
      oaiDc.onerror = (err: any) => {
        console.error('[OAI] ⚠️ DataChannel error!', {
          readyState: oaiDc.readyState,
          label: oaiDc.label,
          error: err,
          errorType: err?.type,
          errorMessage: err?.message,
          peerConnectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState
        });
        inFlightResponseRef.current = false;
        if (dcHealthCheckRef.current) {
          window.clearInterval(dcHealthCheckRef.current);
          dcHealthCheckRef.current = null;
        }
      };
      
      oaiDc.onmessage = (ev: MessageEvent) => {
        try {
          const msg = JSON.parse(String(ev.data || '{}'));
          
          // 🔴 LOG EVERY MESSAGE TYPE FOR DEBUGGING
          if (msg && msg.type) {
            console.log(`[OAI] ← ${msg.type}`, { 
              timestamp: new Date().toISOString(),
              msgKeys: Object.keys(msg),
              inFlight: inFlightResponseRef.current
            });
          }
          
          // Extra VAD logs
          if (msg && msg.type === 'input_audio_buffer.speech_started') {
            console.log('[OAI] ← input_audio_buffer.speech_started');
          }
          // If running manual mode (VAD off), trigger commit on speech stop only if server emits it (rare)
          if (msg && msg.type === 'input_audio_buffer.speech_stopped' && isModeB) requestModelResponse();

          // Diagnostics & gate clearing
          if (msg && msg.type === 'response.created') {
            console.log('[OAI] ← response.created', { id: msg.response?.id });
          }
          if (msg && msg.type === 'response.done') {
            console.log('[OAI] ← response.done', { 
              status: msg?.response?.status || '', 
              id: msg?.response?.id,
              output: msg?.response?.output?.length || 0
            });
            inFlightResponseRef.current = false;
            // After a response finishes in manual mode, clear buffer for the next user turn
            if (isModeB) {
              try { const dc = oaiDcRef.current; if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' })); console.log('[OAI] → buffer cleared after response.done'); } catch {}
            }
          }
          if (msg && msg.type === 'response.output_audio.done') {
            console.log('[OAI] ← response.output_audio.done');
            inFlightResponseRef.current = false;
            if (isModeB) {
              try { const dc = oaiDcRef.current; if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' })); console.log('[OAI] → buffer cleared after audio.done'); } catch {}
            }
          }
          if (msg && msg.type === 'response.error') {
            console.error('[OAI] ← response.error', msg.error);
            inFlightResponseRef.current = false;
            if (isModeB) {
              try { const dc = oaiDcRef.current; if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' })); console.log('[OAI] → buffer cleared after error'); } catch {}
            }
          }

          if (!isFunctionCallingEnabled) return;

          // Function calling (tools) handling — accumulate args and respond with tool_result
          const dc = oaiDcRef.current;
          const sendToolResult = (callId: string, payload: any) => {
            if (!dc || dc.readyState !== 'open') return;
            const toolResultEvt = {
              type: 'conversation.item.create',
              item: {
                type: 'tool_result',
                call_id: callId,
                content: [
                  { type: 'output_text', text: JSON.stringify(payload) }
                ],
              },
            } as any;
            try { dc.send(JSON.stringify(toolResultEvt)); } catch {}
            if (!inFlightResponseRef.current) {
              try {
                dc.send(JSON.stringify({ type: 'response.create', response: { max_output_tokens: 4096 } }));
                inFlightResponseRef.current = true;
              } catch {}
            }
          };

          // Record function name
          if (msg.type === 'response.function_call.created' && msg.call_id) {
            const prev = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            prev.name = msg.name || prev.name;
            toolArgsRef.current.set(msg.call_id, prev);
          }
          // Streamed args
          if (msg.type === 'response.function_call_arguments.delta' && msg.call_id && typeof msg.delta === 'string') {
            const prev = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            prev.argsText += msg.delta;
            toolArgsRef.current.set(msg.call_id, prev);
          }
          // Args done → execute
          if (msg.type === 'response.function_call_arguments.done' && msg.call_id) {
            const acc = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            const fnName = (acc.name || msg.name || '').toString();
            const argsText = acc.argsText || '';
            toolArgsRef.current.delete(msg.call_id);
            if (fnName === 'search_properties') {
              const results = runPropertySearch(argsText);
              setSearchResults(results);
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const summaryParts: string[] = [];
                if (argsObj.district) summaryParts.push(`${argsObj.district}`);
                if (argsObj.bedrooms) summaryParts.push(`${argsObj.bedrooms} საძინებელი`);
                if (argsObj.status) summaryParts.push(argsObj.status === 'for-rent' ? 'ქირავდება' : 'იყიდება');
                setLastSearchSummary(summaryParts.join(' · '));
              } catch { setLastSearchSummary(''); }
              sendToolResult(msg.call_id, { ok: true, count: results.length, results });
            } else if (fnName === 'open_page') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const path = (argsObj.path || '/').toString();
                const newTab = Boolean(argsObj.new_tab);
                if (newTab) window.open(path, '_blank');
                else { try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {} ; router.push(path); }
                sendToolResult(msg.call_id, { ok: true, path, newTab });
              } catch {
                sendToolResult(msg.call_id, { ok: false, error: 'bad_args' });
              }
            } else if (fnName === 'set_filters') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const detail: any = {};
                if (typeof argsObj.q === 'string') detail.location = argsObj.q;
                if (typeof argsObj.district === 'string') detail.location = argsObj.district;
                const min = Number(argsObj.priceMin);
                const max = Number(argsObj.priceMax);
                if (Number.isFinite(min) || Number.isFinite(max)) {
                  detail.priceRange = [Number.isFinite(min) ? min : 0, Number.isFinite(max) ? max : 999999999];
                }
                if (Number.isFinite(argsObj.rooms)) {
                  const r = Number(argsObj.rooms);
                  detail.bedrooms = [r >= 5 ? '5+' : String(r)];
                }
                // Dispatch CustomEvent consumed by PropertiesGrid
                try { window.dispatchEvent(new CustomEvent('lumina:filters:set', { detail })); } catch {}
                // Navigate to properties listing
                try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                router.push('/properties');
                sendToolResult(msg.call_id, { ok: true, applied: detail });
              } catch {
                sendToolResult(msg.call_id, { ok: false, error: 'bad_args' });
              }
            } else if (fnName === 'set_view') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const view = (argsObj.view || 'map').toString();
                try { window.dispatchEvent(new CustomEvent('lumina:view:set', { detail: { view } })); } catch {}
                try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                router.push('/properties');
                sendToolResult(msg.call_id, { ok: true, view });
              } catch { sendToolResult(msg.call_id, { ok: false, error: 'bad_args' }); }
            } else if (fnName === 'navigate_to_property') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const id = (argsObj.id || '').toString();
                if (!id) { sendToolResult(msg.call_id, { ok: false, error: 'missing_id' }); return; }
                try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                router.push(`/properties/${id}`);
                sendToolResult(msg.call_id, { ok: true, id });
              } catch { sendToolResult(msg.call_id, { ok: false, error: 'bad_args' }); }
            } else if (fnName === 'open_first_property') {
              try {
                const first = searchResults[0];
                if (first && first.id) {
                  try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                  router.push(`/properties/${first.id}`);
                  sendToolResult(msg.call_id, { ok: true, id: first.id });
                } else {
                  try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                  router.push('/properties');
                  sendToolResult(msg.call_id, { ok: false, error: 'no_results' });
                }
              } catch { sendToolResult(msg.call_id, { ok: false, error: 'bad_args' }); }
            }
          }

          // Some variants may deliver a compact event containing name+args
          if (msg.type === 'tool_call' && msg.call_id) {
            const name = msg.name;
            const argsText = typeof msg.arguments === 'string' ? msg.arguments : JSON.stringify(msg.arguments || {});
            if (name === 'search_properties') {
              const results = runPropertySearch(argsText);
              setSearchResults(results);
              sendToolResult(msg.call_id, { ok: true, count: results.length, results });
            } else if (name === 'open_page') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const path = (argsObj.path || '/').toString();
                const newTab = Boolean(argsObj.new_tab);
                if (newTab) window.open(path, '_blank');
                else window.location.href = path;
                sendToolResult(msg.call_id, { ok: true, path, newTab });
              } catch { sendToolResult(msg.call_id, { ok: false, error: 'bad_args' }); }
            } else if (name === 'set_filters') {
              try {
                const argsObj = JSON.parse(argsText || '{}');
                const detail: any = {};
                if (typeof argsObj.q === 'string') detail.location = argsObj.q;
                if (typeof argsObj.district === 'string') detail.location = argsObj.district;
                const min = Number(argsObj.priceMin);
                const max = Number(argsObj.priceMax);
                if (Number.isFinite(min) || Number.isFinite(max)) {
                  detail.priceRange = [Number.isFinite(min) ? min : 0, Number.isFinite(max) ? max : 999999999];
                }
                if (Number.isFinite(argsObj.rooms)) {
                  const r = Number(argsObj.rooms);
                  detail.bedrooms = [r >= 5 ? '5+' : String(r)];
                }
                try { window.dispatchEvent(new CustomEvent('lumina:filters:set', { detail })); } catch {}
                window.location.href = '/properties';
                sendToolResult(msg.call_id, { ok: true, applied: detail });
              } catch { sendToolResult(msg.call_id, { ok: false, error: 'bad_args' }); }
            }
          }
        } catch {
          // ignore non-JSON keepalives
        }
      };

      // 3) Create SDP offer and wait for ICE gathering to complete
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const waitForIceGatheringComplete = (rtc: RTCPeerConnection, timeoutMs = 2500) => {
        return new Promise<void>((resolve) => {
          if (rtc.iceGatheringState === 'complete') return resolve();
          const onChange = () => {
            if (rtc.iceGatheringState === 'complete') {
              rtc.removeEventListener('icegatheringstatechange', onChange);
              resolve();
            }
          };
          rtc.addEventListener('icegatheringstatechange', onChange);
          const timer = window.setTimeout(() => {
            rtc.removeEventListener('icegatheringstatechange', onChange);
            resolve();
          }, timeoutMs);
        });
      };
      await waitForIceGatheringComplete(pc);

      // 4) Send offer to OpenAI Realtime, receive answer
      const ac = new AbortController();
      sdpAbortRef.current = ac;
      const sdpRes = await fetch('/api/realtime/sdp', {
        method: 'POST',
        headers: {
          'x-ephemeral-token': ephemeralToken,
          'x-model': model,
          'content-type': 'application/sdp',
        },
        body: (pc.localDescription?.sdp || offer.sdp || ''),
        signal: ac.signal,
      });
      if (!sdpRes.ok) {
        const text = await sdpRes.text();
        throw new Error('SDP exchange failed: ' + text);
      }
      const answerSdp = await sdpRes.text();
      // Guard against races
      if (sessionGenRef.current !== myGen) return;
      if (peerRef.current !== pc) return;
      if (pc.signalingState === 'closed') return;
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      // 5) Optional client-side cap. Default: disabled (0). Configure via NEXT_PUBLIC_VOICE_MAX_SEC
      const rawSec = process.env.NEXT_PUBLIC_VOICE_MAX_SEC as unknown as string | undefined;
      const configuredSec = rawSec !== undefined && rawSec !== '' ? Number(rawSec) : 0;
      const maxMs = Number.isFinite(configuredSec) ? configuredSec * 1000 : 0;
      const startAt = Date.now();
      setIsListening(true);
      setConnectionState('connected');

      // DataChannels already created above, they will open after connection established

      if (maxMs > 0) {
        setRemainingMs(maxMs);
        timerRef.current = window.setInterval(() => {
          const left = maxMs - (Date.now() - startAt);
          setRemainingMs(left > 0 ? left : 0);
          if (left <= 0) {
            stopVoice();
          }
        }, 200);
      } else {
        setRemainingMs(0);
      }
    } catch (err) {
      console.error('Voice start error:', err);
      stopVoice();
    }
  };

  const stopGemini = async () => {
    setIsListening(false);
    setConnectionState('stopped');
    try { gemWsRef.current?.close(); } catch {}
    gemWsRef.current = null;
    if (gemCommitTimerRef.current) {
      window.clearInterval(gemCommitTimerRef.current);
      gemCommitTimerRef.current = null;
    }
    gemHasPendingRef.current = false;
    try { gemNodeRef.current?.port?.close?.(); } catch {}
    try { gemNodeRef.current?.disconnect(); } catch {}
    gemNodeRef.current = null;
    try { gemStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    gemStreamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { audioContextRef.current?.close(); } catch {}
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const startGemini = async () => {
    setConnectionState('connecting');
    try {
      // AudioContext + downsampler worklet
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx: AudioContext = new Ctx();
      audioContextRef.current = ctx;
      const workletCode = `
        class PCMDownsamplerProcessor extends AudioWorkletProcessor { constructor(){super(); this._ratio = sampleRate/16000;} process(inputs){ const i=inputs[0]; if(!i||!i[0]) return true; const ch=i[0]; const step=Math.max(1,Math.floor(this._ratio)); const out=new Int16Array(Math.floor(ch.length/step)); let oi=0; for(let k=0;k<ch.length;k+=step){ let s=ch[k]; s=Math.max(-1,Math.min(1,s)); out[oi++]= s<0 ? s*0x8000 : s*0x7FFF; } this.port.postMessage(out.buffer,[out.buffer]); return true; } } registerProcessor('pcm-downsampler',PCMDownsamplerProcessor);`;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const modUrl = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(modUrl);

      // Mic stream
      const local = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as MediaTrackConstraints,
      });
      gemStreamRef.current = local;

      // Visualizer
      try {
        const source = ctx.createMediaStreamSource(local);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
          analyserRef.current.getByteTimeDomainData(data);
          let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i]-128)/128; sum += v*v; }
          const rms = Math.sqrt(sum / data.length);
          amplitudeRef.current = Math.min(1, Math.max(0, rms * 2));
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {}

      // Worklet node to emit PCM16 16k
      const node = new AudioWorkletNode(ctx, 'pcm-downsampler');
      gemNodeRef.current = node;

      // WS to local proxy (it injects x-goog-api-key from server env)
      const liveModel = process.env.NEXT_PUBLIC_GEMINI_LIVE_MODEL || 'gemini-2.5-flash';
      const proxy = process.env.NEXT_PUBLIC_GEMINI_PROXY_WS || 'ws://localhost:3001';
      // Provide API key via query if server env is missing
      let gemKey: string | null = (process as any)?.env?.NEXT_PUBLIC_GEMINI_API_KEY || (typeof window !== 'undefined' ? window.sessionStorage.getItem('GEMINI_K') : null);
      if (!gemKey && typeof window !== 'undefined') {
        const entered = window.prompt('ჩაწერე Gemini API key (დროებით, მხოლოდ ტესტისთვის):');
        if (entered && entered.trim()) {
          gemKey = entered.trim();
          try { window.sessionStorage.setItem('GEMINI_K', gemKey); } catch {}
        }
      }
      const keyParam = gemKey ? `&key=${encodeURIComponent(gemKey)}` : '';
      const wsUrl = `${proxy}?model=${encodeURIComponent(liveModel)}${keyParam}`;
      console.log('[GEMINI] ws connect →', wsUrl);
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      gemWsRef.current = ws;

      ws.onopen = () => {
        console.log('[GEMINI] ws open');
        // Send session start (basic)
        const init = {
          type: 'session.start',
          model: liveModel,
          config: {
            systemInstruction: 'ქართულენოვანი უძრავი ქონების ასისტენტი Lumina Estate-ზე. ილაპარაკე მოკლედ, თბილად და პროფესიონალურად.',
            audio: { encoding: 'LINEAR16', sampleRate: 16000, language: 'ka-GE' },
            response: { audio: { encoding: 'LINEAR16', sampleRate: 16000 } },
          },
        } as any;
        try { console.log('[GEMINI] → session.start'); ws.send(JSON.stringify(init)); } catch (e) { console.warn('[GEMINI] start send error', e); }
        // Prepare append/commit helpers
        const base64FromArrayBuffer = (buf: ArrayBuffer) => {
          let binary = '';
          const bytes = new Uint8Array(buf);
          const len = bytes.length;
          for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
          return btoa(binary);
        };
        // Periodically commit any pending audio and request response
        if (gemCommitTimerRef.current) {
          window.clearInterval(gemCommitTimerRef.current);
          gemCommitTimerRef.current = null;
        }
        gemCommitTimerRef.current = window.setInterval(() => {
          const sock = gemWsRef.current;
          if (!sock || sock.readyState !== WebSocket.OPEN) return;
          if (!gemHasPendingRef.current) return;
          try {
            sock.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
            sock.send(JSON.stringify({ type: 'response.create', response: { modalities: ['AUDIO'], audio: { encoding: 'LINEAR16', sampleRate: 16000 } } }));
            gemHasPendingRef.current = false;
          } catch {}
        }, 900);
        // Hook mic → worklet → WS
        try {
          const source = ctx.createMediaStreamSource(local);
          node.port.onmessage = (e: MessageEvent) => {
            const sock = gemWsRef.current;
            if (!sock) return;
            if (sock.readyState !== WebSocket.OPEN) return;
            try {
              const b64 = base64FromArrayBuffer(e.data as ArrayBuffer);
              const appendMsg = {
                type: 'input_audio_buffer.append',
                audio: { data: b64, mime_type: 'audio/pcm;rate=16000' },
              };
              sock.send(JSON.stringify(appendMsg));
              gemHasPendingRef.current = true;
            } catch {}
          };
          source.connect(node);
        } catch {}
        setIsListening(true);
        setConnectionState('connected');
      };
      ws.onmessage = (ev: MessageEvent) => {
        // Handle either JSON messages with base64 audio or raw PCM frames
        if (typeof ev.data === 'string') {
          try {
            const text = ev.data as string;
            console.log('[GEMINI] ←', text.slice(0, 200));
            const obj = JSON.parse(text);
            const audioPayloads: string[] = [];
            const collect = (val: any) => {
              if (!val || typeof val !== 'object') return;
              if (val.audio && typeof val.audio === 'object') {
                const a = val.audio;
                if (typeof a.data === 'string') audioPayloads.push(a.data);
              }
              for (const k in val) collect(val[k]);
            };
            collect(obj);
            for (const b64 of audioPayloads) {
              try {
                const bin = atob(b64);
                const len = bin.length;
                const pcm = new Int16Array(len);
                for (let i = 0; i < len; i++) pcm[i] = bin.charCodeAt(i);
                const float = new Float32Array(pcm.length);
                for (let i = 0; i < pcm.length; i++) float[i] = Math.max(-1, Math.min(1, pcm[i] / 0x8000));
                const buf = ctx.createBuffer(1, float.length, 16000);
                buf.copyToChannel(float, 0, 0);
                const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
              } catch {}
            }
          } catch {}
          return;
        }
        if (ev.data instanceof ArrayBuffer) {
          // Fallback: treat as raw PCM16 mono 16k
          try {
            const pcm = new Int16Array(ev.data);
            const float = new Float32Array(pcm.length);
            for (let i = 0; i < pcm.length; i++) float[i] = Math.max(-1, Math.min(1, pcm[i] / 0x8000));
            const buf = ctx.createBuffer(1, float.length, 16000);
            buf.copyToChannel(float, 0, 0);
            const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
          } catch {}
        }
      };
      const handleEnd = () => {
        try { node.port.onmessage = null as any; } catch {}
        try { node.disconnect(); } catch {}
        setConnectionState('stopped');
        setIsListening(false);
        setUseGeminiFallback(true);
      };
      ws.onerror = (e) => { console.warn('[GEMINI] ws error', e); handleEnd(); };
      ws.onclose = (e) => { console.warn('[GEMINI] ws close', e); handleEnd(); };
    } catch (err) {
      console.error('Gemini start error:', err);
      stopGemini();
      setUseGeminiFallback(true);
    }
  };

  useEffect(() => {
    // Center-circle pulse animation that reacts to live mic level
    if (!isListening || !centerCircleRef.current) return;
    let raf: number;
    const animate = () => {
      const el = centerCircleRef.current;
      const micLevel = amplitudeRef.current; // 0..1
      const scale = 0.9 + micLevel * 0.35;
      if (el) {
        el.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setMessage(e.target.value);
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          chatRef.current && 
          buttonRef.current &&
          !chatRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
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
    try { typeof window !== 'undefined' && window.localStorage.setItem('lumina_ai_chat_open', isOpen ? '1' : '0'); } catch {}
  }, [isOpen]);

  // Auto-restart voice after SPA navigation when flagged (debounced)
  useEffect(() => {
    let t: number | null = null;
    try {
      const key = 'lumina_ai_autostart';
      const should = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
      if (should === '1') {
        // one-shot flag
        try { window.sessionStorage.removeItem(key); } catch {}
        if (isVoiceEnabled && !isListening) {
          t = window.setTimeout(() => {
            // small delay so new route mounts fully before RTC init
            startVoice();
          }, 350);
        }
      }
    } catch {}
    return () => { if (t) window.clearTimeout(t); };
  }, [pathname, isVoiceEnabled, isListening]);

  // Resume audio playback on tab visibility (bypass autoplay blocks)
  useEffect(() => {
    const onVis = async () => {
      try {
        if (document.visibilityState === 'visible') {
          try { if (audioRef.current) await audioRef.current.play().catch(() => {}); } catch {}
          try { if (audioContextRef.current && audioContextRef.current.state === 'suspended') await audioContextRef.current.resume().catch(() => {}); } catch {}
        }
      } catch {}
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* From Uiverse.io by Cobp */
        .container-ai-input {
          --perspective: 1000px;
          --translateY: 45px;
          position: fixed;
          bottom: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          z-index: 9999;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          transform-style: preserve-3d;
          pointer-events: none; /* prevent overlay from blocking clicks */
        }

        .container-wrap {
          display: flex;
          align-items: center;
          justify-items: center;
          position: absolute;
          left: 300px;
          top: 340px; /* lowered to avoid overlapping property cards */
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
          width: 3.9rem;
          height: 3.5rem;
          background-image: linear-gradient(135deg, rgba(240,131,54,0.22), rgba(212,175,55,0.18));
          border-radius: 1.2rem;
          transition: all 0.3s ease;
        }

        .container-wrap:hover:after {
          transform: translateX(-50%) translateY(-50%);
          height: 4.2rem;
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
          width: 3.6rem;
          height: 3.6rem;
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
          width: 300px;
          height: 400px;
          padding: 6px;
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

        .chat {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          border-radius: 15px;
          width: 100%;
          height: 100%;
          padding: 4px;
          overflow: hidden;
          background-color: #ffffff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          position: relative; /* for center visualizer */
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
          width: 36px;
          height: 36px;
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
          100% { width: 54px; height: 54px; opacity: 0; }
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
          pointer-events: none; /* do not capture clicks */
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
      `}</style>

      {/* Center voice visualizer styles (Blob morph + voice-reactive scale) */}
      <style jsx global>{`
        .voice-center-blobs { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); width: 240px; height: 240px; pointer-events: none; display: none; filter: drop-shadow(0 0 24px rgba(164,196,255,0.35)); z-index: 0; }
        .voice-center-blobs.on { display: block; }
        .voice-center-blobs .blobs { width: 100%; height: 100%; max-height: 100%; max-width: 100%; }
        .voice-center-blobs svg { position: relative; height: 100%; z-index: 2; }
        .voice-center-blobs .blob { animation: rotate 25s infinite alternate ease-in-out; transform-origin: 50% 50%; opacity: 0.75; }
        .voice-center-blobs .blob.alt { animation-direction: alternate-reverse; opacity: 0.35; }
        .voice-center-blobs .blob path { animation: blob-anim-1 5s infinite alternate cubic-bezier(0.45, 0.2, 0.55, 0.8); transform-origin: 50% 50%; transform: scale(0.8); transition: fill 800ms ease; }
        .voice-center-blobs .blob-1 path { fill: var(--blob-1, #bb74ff); filter: blur(16px); }
        .voice-center-blobs .blob-2 { animation-duration: 18s; animation-direction: alternate-reverse; }
        .voice-center-blobs .blob-2 path { fill: var(--blob-2, #7c7dff); animation-name: blob-anim-2; animation-duration: 7s; filter: blur(12px); transform: scale(0.78); }
        .voice-center-blobs .blob-3 { animation-duration: 23s; }
        .voice-center-blobs .blob-3 path { fill: var(--blob-3, #a0f8ff); animation-name: blob-anim-3; animation-duration: 6s; filter: blur(8px); transform: scale(0.76); }
        .voice-center-blobs .blob-4 { animation-duration: 31s; animation-direction: alternate-reverse; opacity: 0.9; }
        .voice-center-blobs .blob-4 path { fill: var(--blob-4, #ffffff); animation-name: blob-anim-4; animation-duration: 10s; filter: blur(120px); transform: scale(0.5); }
        @keyframes blob-anim-1 { 0% { d: path('M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z'); } 30% { d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z'); } 70% { d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z'); } 100% { d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z'); } }
        @keyframes blob-anim-2 { 0% { d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z'); } 40% { d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z'); } 80% { d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z'); } 100% { d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z'); } }
        @keyframes blob-anim-3 { 0% { d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z'); } 35% { d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z'); } 75% { d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z'); } 100% { d: path('M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z'); } }
        @keyframes blob-anim-4 { 0% { d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z'); } 30% { d: path('M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z'); } 70% { d: path('M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z'); } 100% { d: path('M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z'); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      

      <div className="container-ai-input">
        {/* Mouse tracking areas */}
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="area" />
        ))}

        <div className="container-wrap" onClick={handleToggle} ref={buttonRef}>
          <div className="card">
            <div className="background-blur-balls">
              <div className="balls">
                <div className="ball violet"></div>
                <div className="ball green"></div>
                <div className="ball rosa"></div>
                <div className="ball cyan"></div>
            </div>
          </div>
          
            <div className="content-card">
              <div className="background-blur-card"></div>
                </div>

            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
              </div>

            <div className="eyes happy">
              <svg className="eye-arc" viewBox="0 0 24 12" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9 C7 3, 17 3, 21 9" strokeLinecap="round" />
          </svg>
              <svg className="eye-arc" viewBox="0 0 24 12" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9 C7 3, 17 3, 21 9" strokeLinecap="round" />
              </svg>
                    </div>
                  </div>
                </div>
              </div>

      {/* Chat Window */}
      <div className={`container-ai-chat ${isOpen ? 'open' : ''}`} ref={chatRef}>
        <div className="chat">
          {/* Chat Header */}
          <div className="chat-header">
            <h3 className="chat-title">AI Assistant</h3>
            <button
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div className="chat-bot">
            <textarea
              value={message}
              onChange={handleInputChange}
              placeholder="რით შემიძლია დაგეხმაროთ?"
              onClick={(e) => e.stopPropagation()}
            />
                </div>
          {/* Function-calling property cards (non-intrusive, inside chat) */}
          {isFunctionCallingEnabled && showInlineResults && searchResults.length > 0 && (
            <div style={{ padding: '8px 10px', display: 'grid', gap: 8 }}>
              {lastSearchSummary ? (
                <div style={{ fontSize: 12, color: '#666' }}>შედეგები: {lastSearchSummary}</div>
              ) : null}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {searchResults.map((p) => (
                  <div key={p.id} style={{ display: 'flex', gap: 8, border: '1px solid #f0f0f0', borderRadius: 8, padding: 6 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', flex: '0 0 auto', background: '#fafafa' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.type} width={60} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#222' }}>{p.type} · {p.address}</div>
                      <div style={{ fontSize: 12, color: '#444' }}>{p.bedrooms} ს. {p.bathrooms} ს/წ · {p.sqft} მ²</div>
                      <div style={{ fontSize: 12, color: '#0f172a' }}>{p.price.toLocaleString('en-US')} ₾</div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          {isVoiceEnabled && (
            <div ref={centerCircleRef} className={`voice-center-blobs ${isListening ? 'on' : ''}`} aria-hidden="true">
              {isListening && (
                <div className="blobs palette-4">
                  <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g className="blob blob-1">
                      <path d="M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z" />
                    </g>
                    <g className="blob blob-2 alt">
                      <path d="M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z" />
                    </g>
                    <g className="blob blob-3">
                      <path d="M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z" />
                    </g>
                    <g className="blob blob-4 alt">
                      <path d="M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z" />
                    </g>
                  </svg>
            </div>
          )}
            </div>
          )}
          <div className="options">
            <div className="btns-add">
              {/* Simple VU meters for mic (left) and AI (right) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div title="Mic level" style={{ width: 54, height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(micLevel * 100)}%`, height: '100%', background: '#F08336' }} />
                </div>
                <div title="AI level" style={{ width: 54, height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(aiLevel * 100)}%`, height: '100%', background: '#D4AF37' }} />
              </div>
                {/* Force button removed per UX — rely on VAD/auto responses */}
                <button type="button" title={isMuted ? 'Unmute mic' : 'Mute mic'} onClick={(e) => { e.stopPropagation(); toggleMute(); }} style={{
                  border: '1px solid #eee', background: isMuted ? '#fee' : '#fff', borderRadius: 6, padding: '2px 6px', cursor: 'pointer'
                }}>{isMuted ? 'unmute' : 'mute'}</button>
              </div>
              {/* If ?gemini=1 use Gemini voice button (text STT + TTS), else use OpenAI WebRTC */}
              {isGeminiEnabled ? (
                useGeminiFallback ? (
                  <GeminiVoiceButton locale="ka-GE" />
                ) : (
              <button
                    type="button"
                    aria-label={isListening ? 'ხმის შეწყვეტა' : 'Gemini Live - ხმის ჩართვა'}
                    title={isListening ? 'ხმის შეწყვეტა' : 'Gemini Live - ხმის ჩართვა'}
                    onClick={(e) => { e.stopPropagation(); isListening ? stopGemini() : startGemini(); }}
                  >
                    <div className="voice-mic" aria-hidden="true">
                      <div className="echo">
                        <span></span>
                        <span></span>
                        <span></span>
                </div>
                      <Microphone className="mic" size={16} weight="fill" />
              </div>
                  </button>
                )
              ) : (
              <button
                type="button"
                aria-label={isVoiceEnabled ? (isListening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა') : 'ტესტ რეჟიმი — URL-ში ?voice=1'}
                title={isVoiceEnabled ? (isListening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა') : 'ტესტ რეჟიმი — URL-ში ?voice=1'}
                onClick={(e) => { e.stopPropagation(); isListening ? stopVoice() : startVoice(); }}
              >
                <div className="voice-mic" aria-hidden="true">
                  <div className="echo">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <Microphone className="mic" size={16} weight="fill" />
                </div>
              </button>
              )}
              <button type="button" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
              </button>
              <button type="button" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
              </button>
              </div>
            <button 
              type="submit" 
              className="btn-submit"
              onClick={handleSubmit}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Hidden audio element for remote playback */}
        <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />
    </div>
    </>
  );
} 