import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChatWindow } from './chatWindow';
import type { MockProperty } from '@/lib/mockProperties';

const baseProps = {
  isFunctionCallingEnabled: true,
  showInlineResults: false,
  searchResults: [] as MockProperty[],
  lastSearchSummary: '',
  isVoiceEnabled: false,
  isListening: false,
  isAiSpeaking: false,
  onStartVoice: async () => {},
  onStopVoice: async () => {},
  toggleMute: () => {},
  isMuted: false,
};

test('ChatWindow renders closed state without throwing', () => {
  const markup = renderToString(
    <ChatWindow
      {...baseProps}
      isOpen={false}
      chatRef={{ current: null }}
      message=""
      onMessageChange={() => {}}
      onSubmit={(e) => e.preventDefault()}
      onClose={() => {}}
      centerCircleRef={{ current: null }}
      audioRef={{ current: null }}
    />,
  );
  assert.ok(markup.includes('AI Assistant'));
});

test('ChatWindow renders inline results snapshot', () => {
  const mockResult: MockProperty = {
    id: 'p1',
    address: 'Vake',
    price: 123000,
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 84,
    status: 'for-sale',
    isNew: false,
    image: '/images/properties/p1.jpg',
  };

  const markup = renderToString(
    <ChatWindow
      {...baseProps}
      isOpen
      chatRef={{ current: null }}
      message="test"
      onMessageChange={() => {}}
      onSubmit={(e) => e.preventDefault()}
      onClose={() => {}}
      centerCircleRef={{ current: null }}
      audioRef={{ current: null }}
      showInlineResults
      searchResults={[mockResult]}
      lastSearchSummary="1 result"
    />,
  );

  assert.ok(markup.includes('1 result'));
  assert.ok(markup.includes(mockResult.address));
});
