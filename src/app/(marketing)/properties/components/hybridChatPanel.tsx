'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Paperclip, Globe, Microphone, MicrophoneSlash, PaperPlaneRight, X } from '@phosphor-icons/react';
import { ChatMessageComponent, type ChatMessage } from './ChatMessageComponent';
import { useLanguage } from '@/contexts/LanguageContext';

const GlassOrb = dynamic(() => import('@/components/voice/GlassOrb'), { ssr: false });

export interface HybridChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;

  messages: ChatMessage[];
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;

  isListening: boolean;
  isAiSpeaking: boolean;
  isMuted: boolean;
  onStartVoice: () => Promise<void> | void;
  onStopVoice: () => Promise<void> | void;
  onToggleMute: () => void;

  orbAnalyser: AnalyserNode | null;
}

export function HybridChatPanel({
  isOpen,
  onClose,
  panelRef,
  messages,
  value,
  onChange,
  onSend,
  isListening,
  isAiSpeaking,
  isMuted,
  onStartVoice,
  onStopVoice,
  onToggleMute,
  orbAnalyser,
}: HybridChatPanelProps) {
  const voiceActive = isListening || isAiSpeaking;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  const hasMessages = messages.length > 0;

  const placeholder = useMemo(() => t('chat_type_message'), [t]);

  const suggestions = useMemo(() => {
    return [t('chat_suggest_1'), t('chat_suggest_2'), t('chat_suggest_3'), t('chat_suggest_4')];
  }, [t]);

  useEffect(() => {
    if (!isOpen) return;
    // Scroll to bottom when new messages arrive.
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages.length]);

  return (
    <div className={`container-ai-chat ${isOpen ? 'open' : ''} ${voiceActive ? 'voice-active' : ''}`} aria-hidden={!isOpen}>
      {!voiceActive ? (
        <div className="lumina-aiCap" data-lumina-ai-inside="1" aria-label="Suggested prompts">
          <div className="chat-marquee">
            <ul>
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => onChange(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <ul aria-hidden="true">
              {suggestions.map((s) => (
                <li key={`${s}-dup`}>
                  <button type="button" onClick={() => onChange(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className={`lumina-aiPanel ${voiceActive ? 'voice-active' : ''}`} ref={panelRef}>
        <button
          type="button"
          className="lumina-aiClose"
          aria-label={t('chat_close')}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X size={16} />
        </button>

        <div className="lumina-aiPanel__body">
          {!voiceActive ? (
            <>
              <div className="lumina-aiPanel__messages" role="log" aria-live="polite">
                {hasMessages ? (
                  messages.map((m) => <ChatMessageComponent key={m.id} message={m} />)
                ) : (
                  <div className="lumina-aiPanel__empty">
                    <div className="lumina-aiPanel__emptyTitle">{t('chat_empty_title')}</div>
                    <div className="lumina-aiPanel__emptySub">{t('chat_empty_sub')}</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="AI-Input" aria-label="Chat input">
                <div className="chat-container">
                  <div className="chat-wrapper">
                    <textarea
                      id="chat-input"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (value.trim()) onSend();
                        }
                      }}
                    />

                    <div className="button-bar">
                      <div className="left-buttons">
                        <button type="button" aria-label={t('chat_attach')}>
                          <Paperclip size={18} />
                        </button>
                        <button type="button" aria-label={t('language')}>
                          <Globe size={18} />
                        </button>
                      </div>

                      <div className="right-buttons">
                        <button
                          type="button"
                          aria-label={isListening ? t('chat_voice_stop') : t('chat_voice_start')}
                          onClick={() => {
                            if (isListening) void onStopVoice();
                            else void onStartVoice();
                          }}
                        >
                          <Microphone size={18} weight="fill" />
                        </button>
                        <button type="button" aria-label={t('chat_send')} onClick={() => onSend()} disabled={!value.trim()}>
                          <PaperPlaneRight size={18} weight="fill" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lumina-aiVoiceFloating" aria-label="Voice mode">
              <div className="lumina-aiVoiceFloating__orb" aria-hidden="true">
                <GlassOrb analyser={orbAnalyser} className="h-full w-full" />
              </div>
              <div className="lumina-aiVoiceFloating__controls">
                <button
                  type="button"
                  className="lumina-aiVoiceFloating__btn"
                  aria-label={t('chat_voice_stop')}
                  onClick={() => void onStopVoice()}
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  className="lumina-aiVoiceFloating__btn"
                  aria-label={isMuted ? t('chat_mic_unmute') : t('chat_mic_mute')}
                  onClick={() => onToggleMute()}
                >
                  {isMuted ? <MicrophoneSlash size={18} weight="fill" /> : <Microphone size={18} weight="fill" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

