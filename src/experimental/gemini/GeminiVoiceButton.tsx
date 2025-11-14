'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Microphone } from '@phosphor-icons/react';

interface GeminiVoiceButtonProps {
  locale?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

export function GeminiVoiceButton({ locale = 'ka-GE', onTranscript, onResponse }: GeminiVoiceButtonProps) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const apiKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const updateVoices = () => setVoices(window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    }
  }, []);

  useEffect(() => {
    try {
      const fromEnv = (process as any)?.env?.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined;
      const fromStorage = typeof window !== 'undefined' ? window.sessionStorage.getItem('GEMINI_K') : null;
      apiKeyRef.current = fromEnv || fromStorage || null;
    } catch {}
  }, []);

  const georgianVoice = useMemo(() => {
    if (!voices.length) return undefined;
    const exact = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith('ka'));
    if (exact) return exact;
    const generic = voices.find((voice) => (voice.lang || '').toLowerCase().includes('ka'));
    return generic;
  }, [voices]);

  useEffect(() => {
    return () => {
      try { (recognitionRef.current as any)?.stop?.(); } catch {}
      if (utteranceRef.current) {
        try { window.speechSynthesis?.cancel(); } catch {}
      }
    };
  }, []);

  const speak = (text: string) => {
    try {
      if (!('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      if (georgianVoice) utterance.voice = georgianVoice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  };

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setError(null);
    if (listening) {
      try { (recognitionRef.current as any)?.stop?.(); } catch {}
      setListening(false);
      return;
    }

    const RecognitionCtor: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!RecognitionCtor) {
      const typed = window.prompt('მიუთითე კითხვა ტექსტურად (SpeechRecognition მიუწვდომელია)');
      if (typed && typed.trim()) await askGemini(typed.trim());
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = locale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = async (ev: any) => {
      try {
        const transcript: string = ev.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          onTranscript?.(transcript);
          await askGemini(transcript);
        }
      } finally {
        setListening(false);
      }
    };
    recognition.onerror = (ev: any) => {
      setError(ev?.error || 'Recognition error');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    try {
      setListening(true);
      recognition.start();
    } catch {
      setError('Recorder start failed');
      setListening(false);
    }
  };

  async function askGemini(text: string) {
    try {
      if (!apiKeyRef.current) {
        const entered = typeof window !== 'undefined' ? window.prompt('ჩაწერე Gemini API key (დროებით, მხოლოდ ტესტისთვის):') : '';
        if (entered && entered.trim()) {
          apiKeyRef.current = entered.trim();
          try { window.sessionStorage.setItem('GEMINI_K', apiKeyRef.current); } catch {}
        }
      }

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKeyRef.current ? { 'x-gemini-api-key': apiKeyRef.current } : {}),
        },
        body: JSON.stringify({ text, ...(apiKeyRef.current ? { apiKey: apiKeyRef.current } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data?.detail?.error?.message || data?.error || 'Gemini error';
        setError(msg);
        speak('სამწუხაროდ, მოხდა შეცდომა.');
        return;
      }
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      onResponse?.(reply);
      if (reply) speak(reply);
    } catch {
      setError('ქსელის შეცდომა');
      speak('ქსელის შეცდომა.');
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        aria-label={listening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა'}
        title={listening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა'}
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
      {error && <div className="text-[10px] text-red-600 mt-1 max-w-[180px]">{error}</div>}
    </div>
  );
}


