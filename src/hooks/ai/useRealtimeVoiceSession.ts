import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { PropertyFunctionCallResult } from './usePropertySearch';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'stopped';

export interface UseRealtimeVoiceSessionOptions {
  isVoiceEnabled: boolean;
  isFunctionCallingEnabled: boolean;
  isModeA: boolean;
  isModeB: boolean;
  useClientVad: boolean;
  handleFunctionCall: (fnName: string, argsText: string, context?: { transport?: 'realtime' | 'websocket' }) => PropertyFunctionCallResult;
  onTranscript: (transcript: string) => void;
}

export interface UseRealtimeVoiceSessionResult {
  isListening: boolean;
  isMuted: boolean;
  connectionState: ConnectionState;
  remainingMs: number;
  micLevel: number;
  aiLevel: number;
  startVoice: () => Promise<void>;
  stopVoice: () => Promise<void>;
  toggleMute: () => void;
  requestModelResponse: () => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  centerCircleRef: RefObject<HTMLDivElement | null>;
}

export const useRealtimeVoiceSession = ({
  isVoiceEnabled,
  isFunctionCallingEnabled,
  isModeA,
  isModeB,
  useClientVad,
  handleFunctionCall,
  onTranscript,
}: UseRealtimeVoiceSessionOptions): UseRealtimeVoiceSessionResult => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [remainingMs, setRemainingMs] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [aiLevel, setAiLevel] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const centerCircleRef = useRef<HTMLDivElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const keepaliveTimerRef = useRef<number | null>(null);
  const disconnectedTimerRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const dcHealthCheckRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const amplitudeRef = useRef<number>(0);
  const remoteAmplitudeRef = useRef<number>(0);
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
  const userVoiceBufRef = useRef<string>('');

  const requestModelResponse = useCallback(() => {
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
      dc.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      dc.send(JSON.stringify({ type: 'response.create', response: { max_output_tokens: 4096 } }));
      console.log('[OAI] → commit + response.create');
      inFlightResponseRef.current = true;

      window.setTimeout(() => {
        if (inFlightResponseRef.current) {
          console.warn('[OAI] ⚠️ WATCHDOG: Force reset inFlightResponseRef after 15s timeout');
          inFlightResponseRef.current = false;
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
  }, []);

  const toggleMute = useCallback(() => {
    try {
      const stream = localStreamRef.current;
      const track = stream?.getAudioTracks?.()[0];
      if (!track) return;
      const next = !track.enabled;
      track.enabled = next;
      setIsMuted(!next);
    } catch {}
  }, []);

  const stopVoice = useCallback(async () => {
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
  }, []);

  const startVoice = useCallback(async () => {
    if (!isVoiceEnabled) {
      console.warn('Voice feature is disabled. Add ?voice=1 to URL to enable.');
      return;
    }
    if (isListening || peerRef.current) return;

    inFlightResponseRef.current = false;
    console.log('[OAI] Starting new voice session, resetting inFlightResponseRef');

    setConnectionState('connecting');
    try {
      sessionGenRef.current += 1;
      const tokenRes = await fetch('/api/realtime/token');
      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        throw new Error('Token endpoint error: ' + text);
      }
      const tokenJson = await tokenRes.json();
      const ephemeralToken: string | undefined = tokenJson?.client_secret?.value;
      const model: string = tokenJson?.model || 'gpt-realtime';
      if (!ephemeralToken) throw new Error('Missing ephemeral token');

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
        setConnectionState(pc.connectionState as ConnectionState);
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
              if (disconnectedTimerRef.current) {
                window.clearTimeout(disconnectedTimerRef.current);
              }
              disconnectedTimerRef.current = null;
            }, 2000);
          }
        }
      };
      pc.addEventListener('icecandidateerror', (e) => {
        console.warn('ICE candidate error:', e);
      });

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
          const audioSender = senders.find((s) => s.track?.kind === 'audio');

          console.log('[RTC][stats]', {
            state: pc.connectionState,
            ice: pc.iceConnectionState,
            pair: selectedPair ? {
              state: selectedPair.state,
              local: selectedPair.localCandidateId,
              remote: selectedPair.remoteCandidateId,
              currentRtt: selectedPair.currentRoundTripTime,
            } : null,
            recv: audioRecv ? {
              bytes: audioRecv.bytesReceived,
              jitter: audioRecv.jitter,
              packetsLost: audioRecv.packetsLost,
            } : null,
            send: audioSend ? {
              bytes: audioSend.bytesSent,
              packets: audioSend.packetsSent,
              retransmits: audioSend.retransmittedPacketsSent,
              trackEnabled: audioSender?.track?.enabled,
              trackMuted: audioSender?.track?.muted,
              trackReadyState: audioSender?.track?.readyState,
            } : null,
          });

          const now = Date.now();
          const recvBytes = (audioRecv && typeof audioRecv.bytesReceived === 'number') ? audioRecv.bytesReceived : 0;
          if (pc.connectionState === 'connected') {
            if (recvBytes > lastRecvBytesRef.current) {
              lastRecvBytesRef.current = recvBytes;
              lastRecvAtRef.current = now;
              nudgeSentAtRef.current = 0;
            } else if (!restartingRef.current && (now - lastRecvAtRef.current) > 30000) {
              console.warn('[RTC][watchdog] No remote audio growth for 30s. Restarting ICE...');
              try { (pc as any).restartIce?.(); } catch {}
            }
          }
        } catch {}
      }, 4000);

      pc.ontrack = (event) => {
        console.log('[AUDIO] 🔊 Remote track received:', {
          kind: event.track.kind,
          id: event.track.id,
          readyState: event.track.readyState,
          muted: event.track.muted,
          streams: event.streams.length,
        });
        if (event.track.muted) {
          console.warn('[AUDIO] ⚠️ Remote track is muted! This is expected initially.');
        }
        event.track.enabled = true;

        if (!audioRef.current) {
          console.warn('[AUDIO] ⚠️ audioRef.current is null!');
          return;
        }
        const [remoteStream] = event.streams;
        audioRef.current.srcObject = remoteStream;
        audioRef.current.volume = 1.0;
        audioRef.current.muted = false;
        audioRef.current.play().then(() => {
          console.log('[AUDIO] ✅ Audio playback started successfully', {
            volume: audioRef.current?.volume,
            muted: audioRef.current?.muted,
            paused: audioRef.current?.paused,
          });
        }).catch((err) => {
          console.error('[AUDIO] ⚠️ Audio playback failed:', err);
        });

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

      const local = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as MediaTrackConstraints,
      });
      localStreamRef.current = local;
      const localTrack = local.getAudioTracks()[0];
      if (localTrack) {
        localTrack.enabled = true;
        pc.addTrack(localTrack, local);
      }
      setIsMuted(false);

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
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          const level = Math.min(1, Math.max(0, rms * 2));
          amplitudeRef.current = level;
          setMicLevel(level);

          if (useClientVad) {
            const startThresh = 0.12;
            const stopThresh = 0.06;
            const stopHoldMs = 1800;
            const minSpeechDurationMs = 900;
            const commitCooldownMs = 1200;

            if (!isSpeakingRef.current && level > startThresh) {
              isSpeakingRef.current = true;
              speechStartTimeRef.current = Date.now();
              if (silenceTimerRef.current) { window.clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
              if (isModeB) {
                try {
                  const dc = oaiDcRef.current;
                  if (dc && dc.readyState === 'open') {
                    dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
                    console.log('[OAI][client-vad] start → buffer.clear');
                  }
                } catch {}
              }
            }

            if (isSpeakingRef.current && level > startThresh && silenceTimerRef.current) {
              window.clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }

            if (isSpeakingRef.current && level < stopThresh && !silenceTimerRef.current) {
              silenceTimerRef.current = window.setTimeout(() => {
                const currentLevel = amplitudeRef.current;
                if (currentLevel >= stopThresh) { silenceTimerRef.current = null; return; }

                const speechDuration = Date.now() - speechStartTimeRef.current;
                const sinceLastCommit = Date.now() - lastCommitAtRef.current;

                if (speechDuration < minSpeechDurationMs) {
                  try { console.log('[OAI][client-vad] speech too short → skip commit', speechDuration); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }
                if (sinceLastCommit < commitCooldownMs) {
                  try { console.log('[OAI][client-vad] debounce commit (cooldown)'); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }

                const dc = oaiDcRef.current;
                if (!dc || dc.readyState !== 'open') {
                  try { console.warn('[OAI][client-vad] DC not open → skip commit'); } catch {}
                  isSpeakingRef.current = false; silenceTimerRef.current = null; return;
                }

                isSpeakingRef.current = false;
                if (silenceTimerRef.current) {
                  window.clearTimeout(silenceTimerRef.current);
                }
                silenceTimerRef.current = null;
                lastCommitAtRef.current = Date.now();
                try { console.log('[OAI][client-vad] stop detected → commit'); } catch {}
                requestModelResponse();
              }, stopHoldMs);
            }
          }

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

      const oaiDc = pc.createDataChannel('oai-events', { ordered: true });
      oaiDcRef.current = oaiDc;
      console.log('[OAI] DataChannel created (client-side)', { label: oaiDc.label, readyState: oaiDc.readyState, id: oaiDc.id });

      oaiDc.onopen = () => {
        console.log('[OAI] ✅ DataChannel OPENED!', { readyState: oaiDc.readyState });
        if (useClientVad) {
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
          wasClean: ev?.wasClean,
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
          iceConnectionState: pc.iceConnectionState,
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
          if (msg && msg.type) {
            console.log(`[OAI] ← ${msg.type}`, {
              timestamp: new Date().toISOString(),
              msgKeys: Object.keys(msg),
              inFlight: inFlightResponseRef.current,
            });
          }

          if (msg && typeof msg === 'object') {
            const type: string = String(msg.type || '');
            const transcript: string | undefined =
              (typeof msg.transcript === 'string' && msg.transcript) ||
              (typeof msg.text === 'string' && msg.text) ||
              undefined;
            if ((type.includes('input_audio_transcription') || type === 'response.input_text.delta') && transcript) {
              onTranscript(transcript);
            }
            if (type === 'conversation.item.input_audio_transcription.delta' && typeof (msg as any).delta === 'string') {
              try { userVoiceBufRef.current += (msg as any).delta; } catch {}
            }
            if (type === 'conversation.item.input_audio_transcription.completed') {
              const full = (typeof (msg as any).transcript === 'string' && (msg as any).transcript) || userVoiceBufRef.current || '';
              userVoiceBufRef.current = '';
              if (full) onTranscript(full);
            }
          }

          if (msg && msg.type === 'input_audio_buffer.speech_started') {
            console.log('[OAI] ← input_audio_buffer.speech_started');
          }
          if (msg && msg.type === 'input_audio_buffer.speech_stopped' && isModeB) requestModelResponse();

          if (msg && msg.type === 'response.created') {
            console.log('[OAI] ← response.created', { id: msg.response?.id });
          }
          if (msg && msg.type === 'response.done') {
            console.log('[OAI] ← response.done', {
              status: msg?.response?.status || '',
              id: msg?.response?.id,
              output: msg?.response?.output?.length || 0,
            });
            inFlightResponseRef.current = false;
            if (isModeB) {
              try {
                const dc = oaiDcRef.current;
                if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
                console.log('[OAI] → buffer cleared after response.done');
              } catch {}
            }
          }
          if (msg && msg.type === 'response.output_audio.done') {
            console.log('[OAI] ← response.output_audio.done');
            inFlightResponseRef.current = false;
            if (isModeB) {
              try {
                const dc = oaiDcRef.current;
                if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
                console.log('[OAI] → buffer cleared after audio.done');
              } catch {}
            }
          }
          if (msg && msg.type === 'response.error') {
            console.error('[OAI] ← response.error', msg.error);
            inFlightResponseRef.current = false;
            if (isModeB) {
              try {
                const dc = oaiDcRef.current;
                if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
                console.log('[OAI] → buffer cleared after error');
              } catch {}
            }
          }

          if (!isFunctionCallingEnabled) return;

          const dc = oaiDcRef.current;
          const sendToolResult = (callId: string, payload: any) => {
            if (!dc || dc.readyState !== 'open') return;
            const toolResultEvt = {
              type: 'conversation.item.create',
              item: {
                type: 'tool_result',
                call_id: callId,
                content: [
                  { type: 'output_text', text: JSON.stringify(payload) },
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

          if (msg.type === 'response.function_call.created' && msg.call_id) {
            const prev = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            prev.name = msg.name || prev.name;
            toolArgsRef.current.set(msg.call_id, prev);
          }
          if (msg.type === 'response.function_call_arguments.delta' && msg.call_id && typeof msg.delta === 'string') {
            const prev = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            prev.argsText += msg.delta;
            toolArgsRef.current.set(msg.call_id, prev);
          }
          if (msg.type === 'response.function_call_arguments.done' && msg.call_id) {
            const acc = toolArgsRef.current.get(msg.call_id) || { argsText: '' };
            const fnName = (acc.name || msg.name || '').toString();
            const argsText = acc.argsText || '';
            toolArgsRef.current.delete(msg.call_id);
            const result = handleFunctionCall(fnName, argsText, { transport: 'realtime' });
            if (result.handled) {
              sendToolResult(msg.call_id, result.payload ?? { ok: true });
            }
          }

          if (msg.type === 'tool_call' && msg.call_id) {
            const name = msg.name;
            const argsText = typeof msg.arguments === 'string' ? msg.arguments : JSON.stringify(msg.arguments || {});
            const result = handleFunctionCall(name, argsText, { transport: 'websocket' });
            if (result.handled) {
              sendToolResult(msg.call_id, result.payload ?? { ok: true });
            }
          }
        } catch {
          // ignore non-JSON keepalives
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const waitForIceGatheringComplete = (rtc: RTCPeerConnection, timeoutMs = 2500) =>
        new Promise<void>((resolve) => {
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
          sdpAbortRef.current?.signal.addEventListener('abort', () => {
            window.clearTimeout(timer);
            rtc.removeEventListener('icegatheringstatechange', onChange);
            resolve();
          });
        });
      await waitForIceGatheringComplete(pc);

      const ac = new AbortController();
      sdpAbortRef.current = ac;
      const sdpRes = await fetch('/api/realtime/sdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'x-ephemeral-token': ephemeralToken,
          'x-model': model,
        },
        body: offer.sdp,
        signal: ac.signal,
      });
      if (!sdpRes.ok) {
        const text = await sdpRes.text();
        throw new Error('SDP exchange failed: ' + text);
      }
      const answer = await sdpRes.text();
      if (pc.signalingState !== 'closed') {
        await pc.setRemoteDescription({ type: 'answer', sdp: answer });
      }

      keepaliveTimerRef.current = window.setInterval(() => {
        const dc = oaiDcRef.current;
        if (!dc || dc.readyState !== 'open') return;
        try { dc.send(JSON.stringify({ type: 'ping' })); } catch {}
      }, 2500);

      timerRef.current = window.setInterval(() => {
        const limitMs = 55 * 60 * 1000;
        const now = Date.now();
        const startAt = lastCommitAtRef.current || now;
        const maxMs = Math.max(0, limitMs - (now - startAt));
        setRemainingMs(maxMs);
        const dc = oaiDcRef.current;
        if (!dc || dc.readyState !== 'open') {
          if (!nudgeSentAtRef.current || now - nudgeSentAtRef.current > 10000) {
            nudgeSentAtRef.current = now;
            try {
              console.warn('[OAI] ⚠️ Nudging DataChannel to keep alive (state mismatch)');
              const ping = { type: 'ping' };
              dc?.send(JSON.stringify(ping));
            } catch {}
          }
        }
      }, 1000);

      setIsListening(true);
      setConnectionState('connected');
    } catch (err) {
      console.error('[OAI] Voice session start failed:', err);
      await stopVoice();
    }
  }, [
    handleFunctionCall,
    isFunctionCallingEnabled,
    isListening,
    isModeB,
    isVoiceEnabled,
    onTranscript,
    requestModelResponse,
    stopVoice,
    useClientVad,
  ]);

  useEffect(() => {
    if (!isListening || !centerCircleRef.current) return;
    let raf: number;
    const animate = () => {
      const el = centerCircleRef.current;
      const level = amplitudeRef.current;
      const scale = 0.9 + level * 0.35;
      if (el) {
        el.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isListening]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  return {
    isListening,
    isMuted,
    connectionState,
    remainingMs,
    micLevel,
    aiLevel,
    startVoice,
    stopVoice,
    toggleMute,
    requestModelResponse,
    audioRef,
    centerCircleRef,
  };
};


