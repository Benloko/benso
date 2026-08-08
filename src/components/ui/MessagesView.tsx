'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VerifiedIcon, SearchIcon } from './Icons';

export interface ChatConversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    isVerified?: boolean;
    role?: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  messages: Array<{
    id: string;
    sender: 'user' | 'me';
    text: string;
    timestamp: string;
    isAudio?: boolean;
    audioDuration?: string;
  }>;
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    user: {
      name: 'Amina Kouyaté',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      role: 'Auteure de "L\'Ombre du Baobab"',
      isOnline: true,
    },
    lastMessage: 'Merci infiniment pour votre soutien ! Le chapitre 2 sort ce samedi 📚✨',
    lastMessageTime: '14:32',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        sender: 'me',
        text: 'Bonjour Amina ! J\'ai adoré la tournure de l\'histoire sous le baobab. La plume est vraiment magnifique !',
        timestamp: '14:28',
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Bonjour ! Merci beaucoup, cela me touche énormément ! 🙏🏿',
        timestamp: '14:30',
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'Merci infiniment pour votre soutien ! Le chapitre 2 sort ce samedi 📚✨',
        timestamp: '14:32',
      },
      {
        id: 'm4',
        sender: 'user',
        text: 'Note vocale (0:14)',
        timestamp: '14:33',
        isAudio: true,
        audioDuration: '0:14',
      },
    ],
  },
  {
    id: 'conv-2',
    user: {
      name: 'Amara Diop',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      role: 'Auteur de "Les Secrets de Kétou"',
      isOnline: false,
    },
    lastMessage: 'Avez-vous débloqué la version intégrale illustrée ?',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    messages: [
      {
        id: 'm10',
        sender: 'user',
        text: 'Salutations à la communauté BenSo !',
        timestamp: 'Hier 18:20',
      },
      {
        id: 'm11',
        sender: 'user',
        text: 'Avez-vous débloqué la version intégrale illustrée ?',
        timestamp: 'Hier 18:22',
      },
    ],
  },
  {
    id: 'conv-3',
    user: {
      name: 'Ben HOUNSA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      role: 'Fondateur & Promoteur BenSo',
      isOnline: true,
    },
    lastMessage: 'Bienvenue sur BenSo ! Des idées de récits à publier prochainement ?',
    lastMessageTime: '09:15',
    unreadCount: 0,
    messages: [
      {
        id: 'm20',
        sender: 'user',
        text: 'Bienvenue sur BenSo ! Des idées de récits à publier prochainement ?',
        timestamp: '09:15',
      },
    ],
  },
];

