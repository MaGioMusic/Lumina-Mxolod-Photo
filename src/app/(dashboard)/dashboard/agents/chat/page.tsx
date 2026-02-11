'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiSearch, FiPhone, FiPaperclip, FiImage, FiSend, FiUser, FiMapPin, FiMail, FiBell, FiCalendar, FiShare2, FiX, FiMessageCircle } from 'react-icons/fi';
import { motion, MotionConfig } from 'framer-motion';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
}

type MessagesById = Record<string, Message[]>;

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export default function ChatPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const contactId = searchParams?.get('contactId') || undefined;
  const contactName = searchParams?.get('contactName') || undefined;
  const contactAvatar = searchParams?.get('contactAvatar') || undefined;

  const [selectedChat, setSelectedChat] = useState<string>(contactId ?? 'giorgi-mamaladze');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesWrapRef = useRef<HTMLDivElement | null>(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const replyTimeoutRef = useRef<number | null>(null);
  // Quick actions states
  const [pinnedIds] = useState<Set<string>>(new Set());
  // Removed unused notes/reminders/mute states

  // Modals
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const [draftMeeting, setDraftMeeting] = useState<{ day: string; time: string }>({ day: t('today'), time: '15:00' });
  const [draftReminder, setDraftReminder] = useState<string>(t('tomorrow'));
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const quickReplies = [
    t('chat_qr_1'),
    t('chat_qr_2'),
    t('chat_qr_3'),
    t('chat_qr_4'),
    t('chat_qr_5')
  ];

  const recentProperties = [
    { id: 'p1', title: `${t('vake')} • 3 ${t('rooms')} • 120 ${t('sqm')}`, url: '/properties/101' },
    { id: 'p2', title: `${t('saburtalo')} • 2 ${t('rooms')} • 78 ${t('sqm')}`, url: '/properties/102' },
    { id: 'p3', title: `${t('vera')} • 1 ${t('rooms')} • 52 ${t('sqm')}`, url: '/properties/103' },
  ];

  const baseUsers: ChatUser[] = [
    {
      id: 'giorgi-mamaladze',
      name: t('teamMember1Name'),
      avatar: '/images/photos/contact-1.jpg',
      lastMessage: 'გმადლობთ დახმარებისთვის, ძალიან...',
      timestamp: '10:23',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 'nino-kvaratskhelia',
      name: 'ნინო კვარაცხელია',
      avatar: '/images/photos/contact-2.jpg',
      lastMessage: 'როდის იქნება ხელმისაწვდომი?',
      timestamp: '09:45',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'davit-gurgenidze',
      name: 'დავით გურგენიძე',
      avatar: '/images/photos/contact-3.jpg',
      lastMessage: 'გმადლობთ ინფორმაციისთვის',
      timestamp: 'გუშინ',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'tamar-beridze',
      name: 'თამარ ბერიძე',
      avatar: '/images/photos/contact-4.jpg',
      lastMessage: '',
      timestamp: t('yesterday'),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'levan-kiknadze',
      name: 'ლევან კიკნაძე',
      avatar: '/images/photos/contact-1.jpg',
      lastMessage: 'კიდევ მაქვს რამდენიმე კითხვა...',
      timestamp: '19/05',
      unreadCount: 3,
      isOnline: false
    },
    {
      id: 'mariam-gogoladze',
      name: 'მარიამ გოგოლაძე',
      avatar: '/images/photos/contact-2.jpg',
      lastMessage: 'მადლობა დროული პასუხისთვის',
      timestamp: '18/05',
      unreadCount: 0,
      isOnline: false
    }
  ];

  const dynamicContact: ChatUser | null = useMemo(() => {
    if (!contactId) return null;
    return {
      id: contactId,
      name: contactName || 'Assigned Agent',
      avatar: contactAvatar || '/images/photos/Agents/agent-2.jpg',
      lastMessage: '',
      timestamp: '',
      unreadCount: 0,
      isOnline: true,
    };
  }, [contactId, contactName, contactAvatar]);

  const chatUsers: ChatUser[] = useMemo(
    () => (dynamicContact ? [...baseUsers, dynamicContact] : baseUsers),
    [baseUsers, dynamicContact]
  );

  type MessagesState = MessagesById;
  const [messagesById, setMessagesById] = useState<MessagesState>({
    'giorgi-mamaladze': [
      {
        id: '1',
        text: 'გამარჯობა, მაინტერესებს თქვენი პროდუქტის შესახებ დამატებითი ინფორმაცია',
        timestamp: '10:15',
        isOwn: false,
        avatar: '/images/photos/contact-1.jpg'
      },
      {
        id: '2',
        text: 'გამარჯობა! რა თქმა უნდა, რა გაინტერესებთ კონკრეტულად?',
        timestamp: '10:17',
        isOwn: true,
        avatar: '/images/photos/contact-4.jpg'
      },
      {
        id: '3',
        text: 'მაინტერესებს ფასი და მიწოდების ვადები',
        timestamp: '10:19',
        isOwn: false,
        avatar: '/images/photos/contact-1.jpg'
      },
      {
        id: '4',
        text: 'პროდუქტის ფასი არის 299₾, ხოლო მიწოდება შესაძლებელია 2-3 სამუშაო დღეში თბილისის მასშტაბით. რეგიონებში მიწოდებას სჭირდება 3-5 სამუშაო დღე.',
        timestamp: '10:20',
        isOwn: true,
        avatar: '/images/photos/contact-4.jpg'
      },
      {
        id: '5',
        text: 'გმადლობთ დახმარებისთვის, ძალიან სასარგებლო ინფორმაციაა',
        timestamp: '10:23',
        isOwn: false,
        avatar: '/images/photos/contact-1.jpg'
      }
    ],
  });

  const currentMessages = messagesById[selectedChat] ?? [];

  const transactions: Transaction[] = [
    { id: '1', date: '15/05/2023', amount: '299₾', status: t('completed') },
    { id: '2', date: '03/04/2023', amount: '149₾', status: t('completed') },
    { id: '3', date: '22/02/2023', amount: '499₾', status: t('completed') }
  ];

  const selectedUser = chatUsers.find(user => user.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Math.random().toString(36).slice(2),
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
        isOwn: true,
        avatar: '/images/photos/contact-4.jpg'
      };
      setMessagesById(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), message]
      }));
      setNewMessage('');
      setIsAssistantTyping(true);

      window.setTimeout(() => {
        const reply: Message = {
          id: Math.random().toString(36).slice(2),
          text: 'მოგწერ დეტალებს მოკლე დროში.',
          timestamp: new Date().toLocaleTimeString(),
          isOwn: false,
          avatar: selectedUser?.avatar || '/images/photos/contact-1.jpg'
        };
        setMessagesById(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), reply]
        }));
        setIsAssistantTyping(false);
      }, 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (contactId) {
      setSelectedChat(contactId);
    }
  }, [contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  useEffect(() => {
    const wrap = messagesWrapRef.current;
    if (!wrap) return;
    const onScroll = () => {
      const threshold = 120;
      const nearBottom = wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight < threshold;
      setShowScrollToBottom(!nearBottom);
    };
    onScroll();
    wrap.addEventListener('scroll', onScroll);
    return () => wrap.removeEventListener('scroll', onScroll);
  }, []);

  // Track scroll position to toggle scroll-to-bottom chip
  useEffect(() => {
    const el = messagesWrapRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setShowScrollToBottom(!nearBottom);
    };
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [selectedChat]);

  // Chat list sorting: pinned first
  const sortedChatUsers = [...chatUsers].sort((a, b) => {
    const ap = pinnedIds.has(a.id) ? 1 : 0;
    const bp = pinnedIds.has(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return 0;
  });

  // togglePin removed (no UI entry points)

  // toggleFavorite removed (no UI entry points)

  // muteFor removed (not used)

  const insertQuickReply = (text: string) => {
    setNewMessage(curr => (curr ? curr + ' ' + text : text));
  };

  const addSystemMessage = (text: string) => {
    const sys: Message = {
      id: (Date.now() + Math.random()).toString(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      avatar: '/images/photos/contact-4.jpg'
    };
    setMessagesById(prev => {
      const prevList = prev[selectedChat] ?? [];
      return { ...prev, [selectedChat]: [...prevList, sys] };
    });
  };

  // Modal handlers (lightweight, inline UI at bottom)
  const confirmMeeting = () => {
    addSystemMessage(`${t('chat_schedule')}: ${draftMeeting.day}, ${draftMeeting.time}`);
    setMeetingOpen(false);
  };
  const confirmShare = (propUrl: string) => {
    addSystemMessage(`${t('chat_shared_property')}: ${propUrl}`);
    setShareOpen(false);
  };
  const confirmReminder = () => {
    addSystemMessage(`${t('chat_reminder_set')}: ${draftReminder}`);
    setReminderOpen(false);
  };
  const saveNote = () => {
    if (!draftNote.trim()) return setNoteOpen(false);
    setDraftNote('');
    setNoteOpen(false);
  };

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) window.clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  return (
    <>
    <MotionConfig reducedMotion="user">
    <div className={`fixed inset-x-0 top-20 bottom-0 overflow-hidden flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Left Sidebar - Chat List */}
      <div className={`w-[350px] flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Search Bar */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm`}>
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
            <input
              type="text"
              placeholder={t('search')}
              className={`w-full pl-10 pr-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} rounded-lg border-0 focus:ring-2 focus:ring-primary-500`}
            />
            <FiSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {sortedChatUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              onClick={() => setSelectedChat(user.id)}
              className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'} cursor-pointer transition-colors ${
                selectedChat === user.id ? (theme === 'dark' ? 'bg-gray-700' : 'bg-white') : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                      {user.name}
                    </h3>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                      {user.lastMessage}
                    </p>
                    {user.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                {/* Row actions temporarily hidden per request */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Center - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedUser?.avatar || '/images/photos/contact-1.jpg'}
                alt={selectedUser?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser?.name || 'გიორგი მამალაძე'}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full online-badge-breathe"></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('online')}
                  </span>
                </div>
              </div>
            </div>
            {/* Calls disabled per requirement */}
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesWrapRef} className={`relative flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {currentMessages.map((message, idx) => (
            <motion.div
              key={message.id}
              className={`flex gap-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, x: message.isOwn ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.35 }}
            >
              {!message.isOwn && (
                <img
                  src={message.avatar}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className={`max-w-lg ${message.isOwn ? 'order-first' : ''}`}>
                <div className={`px-4 py-3 rounded-lg ${
                  message.isOwn 
                    ? 'bg-[#F08336] text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                } shadow-sm`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <div className={`mt-1 text-xs ${
                  message.isOwn ? 'text-right' : 'text-left'
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {message.timestamp}
                </div>
              </div>
              {message.isOwn && (
                <img
                  src={message.avatar}
                  alt="You"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isAssistantTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300/30 dark:bg-gray-700/50 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} px-4 py-2 rounded-lg shadow-sm`}>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />

          {/* Scroll to bottom chip */}
          {showScrollToBottom && (
            <button
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute right-4 bottom-4 bg-primary-400 hover:bg-primary-500 text-white text-xs px-3 py-2 rounded-full shadow-md"
            >
              {t('chat_go_to_bottom')}
            </button>
          )}
        </div>

        {/* Message Input (compact toolbar) */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className={`relative flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2`}>
            <button className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
              <FiPaperclip className="w-5 h-5" />
            </button>
            <button className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
              <FiImage className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat_type_message')}
              className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900 placeholder-gray-500'} border-0 focus:ring-0 focus:outline-none`}
            />
            {/* Compact quick actions (icons only) */}
            <button title={t('chat_quick_replies')} className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`} onClick={() => setShowQuickReplies(v => !v)}>
              <FiMessageCircle className="w-5 h-5" />
            </button>
            <button title={t('chat_schedule')} onClick={() => setMeetingOpen(true)} className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
              <FiCalendar className="w-5 h-5" />
            </button>
            <button title={t('chat_share')} onClick={() => setShareOpen(true)} className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
              <FiShare2 className="w-5 h-5" />
            </button>
            <button title={t('chat_reminder')} onClick={() => setReminderOpen(true)} className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
              <FiBell className="w-5 h-5" />
            </button>
            <button title={t('chat_note')} onClick={() => setNoteOpen(true)} className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
              <FiUser className="w-5 h-5" />
            </button>
            <motion.button
              onClick={handleSendMessage}
              className="bg-primary-400 hover:bg-primary-500 text-white p-2 rounded-full transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <FiSend className="w-4 h-4" />
            </motion.button>

            {/* Quick replies popover */}
            {showQuickReplies && (
              <div className={`absolute bottom-full right-2 mb-2 ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-gray-900'} border ${theme==='dark'?'border-gray-700':'border-gray-200'} rounded-lg shadow-lg p-2 w-[280px] max-h-40 overflow-auto`}
                   onMouseLeave={() => setShowQuickReplies(false)}>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((qr) => (
                    <button key={qr} onClick={() => { insertQuickReply(qr); setShowQuickReplies(false); }} className={`text-xs px-2 py-1 rounded-full ${theme==='dark'?'bg-gray-700 hover:bg-gray-600':'bg-gray-100 hover:bg-gray-200'} transition`}>
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - User Profile */}
      <motion.div
        className={`w-[350px] flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User Profile */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
          <img
            src={selectedUser?.avatar || '/images/photos/contact-1.jpg'}
            alt={selectedUser?.name || 'User'}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
          />
          <h3 className={`mt-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {selectedUser?.name || t('teamMember1Name')}
            {selectedUser?.name || t('teamMember1Name')}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full online-badge-breathe"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('online')}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`p-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('contactInformation')}
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiPhone className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                +995 599 12 34 56
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiMail className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                giorgi.mamaladze@gmail.com
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiMapPin className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('addressValue')}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className={`p-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('transactionHistory')}
          </h4>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {transaction.date}
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.amount}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions removed (duplicated with chat toolbar) */}
      </motion.div>
    </div>
    </MotionConfig>

    {/* Lightweight Modals */}
    {meetingOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setMeetingOpen(false)}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-4 w-[320px]`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{t('chat_schedule')}</h3><button onClick={() => setMeetingOpen(false)}><FiX/></button></div>
          <div className="space-y-3">
            <div className="flex gap-2">
              {[t('today'), t('tomorrow'), t('other')].map(d => (
                <button key={d} onClick={() => setDraftMeeting({ ...draftMeeting, day: d })} className={`text-xs px-2 py-1 rounded-full border ${draftMeeting.day===d ? 'bg-primary-400 text-white border-transparent' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>{d}</button>
              ))}
            </div>
            <input value={draftMeeting.time} onChange={(e)=>setDraftMeeting({ ...draftMeeting, time: e.target.value })} className={`${theme==='dark'?'bg-gray-700 text-white':'bg-gray-100 text-gray-900'} w-full rounded px-2 py-2`} />
            <button onClick={confirmMeeting} className="w-full bg-primary-400 hover:bg-primary-500 text-white rounded px-3 py-2">{t('chat_confirm')}</button>
          </div>
        </div>
      </div>
    )}

    {shareOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShareOpen(false)}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-4 w-[360px]`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{t('chat_recent_properties')}</h3><button onClick={() => setShareOpen(false)}><FiX/></button></div>
          <div className="space-y-2">
            {recentProperties.map(p => (
              <button key={p.id} onClick={()=>confirmShare(p.url)} className={`${theme==='dark'?'bg-gray-700 hover:bg-gray-600':'bg-gray-100 hover:bg-gray-200'} w-full text-left rounded px-3 py-2`}>{p.title}</button>
            ))}
          </div>
        </div>
      </div>
    )}

    {reminderOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setReminderOpen(false)}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-4 w-[320px]`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{t('chat_reminder')}</h3><button onClick={() => setReminderOpen(false)}><FiX/></button></div>
          <div className="flex gap-2 mb-3">
            {[t('today'), t('tomorrow'), t('oneWeek')].map(d => (
              <button key={d} onClick={()=>setDraftReminder(d)} className={`text-xs px-2 py-1 rounded-full border ${draftReminder===d ? 'bg-primary-400 text-white border-transparent' : theme==='dark' ? 'border-gray-600' : 'border-gray-300'}`}>{d}</button>
            ))}
          </div>
          <button onClick={confirmReminder} className="w-full bg-primary-400 hover:bg-primary-500 text-white rounded px-3 py-2">{t('chat_confirm')}</button>
        </div>
      </div>
    )}

    {noteOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setNoteOpen(false)}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-4 w-[360px]`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{t('chat_private_note')}</h3><button onClick={() => setNoteOpen(false)}><FiX/></button></div>
          <textarea value={draftNote} onChange={(e)=>setDraftNote(e.target.value)} rows={4} className={`${theme==='dark'?'bg-gray-700 text-white':'bg-gray-100 text-gray-900'} w-full rounded px-2 py-2 mb-3`} placeholder={t('chat_private_note')} />
          <button onClick={saveNote} className="w-full bg-primary-400 hover:bg-primary-500 text-white rounded px-3 py-2">{t('chat_save')}</button>
        </div>
      </div>
    )}
    </>
  );
} 