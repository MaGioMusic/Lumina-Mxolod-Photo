'use client';

import React from 'react';
import { MockProperty } from '@/lib/mockProperties';
import { motion } from 'framer-motion';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isPartial: boolean;
  isFinal: boolean;
  propertyCards?: MockProperty[];
  timestamp: Date;
}

interface ChatMessageComponentProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageComponentProps) {
  const isUser = message.role === 'user';
  const bubbleClassName = isUser
    ? [
        'self-end ml-auto',
        // Match header button orange (#F08336) but softened for readability.
        'bg-gradient-to-br from-[#F08336]/85 via-[#D4AF37]/55 to-[#B8860B]/75',
        'text-white',
        'border border-[rgba(240,131,54,0.28)]',
        'shadow-[0_12px_28px_rgba(0,0,0,0.28)]',
      ].join(' ')
    : [
        'self-start mr-auto',
        // Light theme: readable dark text on subtle light bubble
        'bg-slate-900/5 text-slate-900',
        'border border-slate-200',
        // Dark theme: keep glass look
        'dark:bg-white/10 dark:text-slate-50',
        'dark:border-[rgba(212,175,55,0.18)]',
        'backdrop-blur-md',
      ].join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={[
        'relative z-[3]',
        'flex w-fit max-w-[92%] gap-3 rounded-xl px-4 py-3',
        bubbleClassName,
      ].join(' ')}
      aria-live={message.isFinal ? 'polite' : 'off'}
    >
      <div className="flex-1">
        {/* Message Content */}
        <div
          className={`text-[15px] leading-relaxed md:text-[16px] ${
            message.isPartial && !message.isFinal ? 'opacity-70' : 'opacity-100'
          }`}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.content}
          {message.isPartial && !message.isFinal && (
            <span className="inline-block ml-1 animate-pulse">▋</span>
          )}
        </div>

        {/* Property cards in chat are disabled per product decision */}

        {/* Timestamp */}
        {message.isFinal && Number.isFinite(message.timestamp?.getTime?.()) ? (
          <div
            className={[
              'mt-2 text-xs',
              isUser ? 'text-white/55' : 'text-slate-500 dark:text-white/55',
            ].join(' ')}
          >
            {message.timestamp.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}