export const MessagesView: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('list');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, activeMobileView]);

  // Lock body scroll on mobile when chat room is active
  useEffect(() => {
    if (activeMobileView === 'chat') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeMobileView]);

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setActiveMobileView('chat');
    // Clear unread badge
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastMessageTime: newMsg.timestamp,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputMessage('');

    // Simulated Creator Auto Response after 1.5 seconds
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            const replies = [
              'Merci pour ce message amical ! Je réponds toujours aux passionnés de lecture.',
              'Trop cool ! N\'hésitez pas à partager l\'œuvre autour de vous.',
              'C\'est noté avec plaisir ! Merci de faire vivre le storytelling africain.',
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            return {
              ...c,
              lastMessage: randomReply,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: [
                ...c.messages,
                {
                  id: `reply-${Date.now()}`,
                  sender: 'user' as const,
                  text: randomReply,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-90px)] max-h-[850px] max-w-6xl mx-auto w-full p-0 sm:p-4 gap-3">
      
      {/* Left Sidebar: Conversations List (Visible on mobile if 'list' OR on desktop always) */}
      <div className={`w-full md:w-80 lg:w-96 bg-[#130F29]/90 border border-white/10 rounded-none sm:rounded-3xl p-3.5 sm:p-4 flex flex-col gap-3 backdrop-blur-xl shadow-2xl shrink-0 ${
        activeMobileView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md">
              💬
            </div>
            <h2 className="font-black text-lg text-white tracking-tight">Messagerie</h2>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
            {conversations.length} Discussions
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] text-xs text-white placeholder:text-gray-500 pl-9 pr-4 py-2.5 rounded-2xl border border-white/10 focus:border-indigo-500/60 focus:outline-none transition-all"
          />
          <SearchIcon size={16} className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Conversations Feed */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-none">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 relative group ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5'
                }`}
              >
                {/* Avatar with Online Status Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={conv.user.avatar}
                    alt={conv.user.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                  />
                  {conv.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#130F29]" />
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-black text-xs text-white truncate">{conv.user.name}</span>
                      {conv.user.isVerified && <VerifiedIcon size={13} />}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate font-normal">
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread Pill */}
                {conv.unreadCount && conv.unreadCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md shrink-0">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Mobile Chat Room (Strict WhatsApp Layout) */}
      <div
        className={`bg-[#0B081B] border-0 sm:border border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ${
          activeMobileView === 'chat'
            ? 'fixed inset-0 z-[99999] h-screen w-screen flex flex-col md:relative md:inset-auto md:z-auto md:flex-1 md:h-auto md:w-auto'
            : 'hidden md:flex md:flex-1'
        }`}
      >
        {/* Subtle Ambient Wallpaper Pattern Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* WhatsApp-Style Fixed Top Bar */}
        <div className="p-3 sm:p-4 bg-[#110D27] border-b border-white/10 flex items-center justify-between gap-2.5 relative z-20 shrink-0 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            
            {/* WhatsApp Back Arrow */}
            <button
              type="button"
              onClick={() => setActiveMobileView('list')}
              className="md:hidden text-gray-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer shrink-0"
              aria-label="Retour"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="relative shrink-0">
              <img
                src={activeConv.user.avatar}
                alt={activeConv.user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40 shadow-md"
              />
              {activeConv.user.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#110D27]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-black text-sm text-white truncate">{activeConv.user.name}</h3>
                {activeConv.user.isVerified && <VerifiedIcon size={14} className="shrink-0" />}
              </div>
              <p className="text-[11px] text-indigo-300 flex items-center gap-1 font-medium truncate">
                <span className={activeConv.user.isOnline ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {activeConv.user.isOnline ? 'en ligne' : 'hors ligne'}
                </span>
              </p>
            </div>
          </div>

          {/* Call & Action Icons (WhatsApp Style) */}
          <div className="flex items-center gap-3 shrink-0 text-gray-300">
            <button 
              type="button" 
              onClick={() => alert(`Appel vocal avec ${activeConv.user.name} (Fonctionnalité BenSo Live bientôt disponible)`)}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Appel vocal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button 
              type="button" 
              onClick={() => alert(`Profil de ${activeConv.user.name}`)}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              title="Plus d'options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* WhatsApp-Style Scrollable Messages Feed */}
        <div className="flex-1 min-h-0 p-3.5 sm:p-6 overflow-y-auto space-y-3.5 relative z-10 scrollbar-none">
          
          {/* Today Date Badge */}
          <div className="flex justify-center my-2">
            <span className="text-[10px] font-bold text-indigo-300 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              Aujourd'hui
            </span>
          </div>

          {activeConv.messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-md space-y-1 relative text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium'
                      : 'bg-white/10 backdrop-blur-md text-gray-100 border border-white/10 rounded-tl-none font-normal'
                  }`}
                >
                  {/* Voice Note Player simulation if isAudio */}
                  {msg.isAudio ? (
                    <div className="flex items-center gap-3 py-1 px-1 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 transition-transform active:scale-90"
                      >
                        {isPlayingAudio ? '⏸' : '▶'}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className={`h-full bg-white transition-all duration-300 ${isPlayingAudio ? 'w-2/3 animate-pulse' : 'w-1/3'}`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-300 font-mono">
                          <span>{msg.audioDuration || '0:14'}</span>
                          <span>🎙️ Note vocale</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  <div className={`flex items-center justify-end gap-1 text-[10px] ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <span className="text-sky-300 font-bold">✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp-Style Fixed Input Bar (Always stuck at bottom) */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3 bg-[#110D27] border-t border-white/10 flex items-center gap-2 relative z-20 shrink-0"
        >
          <button
            type="button"
            onClick={() => setInputMessage((prev) => prev + ' 😊')}
            className="text-gray-400 hover:text-white p-1 text-lg shrink-0"
            title="Émojis"
          >
            😊
          </button>

          <input
            type="text"
            required
            placeholder="Message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-white/5 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full border border-white/10 focus:border-emerald-500/80 focus:bg-white/10 focus:outline-none placeholder:text-gray-500 transition-all"
          />

          <button
            type="button"
            onClick={() => alert("Pièces jointes (images, PDF) bientôt disponibles")}
            className="text-gray-400 hover:text-white p-1 text-lg hidden sm:block shrink-0"
            title="Joindre un fichier"
          >
            📎
          </button>

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`w-10 h-10 rounded-full font-black text-sm transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 ${
              inputMessage.trim()
                ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-emerald-600/50 text-white/50 cursor-not-allowed'
            }`}
          >
            ➔
          </button>
        </form>

      </div>
    </div>
  );
};
