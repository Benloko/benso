'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VerifiedIcon, SearchIcon, MessageIcon, StarIcon, PhoneIcon } from './Icons';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'me';
  text?: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
  imageUrl?: string;
  fileInfo?: {
    name: string;
    size: string;
    type?: string;
  };
  isEdited?: boolean;
  replyToMessage?: {
    senderName: string;
    text: string;
  };
}

export interface ChatConversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    isVerified?: boolean;
    role?: string;
    isOnline?: boolean;
    handle?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isFavorite?: boolean;
  messages: ChatMessage[];
}

interface MessagesViewProps {
  onMobileChatToggle?: (isOpen: boolean) => void;
  onOpenUserProfile?: (user: { name: string; avatar: string; handle?: string; isVerified?: boolean; role?: string }) => void;
  targetUserName?: string | null;
  onBackNavigation?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Visages',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '🤔'],
  },
  {
    name: 'Gestes',
    icon: '👍',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '🖐️', '✋', '👋', '💪', '👀'],
  },
  {
    name: 'Amour & Cœurs',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❤️‍🔥', '💌', '💋', '🔥', '✨'],
  },
  {
    name: 'Storytelling & Livres',
    icon: '📚',
    emojis: ['📚', '📖', '📕', '📗', '📘', '📙', '📝', '✍️', '🎨', '🎭', '🎧', '🎙️', '📜', '💬', '💭', '🗣️', '🌍', '👑', '🏆', '⭐', '🌟', '🚀'],
  },
];

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    user: {
      name: 'Amina Kouyaté',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      role: 'Auteure de "L\'Ombre du Baobab"',
      handle: '@amina.k',
      isOnline: true,
    },
    lastMessage: '🎙️ Note vocale (0:14)',
    lastMessageTime: '14:33',
    unreadCount: 2,
    isFavorite: true,
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
      handle: '@amara_diop',
      isOnline: true,
    },
    lastMessage: 'Avez-vous débloqué la version intégrale illustrée ?',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    isFavorite: false,
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
      handle: '@benhounsa',
      isOnline: true,
    },
    lastMessage: 'Bienvenue sur BenSo ! Des idées de récits à publier prochainement ?',
    lastMessageTime: '09:15',
    unreadCount: 0,
    isFavorite: true,
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

