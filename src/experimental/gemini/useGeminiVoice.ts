import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';

export interface UseGeminiVoiceOptions {
  isEnabled: boolean;
  centerCircleRef?: RefObject<HTMLDivElement | null>;
}

export interface UseGeminiVoiceResult {
  isListening: boolean;
  useFallback: boolean;
  amplitudeRef: MutableRefObject<number>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  resumeAudioContext: () => Promise<void>;
}

const GEMINI_WORKLET = `
  class PCMDownsamplerProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this._ratio = sampleRate / 16000;
    }
    process(inputs) {
      const input = inputs[0];
      if (!input || !input[0]) return true;
      const channel = input[0];
      const step = Math.max(1, Math.floor(this._ratio));
      const out = new Int16Array(Math.floor(channel.length / step));
      let outIndex = 0;
      for (let i = 0; i < channel.length; i += step) {
        let sample = channel[i];
        sample = Math.max(-1, Math.min(1, sample));
        out[outIndex++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      this.port.postMessage(out.buffer, [out.buffer]);
      return true;
    }
  }
  registerProcessor('pcm-downsampler', PCMDownsamplerProcessor);
`;

export const useGeminiVoice = ({ isEnabled, centerCircleRef }: UseGeminiVoiceOptions): UseGeminiVoiceResult => {
  const [isListening, setIsListening] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const amplitudeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const hasPendingCommitRef = useRef<boolean>(false);

  const cleanupVisual = useCallback(() => {
    if (!centerCircleRef?.current) return;
    centerCircleRef.current.style.transform = 'translate(-50%, -50%) scale(0.9)';
  }, [centerCircleRef]);

  const stop = useCallback(async () => {
    setIsListening(false);
    const ws = wsRef.current;
    wsRef.current = null;
    if (commitTimerRef.current) {
      window.clearInterval(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    hasPendingCommitRef.current = false;
    try { workletNodeRef.current?.port?.close?.(); } catch {}
    try { workletNodeRef.current?.disconnect(); } catch {}
    workletNodeRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    amplitudeRef.current = 0;
    cleanupVisual();
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {}
    }
  }, [cleanupVisual]);

  const resumeAudioContext = useCallback(async () => {
    try {
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
    } catch {}
  }, []);

  const start = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!isEnabled) {
      setUseFallback(true);
      return;
    }
    if (isListening) return;

    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;

      const workletBlob = new Blob([GEMINI_WORKLET], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(workletBlob);
      await ctx.audioWorklet.addModule(workletUrl);

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as MediaTrackConstraints,
      });
      streamRef.current = localStream;

      try {
        const source = ctx.createMediaStreamSource(localStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          analyserRef.current.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          amplitudeRef.current = Math.min(1, Math.max(0, rms * 2));
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {}

      const downsampler = new AudioWorkletNode(ctx, 'pcm-downsampler');
      workletNodeRef.current = downsampler;

      const liveModel = process.env.NEXT_PUBLIC_GEMINI_LIVE_MODEL || 'gemini-2.5-flash';
      const proxyUrl = process.env.NEXT_PUBLIC_GEMINI_PROXY_WS || 'ws://localhost:3001';

      let gemKey: string | null =
        (process as any)?.env?.NEXT_PUBLIC_GEMINI_API_KEY ||
        (typeof window !== 'undefined' ? window.sessionStorage.getItem('GEMINI_K') : null);
      if (!gemKey && typeof window !== 'undefined') {
        const entered = window.prompt('ჩაწერე Gemini API key (დროებით, მხოლოდ ტესტისთვის):');
        if (entered && entered.trim()) {
          gemKey = entered.trim();
          try { window.sessionStorage.setItem('GEMINI_K', gemKey); } catch {}
        }
      }
      const keyParam = gemKey ? `&key=${encodeURIComponent(gemKey)}` : '';
      const wsUrl = `${proxyUrl}?model=${encodeURIComponent(liveModel)}${keyParam}`;
      console.log('[GEMINI] ws connect →', wsUrl);
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      const base64FromArrayBuffer = (buf: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buf);
        const len = bytes.length;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
      };

      ws.onopen = () => {
        console.log('[GEMINI] ws open');
        setIsListening(true);
        setUseFallback(false);
        hasPendingCommitRef.current = false;

        const init = {
          type: 'session.start',
          model: liveModel,
          config: {
            systemInstruction: 'ქართულენოვანი უძრავი ქონების ასისტენტი Lumina Estate-ზე. ილაპარაკე მოკლედ, თბილად და პროფესიონალურად.',
            audio: { encoding: 'LINEAR16', sampleRate: 16000, language: 'ka-GE' },
            response: { audio: { encoding: 'LINEAR16', sampleRate: 16000 } },
          },
        } as any;
        try { ws.send(JSON.stringify(init)); } catch (e) { console.warn('[GEMINI] start send error', e); }

        if (commitTimerRef.current) {
          window.clearInterval(commitTimerRef.current);
          commitTimerRef.current = null;
        }
        commitTimerRef.current = window.setInterval(() => {
          const sock = wsRef.current;
          if (!sock || sock.readyState !== WebSocket.OPEN) return;
          if (!hasPendingCommitRef.current) return;
          try {
            sock.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
            sock.send(JSON.stringify({
              type: 'response.create',
              response: { modalities: ['AUDIO'], audio: { encoding: 'LINEAR16', sampleRate: 16000 } },
            }));
            hasPendingCommitRef.current = false;
          } catch {}
        }, 900);

        try {
          const source = ctx.createMediaStreamSource(localStream);
          downsampler.port.onmessage = (event: MessageEvent) => {
            const sock = wsRef.current;
            if (!sock || sock.readyState !== WebSocket.OPEN) return;
            try {
              const b64 = base64FromArrayBuffer(event.data as ArrayBuffer);
              sock.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: { data: b64, mime_type: 'audio/pcm;rate=16000' },
              }));
              hasPendingCommitRef.current = true;
            } catch {}
          };
          source.connect(downsampler);
        } catch {}
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (!audioCtxRef.current) return;
        const ctxCurrent = audioCtxRef.current;
        if (typeof ev.data === 'string') {
          try {
            const text = ev.data as string;
            console.log('[GEMINI] ←', text.slice(0, 200));
            const obj = JSON.parse(text);
            const payloads: string[] = [];
            const collect = (val: any) => {
              if (!val || typeof val !== 'object') return;
              if (val.audio && typeof val.audio === 'object') {
                const audio = val.audio;
                if (typeof audio.data === 'string') payloads.push(audio.data);
              }
              for (const key in val) collect(val[key]);
            };
            collect(obj);
            for (const b64 of payloads) {
              try {
                const binary = atob(b64);
                const pcm = new Int16Array(binary.length);
                for (let i = 0; i < binary.length; i++) pcm[i] = binary.charCodeAt(i);
                const float = new Float32Array(pcm.length);
                for (let i = 0; i < pcm.length; i++) float[i] = Math.max(-1, Math.min(1, pcm[i] / 0x8000));
                const buffer = ctxCurrent.createBuffer(1, float.length, 16000);
                buffer.copyToChannel(float, 0, 0);
                const src = ctxCurrent.createBufferSource();
                src.buffer = buffer;
                src.connect(ctxCurrent.destination);
                src.start();
              } catch {}
            }
          } catch {}
          return;
        }
        if (ev.data instanceof ArrayBuffer) {
          try {
            const pcm = new Int16Array(ev.data);
            const float = new Float32Array(pcm.length);
            for (let i = 0; i < pcm.length; i++) float[i] = Math.max(-1, Math.min(1, pcm[i] / 0x8000));
            const buffer = ctxCurrent.createBuffer(1, float.length, 16000);
            buffer.copyToChannel(float, 0, 0);
            const src = ctxCurrent.createBufferSource();
            src.buffer = buffer;
            src.connect(ctxCurrent.destination);
            src.start();
          } catch {}
        }
      };

      const handleEnd = () => {
        setUseFallback(true);
        void stop();
      };
      ws.onerror = (e) => { console.warn('[GEMINI] ws error', e); handleEnd(); };
      ws.onclose = (e) => { console.warn('[GEMINI] ws close', e); handleEnd(); };
    } catch (error) {
      console.error('Gemini start error:', error);
      await stop();
      setUseFallback(true);
    }
  }, [isEnabled, isListening, stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return {
    isListening,
    useFallback,
    amplitudeRef,
    start,
    stop,
    resumeAudioContext,
  };
};


