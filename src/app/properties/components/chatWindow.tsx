import React, { type ChangeEvent, type SyntheticEvent, type RefObject } from 'react';
import { Microphone } from '@phosphor-icons/react';
import { AIVoiceInput } from '@/components/ui/ai-voice-input';
import type { MockProperty } from '@/lib/mockProperties';

interface ChatWindowProps {
  isOpen: boolean;
  chatRef: RefObject<HTMLDivElement>;
  message: string;
  onMessageChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: SyntheticEvent) => void;
  onClose: () => void;
  isFunctionCallingEnabled: boolean;
  showInlineResults: boolean;
  searchResults: MockProperty[];
  lastSearchSummary: string;
  isVoiceEnabled: boolean;
  centerCircleRef: RefObject<HTMLDivElement>;
  isListening: boolean;
  onStartVoice: () => Promise<void> | void;
  onStopVoice: () => Promise<void> | void;
  toggleMute: () => void;
  isMuted: boolean;
  audioRef: RefObject<HTMLAudioElement>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  chatRef,
  message,
  onMessageChange,
  onSubmit,
  onClose,
  isFunctionCallingEnabled,
  showInlineResults,
  searchResults,
  lastSearchSummary,
  isVoiceEnabled,
  centerCircleRef,
  isListening,
  onStartVoice,
  onStopVoice,
  toggleMute,
  isMuted,
  audioRef,
}) => (
  <div className={`container-ai-chat ${isOpen ? 'open' : ''}`} ref={chatRef}>
    <div className="chat">
      <div className="chat-header">
        <h3 className="chat-title">AI Assistant</h3>
        <button
          className="close-button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className="chat-bot">
        <textarea
          value={message}
          onChange={(event) => {
            event.stopPropagation();
            onMessageChange(event);
          }}
          placeholder="რით შემიძლია დაგეხმაროთ?"
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {isFunctionCallingEnabled && showInlineResults && searchResults.length > 0 && (
        <div style={{ padding: '8px 10px', display: 'grid', gap: 8 }}>
          {lastSearchSummary ? (
            <div style={{ fontSize: 12, color: '#666' }}>შედეგები: {lastSearchSummary}</div>
          ) : null}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {searchResults.map((property) => (
              <div
                key={property.id}
                style={{ display: 'flex', gap: 8, border: '1px solid #f0f0f0', borderRadius: 8, padding: 6 }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 6,
                    overflow: 'hidden',
                    flex: '0 0 auto',
                    background: '#fafafa',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.image}
                    alt={property.type}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#222' }}>
                    {property.type} · {property.address}
                  </div>
                  <div style={{ fontSize: 12, color: '#444' }}>
                    {property.bedrooms} ს. {property.bathrooms} ს/წ · {property.sqft} მ²
                  </div>
                  <div style={{ fontSize: 12, color: '#0f172a' }}>
                    {property.price.toLocaleString('en-US')} ₾
                  </div>
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
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={isListening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა'}
              title={isListening ? 'ხმის შეწყვეტა' : 'ხმის ჩართვა'}
              onClick={(event) => {
                event.stopPropagation();
                if (isListening) {
                  void onStopVoice();
                } else {
                  void onStartVoice();
                }
              }}
            >
              <div className="voice-mic" aria-hidden="true">
                <div className="echo">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <Microphone className="mic" size={14} weight="fill" />
              </div>
            </button>

            <AIVoiceInput
              controlled
              listening={isListening && !isMuted}
              variant="compact"
              visualizerBars={24}
              showTimer={false}
              showLabel={false}
              className="pointer-events-none select-none"
            />

            <button
              type="button"
              title={isMuted ? 'Unmute mic' : 'Mute mic'}
              onClick={(event) => {
                event.stopPropagation();
                toggleMute();
              }}
              style={{
                border: '1px solid #eee',
                background: isMuted ? '#fee' : '#fff',
                borderRadius: 6,
                padding: '1px 6px',
                fontSize: 12,
                lineHeight: '18px',
                cursor: 'pointer',
              }}
            >
              {isMuted ? 'unmute' : 'mute'}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="btn-submit"
          onClick={(event) => {
            event.stopPropagation();
            onSubmit(event);
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
    <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />
  </div>
);


