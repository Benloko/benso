'use client';

import React, { useState } from 'react';
import { BellIcon, HeartIcon, CommentIcon, VerifiedIcon, SparklesIcon } from './Icons';

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'sale' | 'follow' | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  amountFCFA?: number;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'sale',
    title: 'Nouvelle Vente Mobile Money 💰',
    description: 'Amina Kouyaté a débloqué votre œuvre "Les Amazones du Dahomey".',
    time: 'Il y a 10 min',
    isRead: false,
    amountFCFA: 500,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'notif-2',
    type: 'comment',
    title: 'Nouveau Commentaire 💬',
    description: 'Amara Diop a écrit : "Une histoire vraiment captivante, bravo !" sur Les Secrets de Kétou.',
    time: 'Il y a 35 min',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'notif-3',
    type: 'like',
    title: 'Coup de Cœur ❤️',
    description: 'Koffi Mensah et 12 autres personnes ont aimé votre récits.',
    time: 'Il y a 2h',
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'notif-4',
    type: 'follow',
    title: 'Nouveau Lecteur Abonné 🌟',
    description: 'Mariam Sow s\'est abonnée à votre profil auteur.',
    time: 'Hier à 19:40',
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'sales'>('all');

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'sales') return n.type === 'sale';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-[#120E2B] rounded-t-3xl sm:rounded-3xl border border-indigo-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-950/80 flex items-center justify-between bg-[#171236]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <BellIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount} nouvelle(s)
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-indigo-300/70">Activité récente sur vos histoires et votre compte</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills & Actions */}
        <div className="p-3 bg-[#151033] border-b border-indigo-950/60 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'unread', label: `Non lues (${unreadCount})` },
              { id: 'sales', label: 'Ventes 💰' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-indigo-300 hover:text-white font-semibold underline shrink-0 cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs space-y-2">
              <SparklesIcon size={32} className="mx-auto text-indigo-400/50" />
              <p>Aucune notification dans cette catégorie.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                  );
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.isRead
                    ? 'bg-[#151030]/50 border-indigo-950/60 opacity-80'
                    : 'bg-[#1E1742] border-indigo-500/40 shadow-lg shadow-indigo-950/50'
                }`}
              >
                {/* Avatar / Icon */}
                <div className="relative shrink-0">
                  {notif.avatar ? (
                    <img
                      src={notif.avatar}
                      alt="Notification avatar"
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                      🔔
                    </div>
                  )}
                  {notif.type === 'sale' && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] p-0.5 rounded-full shadow">
                      💰
                    </span>
                  )}
                  {notif.type === 'like' && (
                    <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] p-0.5 rounded-full shadow">
                      ❤️
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-white truncate">{notif.title}</h4>
                    <span className="text-[10px] text-indigo-300/60 font-mono shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-snug">{notif.description}</p>
                  {notif.amountFCFA && (
                    <span className="inline-block text-[11px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      +{notif.amountFCFA} F CFA reçus
                    </span>
                  )}
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
