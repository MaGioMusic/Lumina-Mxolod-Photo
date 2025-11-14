'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { ChatLauncherButton } from './chatLauncherButton';
import { ChatWindow } from './chatWindow';
import { usePropertySearch } from '@/hooks/ai/usePropertySearch';
import { useRealtimeVoiceSession } from '@/hooks/ai/useRealtimeVoiceSession';

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
  const isClientVadEnabled = searchParams.get('clientvad') === '1';
  // Realtime mode toggle: A = server VAD only; B = manual (VAD off + client-side VAD)
  const rtMode = (searchParams.get('rtmode') || 'a').toLowerCase();
  const isModeB = rtMode === 'b';
  const useClientVad = isModeB || isClientVadEnabled;
  const isModeA = !isModeB;
  // Function-calling: default from env, URL can disable with ?fc=0
  const fcEnv = (process.env.NEXT_PUBLIC_FC_DEFAULT || '1');
  const fcDefaultOn = fcEnv !== '0';
  const isFunctionCallingEnabled = searchParams.get('fc') === '0' ? false : fcDefaultOn;
  // NEW: Force WebSocket mode instead of WebRTC (?ws=1)

  const {
    searchResults,
    lastSearchSummary,
    handleFunctionCall,
  } = usePropertySearch({ isChatOpen: isOpen });

  const [lastTranscript, setLastTranscript] = useState('');

  const {
    isListening: realtimeListening,
    isMuted,
    startVoice: startRealtimeVoice,
    stopVoice: stopRealtimeVoice,
    toggleMute,
    audioRef,
    centerCircleRef,
  } = useRealtimeVoiceSession({
    isVoiceEnabled,
    isFunctionCallingEnabled,
    isModeA,
    isModeB,
    useClientVad,
    handleFunctionCall,
    onTranscript: setLastTranscript,
  });

  const isListening = realtimeListening;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
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
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lumina_ai_chat_open', isOpen ? '1' : '0');
      }
    } catch {}
  }, [isOpen]);

  // Auto-restart voice after SPA navigation when flagged (debounced)
  // (moved below after voice helper definitions)

  // Resume audio playback on tab visibility (bypass autoplay blocks)
  useEffect(() => {
    const onVis = async () => {
    if (document.visibilityState === 'visible') {
      try {
        if (audioRef.current) await audioRef.current.play().catch(() => {});
      } catch {}
    }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [audioRef]);

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
                try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                  router.push('/properties');
                }
  }, [message, isOpen, router]);

  // Additional fallback: navigate based on latest voice transcript
  useEffect(() => {
    if (matchesNavigateTrigger(lastTranscript)) {
                try { window.sessionStorage.setItem('lumina_ai_autostart', isOpen ? '1' : '0'); } catch {}
                router.push('/properties');
    }
  }, [lastTranscript, isOpen, router]);

  const startVoice = async () => {
    await startRealtimeVoice();
  };

  const stopVoice = async () => {
    await stopRealtimeVoice();
  };

  useEffect(() => {
    let t: number | null = null;
    try {
      const key = 'lumina_ai_autostart';
      const should = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
      if (should === '1') {
        try { window.sessionStorage.removeItem(key); } catch {}
        if (isVoiceEnabled && !realtimeListening) {
          t = window.setTimeout(() => {
            void startRealtimeVoice();
          }, 350);
        }
      }
    } catch {}
    return () => { if (t) window.clearTimeout(t); };
  }, [pathname, isVoiceEnabled, realtimeListening, startRealtimeVoice]);

  return (
    <>
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
          width: 240px;
          height: 320px;
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
      `}</style>

      

      <ChatLauncherButton isOpen={isOpen} onToggle={handleToggle} buttonRef={buttonRef} />

      <ChatWindow
        isOpen={isOpen}
        chatRef={chatRef}
        message={message}
        onMessageChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={() => setIsOpen(false)}
        isFunctionCallingEnabled={isFunctionCallingEnabled}
        showInlineResults={showInlineResults}
        searchResults={searchResults}
        lastSearchSummary={lastSearchSummary}
        isVoiceEnabled={isVoiceEnabled}
        centerCircleRef={centerCircleRef}
        isListening={isListening}
        onStartVoice={startVoice}
        onStopVoice={stopVoice}
        toggleMute={toggleMute}
        isMuted={isMuted}
        audioRef={audioRef}
      />
    </>
  );
} 