const QUICK_AUTHORS_STORIES = [
  { id: 'auth-1', name: 'Amina K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isOnline: true, convId: 'conv-1' },
  { id: 'auth-2', name: 'Amara D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isOnline: true, convId: 'conv-2' },
  { id: 'auth-3', name: 'Ben H.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', isOnline: true, convId: 'conv-3' },
  { id: 'auth-4', name: 'Mariam B.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', isOnline: false, convId: null },
  { id: 'auth-5', name: 'Koffi S.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', isOnline: true, convId: null },
];

export const MessagesView: React.FC<MessagesViewProps> = ({ onMobileChatToggle, onOpenUserProfile, targetUserName, onBackNavigation }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('list');

  // Handle direct navigation to a target user's chat conversation
  useEffect(() => {
    if (targetUserName) {
      const found = conversations.find(
        (c) => c.user.name.toLowerCase().includes(targetUserName.toLowerCase()) ||
               (c.user.handle && c.user.handle.toLowerCase().includes(targetUserName.toLowerCase()))
      );

      if (found) {
        setSelectedConvId(found.id);
        setActiveMobileView('chat');
        onMobileChatToggle?.(true);
      } else {
        const newConvId = `conv-${Date.now()}`;
        const newConv: ChatConversation = {
          id: newConvId,
          user: {
            name: targetUserName,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            isVerified: true,
            role: 'Auteur BenSo',
            isOnline: true,
          },
          lastMessage: 'Discussion démarrée',
          lastMessageTime: 'À l\'instant',
          unreadCount: 0,
          isFavorite: false,
          messages: [
            {
              id: `m-init-${Date.now()}`,
              sender: 'user',
              text: `Bonjour ! Discussion ouverte avec ${targetUserName}.`,
              timestamp: 'À l\'instant',
            },
          ],
        };
        setConversations((prev) => [newConv, ...prev]);
        setSelectedConvId(newConvId);
        setActiveMobileView('chat');
        onMobileChatToggle?.(true);
      }
    }
  }, [targetUserName]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unread' | 'authors' | 'favorites'>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Audio Recording States
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);

  // Audio Call Simulation State
  const [isAudioCallActive, setIsAudioCallActive] = useState<boolean>(false);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);

  // Attachment & Emoji Popovers State
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<number>(0);
  const [lastUsedEmoji, setLastUsedEmoji] = useState<string>('😊');
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Message Options Modal / State
  const [activeMsgOptions, setActiveMsgOptions] = useState<ChatMessage | null>(null);
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, activeMobileView, isRecordingAudio]);

  // Toast notice timer
  useEffect(() => {
    if (toastNotice) {
      const t = setTimeout(() => setToastNotice(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastNotice]);

  // Audio Call Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAudioCallActive) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isAudioCallActive]);

  // Prevent background body scroll when mobile chat room is open & inform parent
  useEffect(() => {
    if (activeMobileView === 'chat') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      onMobileChatToggle?.(true);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      onMobileChatToggle?.(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      onMobileChatToggle?.(false);
    };
  }, [activeMobileView, onMobileChatToggle]);

  // Audio Recording Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingAudio && !isPausedAudio) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio, isPausedAudio]);

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setActiveMobileView('chat');
    onMobileChatToggle?.(true);
    // Clear unread badge
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleBackToList = () => {
    setActiveMobileView('list');
    onMobileChatToggle?.(false);
    onBackNavigation?.();
  };

  // Toggle Favorite Handler
  const handleToggleFavorite = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  // Helper to format timestamp
  const getCurrentTimeStr = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Send or Save Edited Text Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    if (editingMsg) {
      // Update existing message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === editingMsg.id ? { ...m, text: inputMessage.trim(), isEdited: true } : m
              ),
            };
          }
          return c;
        })
      );
      setToastNotice('Message modifié avec succès ✨');
      setEditingMsg(null);
      setInputMessage('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputMessage.trim(),
      timestamp: getCurrentTimeStr(),
      replyToMessage: replyingToMsg
        ? {
            senderName: replyingToMsg.sender === 'me' ? 'Vous' : activeConv.user.name,
            text: replyingToMsg.text || 'Message',
          }
        : undefined,
    };

    appendMessageToActiveConv(newMsg, newMsg.text || '');
    setInputMessage('');
    setReplyingToMsg(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    triggerAuthorAutoReply('text');
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== msgId),
          };
        }
        return c;
      })
    );
    setActiveMsgOptions(null);
    setToastNotice('Message supprimé');
  };

  // Copy text to clipboard
  const handleCopyMessage = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setActiveMsgOptions(null);
    setToastNotice('Texte copié dans le presse-papier ! 📋');
  };

  // Forward message simulation
  const handleForwardMessage = (msg: ChatMessage) => {
    setActiveMsgOptions(null);
    setToastNotice(`Message transféré à ${activeConv.user.name} ↗️`);
  };

  // Start Editing Message
  const handleStartEditing = (msg: ChatMessage) => {
    setActiveMsgOptions(null);
    setEditingMsg(msg);
    setInputMessage(msg.text || '');
  };

  // Start Audio Recording
  const handleStartRecording = () => {
    setIsRecordingAudio(true);
    setIsPausedAudio(false);
    setRecordingSeconds(0);
    setIsPreviewPlaying(false);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  // Cancel Audio Recording
  const handleCancelRecording = () => {
    setIsRecordingAudio(false);
    setIsPausedAudio(false);
    setRecordingSeconds(0);
    setIsPreviewPlaying(false);
  };

  // Stop & Send Audio Recording
  const handleSendAudioRecording = () => {
    if (!activeConv) return;
    const minutes = Math.floor(recordingSeconds / 60);
    const seconds = recordingSeconds % 60;
    const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const audioMsg: ChatMessage = {
      id: `audio-${Date.now()}`,
      sender: 'me',
      timestamp: getCurrentTimeStr(),
      isAudio: true,
      audioDuration: formattedDuration === '0:00' ? '0:03' : formattedDuration,
    };

    appendMessageToActiveConv(audioMsg, `🎙️ Note vocale (${audioMsg.audioDuration})`);
    setIsRecordingAudio(false);
    setIsPausedAudio(false);
    setRecordingSeconds(0);
    setIsPreviewPlaying(false);
    triggerAuthorAutoReply('audio');
  };

  // Handle Photo/Image File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const imageUrl = URL.createObjectURL(file);
    const imgMsg: ChatMessage = {
      id: `img-${Date.now()}`,
      sender: 'me',
      timestamp: getCurrentTimeStr(),
      imageUrl: imageUrl,
      text: file.name,
    };

    appendMessageToActiveConv(imgMsg, `📷 Photo (${file.name})`);
    setShowAttachMenu(false);
    triggerAuthorAutoReply('image');
  };

  // Handle Document/File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const fileMsg: ChatMessage = {
      id: `file-${Date.now()}`,
      sender: 'me',
      timestamp: getCurrentTimeStr(),
      fileInfo: {
        name: file.name,
        size: fileSizeFormatted,
        type: file.type,
      },
    };

    appendMessageToActiveConv(fileMsg, `📄 Document (${file.name})`);
    setShowAttachMenu(false);
    triggerAuthorAutoReply('file');
  };

  // Append message helper
  const appendMessageToActiveConv = (msg: ChatMessage, lastMsgText: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: lastMsgText,
            lastMessageTime: msg.timestamp,
            messages: [...c.messages, msg],
          };
        }
        return c;
      })
    );
  };

  // Trigger automated author reply simulation
  const triggerAuthorAutoReply = (type: 'text' | 'audio' | 'image' | 'file') => {
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            let replyText = 'Merci pour ce message amical ! Je réponds toujours aux passionnés de lecture.';

            if (type === 'audio') {
              replyText = 'J\'ai bien écouté votre note vocale ! C\'est formidable d\'échanger de vive voix 🎙️✨';
            } else if (type === 'image') {
              replyText = 'Merci pour cette superbe illustration/photo ! 📸';
            } else if (type === 'file') {
              replyText = 'Bien reçu votre document. Je le consulte dès que possible ! 📄👍';
            } else {
              const replies = [
                'Merci pour ce message amical ! Je réponds toujours aux passionnés de lecture.',
                'Trop cool ! N\'hésitez pas à partager l\'œuvre autour de vous.',
                'C\'est noté avec plaisir ! Merci de faire vivre le storytelling africain.',
              ];
              replyText = replies[Math.floor(Math.random() * replies.length)];
            }

            const replyMsg: ChatMessage = {
              id: `reply-${Date.now()}`,
              sender: 'user',
              text: replyText,
              timestamp: getCurrentTimeStr(),
            };

            return {
              ...c,
              lastMessage: replyText,
              lastMessageTime: replyMsg.timestamp,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Calculate unread count total & favorites total
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalFavorites = conversations.filter((c) => c.isFavorite).length;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilterTab === 'unread') return (c.unreadCount || 0) > 0;
    if (activeFilterTab === 'authors') return c.user.isVerified;
    if (activeFilterTab === 'favorites') return !!c.isFavorite;

    return true;
  });

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#0A0718] text-gray-100 overflow-hidden relative font-sans">
      
      {/* Hidden File Inputs for Attachments & Camera */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="*/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Floating Toast Notice Notification */}
      {toastNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000000] bg-indigo-600/90 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border border-indigo-400/40 animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Audio Call Simulation Modal */}
      {isAudioCallActive && (
        <div className="fixed inset-0 z-[10000000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 animate-fadeIn">
          <div className="text-center space-y-1 mt-6">
            <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Appel Vocal HD • BenSo
            </span>
            <h3 className="text-2xl font-black text-white pt-3">{activeConv.user.name}</h3>
            <p className="text-xs text-indigo-300/80 font-mono">
              {callSeconds === 0 ? 'Connexion en cours...' : `${Math.floor(callSeconds / 60)}:${callSeconds % 60 < 10 ? '0' : ''}${callSeconds % 60}`}
            </p>
          </div>

          {/* Avatar with Pulsing Ring */}
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400 via-indigo-500 to-purple-600 p-1 shadow-2xl animate-pulse">
              <img
                src={activeConv.user.avatar}
                alt={activeConv.user.name}
                className="w-full h-full rounded-full object-cover ring-4 ring-slate-950"
              />
            </div>
            <div className="absolute -inset-4 rounded-full border-2 border-emerald-500/30 animate-ping pointer-events-none" />
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center gap-6 mb-8">
            {/* Mute Button */}
            <button
              onClick={() => setIsCallMuted(!isCallMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-transform active:scale-95 shadow-xl cursor-pointer ${
                isCallMuted ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isCallMuted ? 'Micro désactivé' : 'Désactiver le micro'}
            >
              {isCallMuted ? '🔇' : '🎙️'}
            </button>

            {/* End Call Button */}
            <button
              onClick={() => setIsAudioCallActive(false)}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-2xl shadow-2xl shadow-rose-600/50 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Raccrocher"
            >
              📞
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setToastNotice('Haut-parleur activé 🔊')}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-transform active:scale-95 shadow-xl cursor-pointer"
              title="Haut-parleur"
            >
              🔊
            </button>
          </div>
        </div>
      )}

      {/* Message Context Options Popover Modal */}
      {activeMsgOptions && (
        <div
          onClick={() => setActiveMsgOptions(null)}
          className="fixed inset-0 z-[10000000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-[#161138] border border-indigo-900/60 rounded-3xl p-4 shadow-2xl space-y-2 animate-scaleUp"
          >
            <div className="text-center pb-2 border-b border-indigo-950/80">
              <span className="text-[11px] font-bold text-indigo-300">Options du message</span>
            </div>

            {/* 1. Répondre */}
            <button
              onClick={() => {
                setReplyingToMsg(activeMsgOptions);
                setActiveMsgOptions(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white hover:bg-indigo-600/30 transition-colors cursor-pointer"
            >
              <span>↩️</span>
              <span>Répondre</span>
            </button>

            {/* 2. Modifier (Sent Text Messages Only) */}
            {activeMsgOptions.sender === 'me' && activeMsgOptions.text && !activeMsgOptions.isAudio && (
              <button
                onClick={() => handleStartEditing(activeMsgOptions)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <span>✏️</span>
                <span>Modifier</span>
              </button>
            )}

            {/* 3. Copier (Text Messages Only) */}
            {activeMsgOptions.text && (
              <button
                onClick={() => handleCopyMessage(activeMsgOptions.text)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>📋</span>
                <span>Copier le texte</span>
              </button>
            )}

            {/* 4. Transférer */}
            <button
              onClick={() => handleForwardMessage(activeMsgOptions)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-indigo-200 hover:bg-indigo-600/30 transition-colors cursor-pointer"
            >
              <span>↗️</span>
              <span>Transférer</span>
            </button>

            {/* 5. Supprimer */}
            <button
              onClick={() => handleDeleteMessage(activeMsgOptions.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <span>🗑️</span>
              <span>Supprimer le message</span>
            </button>

            <button
              onClick={() => setActiveMsgOptions(null)}
              className="w-full mt-2 py-2 text-center text-xs text-gray-400 font-bold hover:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Image Zoom Modal Preview */}
      {selectedImagePreview && (
        <div
          onClick={() => setSelectedImagePreview(null)}
          className="fixed inset-0 z-[10000000] bg-black/95 flex items-center justify-center p-4 cursor-pointer animate-fadeIn backdrop-blur-xl"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImagePreview}
              alt="Photo grand format"
              className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute -top-4 -right-4 bg-rose-500 hover:bg-rose-600 text-white w-10 h-10 rounded-full font-black text-sm flex items-center justify-center shadow-xl transition-transform hover:scale-110"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      {/* ========================================================================= */}
      <div
        className={`w-full md:w-80 lg:w-[380px] bg-[#0E0A24] border-r border-indigo-950/70 flex flex-col shrink-0 h-full overflow-hidden ${
          activeMobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header Bar */}
        <div className="p-4 bg-[#130E2E]/80 backdrop-blur-xl border-b border-indigo-950/80 flex flex-col gap-3 shrink-0">
          
          {/* Main Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#110D27] flex items-center justify-center text-rose-400">
                  <MessageIcon size={20} />
                </div>
              </div>
              <div>
                <h2 className="font-black text-xl text-white tracking-tight">Messagerie</h2>
                <p className="text-[11px] text-indigo-300/80 font-medium">Échanges en direct avec les auteurs</p>
              </div>
            </div>
          </div>

          {/* Quick Active Authors Carousel (Stories Reels Style - ROUND AVATARS!) */}
          <div className="pt-1 pb-1 overflow-x-auto flex items-center gap-3.5 scrollbar-none">
            {QUICK_AUTHORS_STORIES.map((author) => (
              <button
                key={author.id}
                onClick={() => {
                  if (author.convId) {
                    handleSelectConv(author.convId);
                  }
                }}
                className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
              >
                <div className="relative">
                  <div className={`p-0.5 rounded-full transition-transform group-hover:scale-110 ${
                    author.isOnline
                      ? 'bg-gradient-to-tr from-emerald-400 via-indigo-500 to-rose-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white/10'
                  }`}>
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#0E0A24]"
                    />
                  </div>
                  {author.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0E0A24]" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-gray-300 group-hover:text-white truncate max-w-[56px]">
                  {author.name}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181338] text-xs text-white placeholder:text-indigo-300/40 pl-9 pr-8 py-2.5 rounded-2xl border border-indigo-900/40 focus:border-indigo-500/70 focus:outline-none transition-all shadow-inner"
            />
            <SearchIcon size={16} className="absolute left-3 top-3 text-indigo-400/60" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-white bg-white/10 w-4 h-4 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills Chips (Tous, Non lus, Auteurs, Favoris) */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'unread', label: totalUnread > 0 ? `Non lus (${totalUnread})` : 'Non lus' },
              { id: 'authors', label: 'Auteurs ⭐' },
              { id: 'favorites', label: totalFavorites > 0 ? `Favoris (${totalFavorites})` : 'Favoris' },
            ].map((tab) => {
              const isActive = activeFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md shadow-indigo-500/25 border border-rose-400/30'
                      : 'bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Conversations List Items (CLEAN & ELEGANT UNCLUTTERED LIST!) */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-none">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2 px-4">
              <p className="text-sm font-semibold">Aucune discussion trouvée</p>
              <p className="text-xs text-gray-500">
                {activeFilterTab === 'favorites'
                  ? 'Vous n\'avez encore marqué aucune discussion comme favorite.'
                  : 'Essayez de modifier vos mots-clés ou votre filtre.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilterTab('all'); }}
                className="text-xs text-rose-400 font-bold underline cursor-pointer mt-1 block mx-auto"
              >
                Afficher toutes les discussions
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const hasUnread = (conv.unreadCount || 0) > 0;
              const isFav = !!conv.isFavorite;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`px-3 py-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center gap-3 relative group border-b border-white/[0.05] ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-rose-600/15 border-l-4 border-l-rose-500'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Avatar with Status Indicator (PERFECT ROUND CIRCLE!) */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUserProfile?.(conv.user);
                    }}
                    className="relative shrink-0 cursor-pointer group/avatar"
                    title={`Voir le profil de ${conv.user.name}`}
                  >
                    <img
                      src={conv.user.avatar}
                      alt={conv.user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30 shadow-md group-hover/avatar:ring-rose-500/60 group-hover/avatar:scale-105 transition-all"
                    />
                    {conv.user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#0E0A24] shadow-md shadow-emerald-500/50" />
                    )}
                  </div>

                  {/* Clean Info & Last Message Snippet */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-extrabold text-sm text-white truncate group-hover:text-rose-200 transition-colors">
                          {conv.user.name}
                        </span>
                        {conv.user.isVerified && <VerifiedIcon size={14} className="shrink-0 text-amber-400" />}
                      </div>
                      <span className={`text-[10px] font-semibold shrink-0 ${hasUnread ? 'text-rose-400 font-bold' : 'text-indigo-300/60'}`}>
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {/* Last Message Text Snippet */}
                    <p className={`text-xs truncate font-medium ${hasUnread ? 'text-white font-bold' : 'text-gray-300/80'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge & Refined Sleek Favorite Star Toggle Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    {hasUnread && (
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}

                    {/* Refined Sleek SVG Favorite Star Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, conv.id)}
                      className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-125 hover:bg-white/10 ${
                        isFav
                          ? 'text-amber-400'
                          : 'text-gray-500/50 hover:text-amber-400'
                      }`}
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      aria-label="Favoris"
                    >
                      <StarIcon size={15} filled={isFav} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT MAIN CHAT SCREEN (100% FULLSCREEN OVERLAY ON MOBILE) */}
      {/* ========================================================================= */}
      <div
        className={`bg-[#0A0718] flex flex-col overflow-hidden ${
          activeMobileView === 'chat'
            ? 'fixed inset-0 z-[9999999] h-[100dvh] w-screen flex flex-col bg-[#0A0718] md:relative md:inset-auto md:z-auto md:flex-1 md:h-full md:w-auto'
            : 'hidden md:flex md:flex-1 h-full'
        }`}
      >
        {/* Ambient Dark Purple Background Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar (STICKY FIXED AT TOP OF CHAT) */}
        <div className="sticky top-0 z-50 shrink-0 p-3 sm:p-4 bg-[#110D2A]/90 backdrop-blur-2xl border-b border-indigo-950/80 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            
            {/* Back Button (Mobile Only) */}
            <button
              type="button"
              onClick={handleBackToList}
              className="md:hidden text-indigo-300 hover:text-white p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Retour aux discussions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            {/* Avatar & User Info - Click to view profile */}
            <div 
              onClick={() => onOpenUserProfile?.(activeConv.user)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity group/chatuser"
              title={`Voir le profil de ${activeConv.user.name}`}
            >
              <div className="relative shrink-0">
                <img
                  src={activeConv.user.avatar}
                  alt={activeConv.user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50 group-hover/chatuser:ring-rose-500/60 transition-all shadow-md"
                />
                {activeConv.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#110D2A]" />
                )}
              </div>

              {/* Name, Verified Badge & Online Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate group-hover/chatuser:text-rose-200 transition-colors">{activeConv.user.name}</h3>
                  {activeConv.user.isVerified && <VerifiedIcon size={14} className="shrink-0 text-amber-400" />}
                </div>
                <p className="text-[11px] text-indigo-300/80 flex items-center gap-1 font-medium truncate">
                  <span className={activeConv.user.isOnline ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                    {activeConv.user.isOnline ? 'en ligne' : 'hors ligne'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Clean Header Actions: Audio Call Button 📞 + Subtle Favorite Star Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio Call Button 📞 */}
            <button
              type="button"
              onClick={() => setIsAudioCallActive(true)}
              className="p-2 rounded-xl transition-all cursor-pointer text-indigo-300 hover:text-emerald-400 hover:bg-white/10 active:scale-110"
              title="Démarrer un appel vocal HD"
            >
              <PhoneIcon size={18} />
            </button>

            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={(e) => handleToggleFavorite(e, activeConv.id)}
              className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-white/10 active:scale-110 ${
                activeConv.isFavorite
                  ? 'text-amber-400'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
              title={activeConv.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <StarIcon size={18} filled={activeConv.isFavorite} />
            </button>
          </div>
        </div>

        {/* Scrollable Messages Feed Area (ONLY THIS SCROLLS!) */}
        <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto space-y-3.5 relative z-10 scrollbar-none">
          
          {/* Today Date Floating Badge */}
          <div className="flex justify-center my-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300/90 bg-[#17113A]/90 px-4 py-1 rounded-full border border-indigo-800/40 backdrop-blur-md shadow-md">
              Aujourd'hui
            </span>
          </div>

          {activeConv.messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end group/msg ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {/* Author Avatar for Received Messages */}
                {!isMe && (
                  <img
                    src={activeConv.user.avatar}
                    alt={activeConv.user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mb-0.5 shadow-sm"
                  />
                )}

                {/* Message Bubble Container with Action Trigger */}
                <div className="relative group flex items-center gap-1.5 max-w-[85%] sm:max-w-[72%]">
                  
                  {/* Action Menu Button (Shown on Hover / Touch) */}
                  <button
                    onClick={() => setActiveMsgOptions(msg)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-white rounded-lg bg-black/40 hover:bg-black/60 text-xs shrink-0 cursor-pointer ${
                      isMe ? 'order-first' : 'order-last'
                    }`}
                    title="Options du message"
                  >
                    •••
                  </button>

                  <div
                    onClick={() => setActiveMsgOptions(msg)}
                    className={`w-full px-4 py-2.5 rounded-2xl shadow-lg relative text-xs sm:text-sm leading-relaxed transition-all cursor-pointer ${
                      isMe
                        ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-tr-xs border border-indigo-400/20 shadow-indigo-950/50'
                        : 'bg-[#1C173B]/95 text-gray-100 border border-indigo-900/40 rounded-tl-xs shadow-black/40 backdrop-blur-md'
                    }`}
                  >
                    {/* Quoted Replied Message Header if available */}
                    {msg.replyToMessage && (
                      <div className="mb-1.5 p-2 rounded-xl bg-black/25 border-l-3 border-indigo-400 text-[11px] space-y-0.5">
                        <span className="font-bold text-indigo-300">{msg.replyToMessage.senderName}</span>
                        <p className="truncate opacity-80">{msg.replyToMessage.text}</p>
                      </div>
                    )}

                    {/* 1. Ultra-Sleek Single Line Audio Track Player */}
                    {msg.isAudio ? (
                      <div className="flex items-center gap-2.5 py-0.5 min-w-[210px] sm:min-w-[250px]">
                        {/* Play / Pause Circular Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 text-[11px] font-black cursor-pointer ${
                            isMe
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                          title={playingAudioId === msg.id ? 'Mettre en pause' : 'Écouter l\'audio'}
                        >
                          {playingAudioId === msg.id ? '⏸' : '▶'}
                        </button>

                        {/* Horizontal Audio Waveform Track */}
                        <div className="flex-1 flex items-center gap-0.5 h-4.5 px-0.5 cursor-pointer">
                          {[25, 55, 35, 80, 50, 95, 40, 70, 45, 90, 30, 65, 50, 85, 35, 60, 40, 75].map((h, i) => {
                            const isPlayed = playingAudioId === msg.id && i < 9;
                            return (
                              <span
                                key={i}
                                style={{ height: `${h}%` }}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  isPlayed
                                    ? 'bg-cyan-300 shadow-xs shadow-cyan-300'
                                    : playingAudioId === msg.id
                                    ? 'bg-indigo-300 animate-pulse'
                                    : isMe ? 'bg-white/40' : 'bg-indigo-400/50'
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Duration & Timestamp Inline (Right side) */}
                        <div className={`flex items-center gap-1.5 text-[10px] font-mono shrink-0 select-none ${
                          isMe ? 'text-indigo-200/90' : 'text-gray-400'
                        }`}>
                          <span className="font-semibold">{msg.audioDuration || '0:14'}</span>
                          <span>{msg.timestamp}</span>
                          {isMe && <span className="text-cyan-300 font-extrabold text-[11px]">✓✓</span>}
                        </div>
                      </div>
                    ) : msg.imageUrl ? (
                      /* 2. Photo / Image Message Card */
                      <div className="space-y-2">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImagePreview(msg.imageUrl || null);
                          }}
                          className="rounded-xl overflow-hidden cursor-pointer group relative max-w-sm border border-white/20 shadow-md"
                        >
                          <img
                            src={msg.imageUrl}
                            alt="Photo partagée"
                            className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1 backdrop-blur-xs">
                            🔍 Agrandir
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          {msg.text && <p className="text-xs">{msg.text}</p>}
                          <div className={`flex items-center gap-1 text-[10px] font-mono shrink-0 ml-auto select-none ${isMe ? 'text-indigo-200/90' : 'text-gray-400'}`}>
                            {msg.isEdited && <span className="italic text-[9px] mr-1">modifié</span>}
                            <span>{msg.timestamp}</span>
                            {isMe && <span className="text-cyan-300 font-extrabold text-[11px]">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    ) : msg.fileInfo ? (
                      /* 3. Document / File Attachment Message Card */
                      <div className="space-y-2 min-w-[210px]">
                        <div className="flex items-center gap-3 p-2.5 bg-white/10 rounded-xl border border-white/15">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-white truncate">{msg.fileInfo.name}</p>
                            <p className="text-[10px] text-indigo-200 font-medium">{msg.fileInfo.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Téléchargement du document ${msg.fileInfo?.name}`);
                            }}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors shrink-0 font-bold"
                            title="Télécharger"
                          >
                            ⬇️
                          </button>
                        </div>
                        <div className={`flex justify-end gap-1 text-[10px] font-mono select-none ${isMe ? 'text-indigo-200/90' : 'text-gray-400'}`}>
                          {msg.isEdited && <span className="italic text-[9px] mr-1">modifié</span>}
                          <span>{msg.timestamp}</span>
                          {isMe && <span className="text-cyan-300 font-extrabold text-[11px]">✓✓</span>}
                        </div>
                      </div>
                    ) : (
                      /* 4. Normal Text Message - Flex layout for seamless text + timestamp integration */
                      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                        <p className="text-[13.5px] leading-relaxed font-normal whitespace-pre-wrap break-words flex-1">
                          {msg.text}
                        </p>
                        <div className={`flex items-center gap-1 text-[10px] font-mono shrink-0 select-none ml-auto pb-0.5 ${
                          isMe ? 'text-indigo-200/90' : 'text-gray-400'
                        }`}>
                          {msg.isEdited && <span className="italic text-[9px] mr-1">modifié</span>}
                          <span>{msg.timestamp}</span>
                          {isMe && <span className="text-cyan-300 font-extrabold text-[11px]">✓✓</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker Popover Drawer */}
        {showEmojiPicker && (
          <div className="bg-[#140F30] border-t border-indigo-950/80 flex flex-col z-30 animate-fadeIn max-h-56 shrink-0 shadow-2xl">
            {/* Category Tabs */}
            <div className="flex items-center justify-around bg-black/40 border-b border-indigo-950/60 p-2">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveEmojiCategory(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeEmojiCategory === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Emojis Grid */}
            <div className="p-3 overflow-y-auto grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-40 scrollbar-none">
              {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputMessage((prev) => prev + emoji);
                    setLastUsedEmoji(emoji);
                  }}
                  className="text-xl p-1.5 hover:bg-white/10 rounded-xl transition-transform hover:scale-125 active:scale-95 cursor-pointer text-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp Attachment Options Drawer */}
        {showAttachMenu && (
          <div className="px-4 py-3.5 bg-[#161135] border-t border-indigo-950/80 flex items-center justify-around z-30 animate-fadeIn shrink-0 shadow-2xl">
            {/* 1. Caméra Directe */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                cameraInputRef.current?.click();
              }}
              className="flex flex-col items-center gap-1.5 text-gray-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                📷
              </div>
              <span className="text-[11px] font-bold">Caméra</span>
            </button>

            {/* 2. Galerie Photos */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                imageInputRef.current?.click();
              }}
              className="flex flex-col items-center gap-1.5 text-gray-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                🖼️
              </div>
              <span className="text-[11px] font-bold">Galerie</span>
            </button>

            {/* 3. Document / Fichier */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                fileInputRef.current?.click();
              }}
              className="flex flex-col items-center gap-1.5 text-gray-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                📄
              </div>
              <span className="text-[11px] font-bold">Document</span>
            </button>
          </div>
        )}

        {/* Quoted Message / Editing Banner above input */}
        {(replyingToMsg || editingMsg) && (
          <div className="px-4 py-2 bg-[#17123A] border-t border-indigo-950/80 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="text-amber-400 font-bold shrink-0">
                {editingMsg ? '✏️ Modification du message :' : '↩️ Réponse à :'}
              </span>
              <p className="text-gray-300 truncate">
                {editingMsg ? editingMsg.text : replyingToMsg?.text}
              </p>
            </div>
            <button
              onClick={() => {
                setReplyingToMsg(null);
                setEditingMsg(null);
                setInputMessage('');
              }}
              className="text-xs text-gray-400 hover:text-white p-1 rounded-full bg-white/10"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bottom Input Bar (STICKY FIXED AT BOTTOM OF CHAT) */}
        <div className="sticky bottom-0 z-50 shrink-0 p-2.5 sm:p-3.5 bg-[#100C29]/95 backdrop-blur-2xl border-t border-indigo-950/80 flex items-center gap-2 shadow-2xl">
          
          {/* Audio Recording Active Mode */}
          {isRecordingAudio ? (
            <div className={`flex-1 flex items-center justify-between border rounded-full px-4 py-2 transition-all ${
              isPausedAudio
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}>
              {/* Left Indicator & Waveform Preview */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  isPausedAudio
                    ? isPreviewPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
                    : 'bg-rose-500 animate-ping'
                }`} />

                {/* Animated Waveform Equalizer */}
                <div className="flex items-end gap-0.5 h-4 px-1 shrink-0">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-0.5 rounded-full transition-all duration-300 ${
                        !isPausedAudio || isPreviewPlaying
                          ? isPreviewPlaying ? 'bg-cyan-300 animate-pulse' : 'bg-rose-400 animate-pulse'
                          : 'bg-amber-400/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Live Timer */}
                <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 shrink-0">
                  {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? `0${recordingSeconds % 60}` : recordingSeconds % 60}
                </span>
              </div>

              {/* Action Buttons: 100% ICON ONLY (No words like Pause or Reprendre) */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* 1. Pause or Resume Button (ICON ONLY) */}
                {!isPausedAudio ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPausedAudio(true);
                      setIsPreviewPlaying(false);
                    }}
                    className="w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/40 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
                    title="Mettre en pause l'enregistrement"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPausedAudio(false);
                      setIsPreviewPlaying(false);
                    }}
                    className="w-9 h-9 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
                    title="Reprendre l'enregistrement"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </button>
                )}

                {/* 2. Listen / Preview Audio Button (ICON ONLY - Only visible when paused) */}
                {isPausedAudio && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md ${
                      isPreviewPlaying
                        ? 'bg-cyan-500 text-white border-cyan-300 shadow-cyan-500/50'
                        : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-500/40'
                    }`}
                    title={isPreviewPlaying ? "Mettre en pause l'écoute" : "Écouter l'enregistrement avant d'envoyer"}
                  >
                    {isPreviewPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                )}

                {/* 3. Cancel / Trash Button (ICON ONLY) */}
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-rose-300 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md"
                  title="Annuler et supprimer l'enregistrement"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* 4. Send Audio Button (ICON ONLY) */}
                <button
                  type="button"
                  onClick={handleSendAudioRecording}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 cursor-pointer text-sm"
                  title="Envoyer la note vocale"
                >
                  ➔
                </button>
              </div>
            </div>
          ) : (
            /* Standard Message Pill Input Form */
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[#17123A] rounded-full border border-indigo-900/50 px-3.5 py-2 focus-within:border-indigo-500 focus-within:bg-[#1E184A] transition-all shadow-inner">
                
                {/* Emoji Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachMenu(false);
                  }}
                  className={`p-1 text-lg shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                    showEmojiPicker ? 'scale-125 text-amber-400' : 'text-gray-300 hover:text-white'
                  }`}
                  title="Choisir un émoji"
                >
                  {lastUsedEmoji}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder={editingMsg ? "Modifier le message..." : "Écrire un message..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onFocus={() => {
                    setShowEmojiPicker(false);
                    setShowAttachMenu(false);
                  }}
                  className="flex-1 bg-transparent text-white text-xs sm:text-sm px-2.5 py-0.5 focus:outline-none placeholder:text-indigo-300/40"
                />

                {/* Attachment Clip Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu);
                    setShowEmojiPicker(false);
                  }}
                  className={`p-1 rounded-full transition-colors text-lg shrink-0 cursor-pointer ${
                    showAttachMenu ? 'text-rose-400 bg-white/10' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Joindre (Caméra, Galerie, Document)"
                >
                  📎
                </button>
              </div>

              {/* Action Button: Send or Mic */}
              {inputMessage.trim() ? (
                <button
                  type="submit"
                  className={`w-10 h-10 rounded-full font-black text-sm shadow-md flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 cursor-pointer text-white ${
                    editingMsg ? 'bg-amber-500 hover:bg-amber-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                  }`}
                  title={editingMsg ? "Enregistrer les modifications" : "Envoyer"}
                >
                  {editingMsg ? '✓' : '➔'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base shadow-md flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
                  title="Enregistrer une note vocale"
                >
                  🎙️
                </button>
              )}
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
