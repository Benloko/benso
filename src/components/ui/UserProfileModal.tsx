'use client';

import React, { useState } from 'react';
import { StoryItem, StoryCard } from './StoryCard';
import { VerifiedIcon, MessageSquareIcon, LinkIcon } from './Icons';

export interface UserProfileData {
  name: string;
  avatar: string;
  handle?: string;
  role?: string;
  isVerified?: boolean;
  isCreator?: boolean; // true = Créateur/Auteur (avec étoile ⭐), false = Membre Lecteur
  coverImage?: string;
  bio?: string;
  followersCount?: string;
  followingCount?: string;
  publicationsCount?: number;
}

interface UserProfileModalProps {
  user: UserProfileData | null;
  isOpen: boolean;
  stories: StoryItem[];
  unlockedStoryIds: string[];
  onClose: () => void;
  onOpenStoryDetail: (story: StoryItem) => void;
  onOpenPaymentModal: (story: StoryItem) => void;
  onOpenComments?: (story: StoryItem) => void;
  onOpenShare?: (story: StoryItem) => void;
  onOpenMessage?: (userName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  stories,
  unlockedStoryIds,
  onClose,
  onOpenStoryDetail,
  onOpenPaymentModal,
  onOpenComments,
  onOpenShare,
  onOpenMessage,
}) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'my_stories' | 'about'>('my_stories');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'audio'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAvatarFullscreenOpen, setIsAvatarFullscreenOpen] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  // Default animated gradient themes for cover & avatar when no custom photo is provided
  const defaultThemes = [
    {
      cover: 'from-purple-950 via-indigo-950 to-rose-950',
      avatar: 'from-purple-700 via-indigo-700 to-rose-600',
    },
    {
      cover: 'from-cyan-950 via-blue-950 to-indigo-950',
      avatar: 'from-cyan-700 via-blue-700 to-indigo-600',
    },
    {
      cover: 'from-rose-950 via-pink-950 to-purple-950',
      avatar: 'from-rose-700 via-pink-700 to-purple-600',
    },
    {
      cover: 'from-emerald-950 via-teal-950 to-indigo-950',
      avatar: 'from-emerald-700 via-teal-700 to-indigo-600',
    },
  ];

  const activeTheme = defaultThemes[user.name.length % defaultThemes.length];

  const isCreator = user.isCreator !== false;

  // Filter stories authored by this user
  const authorStories = stories.filter(
    (s) => s.author.name.toLowerCase().includes(user.name.toLowerCase()) ||
           (user.handle && s.author.handle?.toLowerCase() === user.handle.toLowerCase())
  );

  const fallbackStories = authorStories.length > 0 ? authorStories : stories.slice(0, 2);

  // Dynamic filtering by media type
  const filteredStories = fallbackStories.filter((s) => {
    if (filterType === 'all') return true;
    const cat = s.category.toLowerCase();
    if (filterType === 'text') return cat.includes('roman') || cat.includes('conte') || cat.includes('écrit') || !s.mediaUrl;
    if (filterType === 'image') return cat.includes('bd') || cat.includes('image') || cat.includes('art');
    if (filterType === 'video') return cat.includes('vidéo') || s.mediaUrl?.includes('mp4');
    if (filterType === 'audio') return cat.includes('audio') || cat.includes('podcast') || s.mediaUrl?.includes('mp3');
    return true;
  });

  const filterOptions = [
    { id: 'all', label: 'Tout', icon: '🌟' },
    { id: 'text', label: 'Lyrique', icon: '📝' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'video', label: 'Vidéo', icon: '🎥' },
    { id: 'audio', label: 'Audio', icon: '🎙️' },
  ];

  const getFilterLabel = () => {
    const found = filterOptions.find((f) => f.id === filterType);
    return found && filterType !== 'all' ? `Publications (${found.label})` : 'Publications';
  };

  const userBio = user.bio || (
    user.name.includes('Amina')
      ? 'Auteure & Conteuse passionnée. J\'explore les secrets du patrimoine oral africain et des légendes oubliées.'
      : user.name.includes('Amara')
      ? 'Écrivain & Scénariste. Créateur de récits fantastiques et romances ancrées dans les traditions d\'Afrique de l\'Ouest.'
      : isCreator
      ? 'Auteur passionné sur BenSo. Découvrez mes dernières publications et récits immersifs.'
      : 'Lecteur passionné sur BenSo. J\'aime lire, écouter et découvrir de nouveaux récits.'
  );

  const followersDisplay = user.followersCount || (user.name.includes('Amina') ? '1,2k' : user.name.includes('Amara') ? '890' : '1,5k');
  const followingDisplay = user.followingCount || '148';

  return (
    <div className="fixed inset-0 z-[100000] bg-[#0B0914] text-gray-100 overflow-y-auto animate-fadeIn select-none">
      
      {/* Sticky Top Header Bar with Back Button */}
      <div className="sticky top-0 z-40 bg-[#0B0914]/90 backdrop-blur-md px-4 py-3 border-b border-indigo-950/80 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="text-sm">←</span>
          <span>Retour</span>
        </button>

        <span className="text-xs font-black tracking-widest text-indigo-300 uppercase">
          {isCreator ? 'Profil Auteur' : 'Profil Membre'}
        </span>

        <div className="w-16" />
      </div>

      {/* Main Profile Page Body - Exactly matching ProfileView.tsx layout & widths */}
      <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 space-y-4 pb-28">

        {/* 1. Cover Banner Card (Exact match with ProfileView line 136-164) */}
        <div className="relative rounded-3xl overflow-hidden h-36 sm:h-48 w-full shadow-2xl border border-indigo-950/80">
          
          {user.coverImage ? (
            <img
              src={user.coverImage}
              alt={`Couverture de ${user.name}`}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${activeTheme.cover} relative overflow-hidden flex items-center justify-center p-4 shadow-inner`}>
              {/* Animated Ambient Glowing Orbs */}
              <div className="absolute -top-12 -left-12 w-56 h-56 bg-rose-500/25 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-indigo-500/30 rounded-full blur-3xl animate-bounce" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />

              {/* Massive, Bold, Italic & Slanted Animated User Name Typography */}
              <div className="relative z-10 text-center animate-pulse -skew-x-6 sm:-skew-x-12 transform">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 via-rose-200 to-amber-200 drop-shadow-[0_8px_30px_rgba(244,63,94,0.75)] select-none leading-none">
                  {user.name}
                </h1>
                <p className="text-[10px] sm:text-xs text-indigo-200/80 font-black tracking-widest uppercase mt-1.5 italic">
                  ✨ {user.role || (isCreator ? 'AUTEUR BENSO' : 'MEMBRE LECTEUR')}
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* 2. Profile Info (Avatar, Name, Followers) - Exact match with ProfileView line 198-250 */}
        <div className="px-2 sm:px-4 relative flex items-end gap-3.5 sm:gap-4 -mt-8 sm:-mt-10 z-10">
          
          {/* Avatar Container */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => setIsAvatarFullscreenOpen(true)}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#0A0718] shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-slate-900 group relative"
              title="Voir la photo de profil"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-tr ${activeTheme.avatar} flex items-center justify-center p-2 text-white shadow-inner`}>
                  <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* User Name & Social Stats */}
          <div className="space-y-1 pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{user.name}</h1>
              {isCreator && <VerifiedIcon size={20} className="text-amber-400 shrink-0" />}
            </div>
            
            <div className="flex items-center gap-4 text-xs pt-0.5">
              {isCreator && (
                <div className="text-left flex items-center gap-1">
                  <span className="font-extrabold text-white">{followersDisplay}</span>
                  <span className="text-gray-400">Abonnés</span>
                </div>
              )}
              <div className="text-left flex items-center gap-1">
                <span className="font-extrabold text-white">{followingDisplay}</span>
                <span className="text-gray-400">Abonnements</span>
              </div>
            </div>
          </div>

        </div>

        {/* User Bio Card */}
        <div className="px-2 sm:px-4 pt-1">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-indigo-900/40 backdrop-blur-sm">
            <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed italic">
              💬 {userBio}
            </p>
          </div>
        </div>

        {/* Toast Notice for Copy Link */}
        {copyToast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[1000000] bg-emerald-600/90 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border border-emerald-400/40 animate-bounce flex items-center gap-2">
            <span>🔗</span>
            <span>Lien du profil copié avec succès !</span>
          </div>
        )}

        {/* 3. Action Buttons (No card container, compact, clean & pro) */}
        <div className="px-2 sm:px-4 flex items-center gap-2 pt-1">
          {/* Follow / Unfollow Toggle Button - ONLY for Creators! */}
          {isCreator && (
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`py-2 px-4 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                isFollowing
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30 hover:bg-white/15'
                  : 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white hover:opacity-90 shadow-md shadow-rose-500/20'
              }`}
            >
              <span>{isFollowing ? '✓ Abonné(e)' : '➕ S\'abonner'}</span>
            </button>
          )}

          {/* Message Button (Directly opens chat!) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMessage?.(user.name);
            }}
            className={`py-2 px-4 rounded-xl active:scale-95 text-white border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer font-extrabold text-xs transition-all ${
              !isCreator
                ? 'flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-md shadow-indigo-500/20'
                : 'bg-white/10 hover:bg-white/15'
            }`}
            title={`Envoyer un message à ${user.name}`}
          >
            <MessageSquareIcon size={15} />
            <span>Message</span>
          </button>

          {/* Copy Profile Link Button (Link icon 🔗) */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopyToast(true);
              setTimeout(() => setCopyToast(false), 3000);
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/10 flex items-center justify-center cursor-pointer text-xs transition-all"
            title="Copier le lien du profil"
          >
            <LinkIcon size={16} />
          </button>
        </div>

        {/* 4. Content Section: Tabs for Creators, Direct Reader Info for Readers */}
        {isCreator ? (
          <>
            {/* Tab Navigation: Publications ▾ Dropdown & À propos */}
            <div className="relative flex items-center gap-3 pt-2 z-30">
              
              {/* Publications Tab with Vertical Dropdown Filter Menu */}
              <div className="relative">
                <div
                  className={`rounded-2xl text-xs font-extrabold transition-all flex items-center shadow-lg ${
                    activeProfileTab === 'my_stories'
                      ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-indigo-950/80 border border-rose-400/30'
                      : 'bg-[#171330] border border-indigo-900/50 hover:bg-[#1f1940] text-gray-300'
                  }`}
                >
                  {/* Main Publications Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('my_stories');
                      setIsFilterOpen(false);
                    }}
                    className="px-4 py-2.5 hover:opacity-90 transition-opacity cursor-pointer font-extrabold"
                  >
                    {getFilterLabel()}
                  </button>

                  {/* Divider */}
                  <span className="w-px h-4 bg-white/20" />

                  {/* Small Arrow Trigger: ONLY clicking this opens/toggles the filter dropdown menu */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeProfileTab !== 'my_stories') {
                        setActiveProfileTab('my_stories');
                      }
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    className="px-2.5 py-2.5 hover:bg-white/10 rounded-r-2xl transition-colors cursor-pointer flex items-center justify-center text-[10px]"
                    title="Filtrer les publications par format"
                  >
                    <span className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>

                {/* Filter Dropdown Popover (Vertical list, NO icons) */}
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#181338]/95 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl p-1.5 z-[100] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] text-indigo-300/70 font-bold uppercase tracking-wider px-3 py-1 border-b border-indigo-900/40">
                      Filtrer par format
                    </div>
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setFilterType(opt.id as any);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          filterType === opt.id
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {filterType === opt.id && <span className="text-rose-400 font-extrabold text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About Tab Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveProfileTab('about');
                  setIsFilterOpen(false);
                }}
                className={`py-2.5 px-6 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeProfileTab === 'about'
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-950/80 border border-rose-400/30'
                    : 'bg-[#171330] border border-indigo-900/50 hover:bg-[#1f1940] text-gray-300'
                }`}
              >
                À propos
              </button>
            </div>

            {/* Main Content Section */}
            {activeProfileTab === 'my_stories' ? (
              <div className="space-y-4 pt-1">
                {filteredStories.length > 0 ? (
                  filteredStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onOpenStoryDetail={onOpenStoryDetail}
                      onOpenPaymentModal={onOpenPaymentModal}
                      onOpenComments={onOpenComments}
                      onOpenShare={onOpenShare}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center bg-[#151226] rounded-3xl border border-indigo-900/40 space-y-2">
                    <p className="text-sm text-gray-400 font-medium">Aucune publication trouvée dans cette catégorie pour cet auteur.</p>
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className="px-4 py-2 rounded-2xl bg-indigo-600/50 hover:bg-indigo-600 text-white text-xs font-bold transition-all"
                    >
                      Voir toutes les publications
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* About Section */
              <div className="space-y-3 text-xs text-gray-300 pt-1">
                <div className="p-5 rounded-3xl bg-[#151226] border border-indigo-900/40 space-y-2 shadow-xl">
                  <h4 className="font-extrabold text-white text-sm">Biographie & Récits</h4>
                  <p className="leading-relaxed">{userBio}</p>
                </div>

                <div className="p-5 rounded-3xl bg-[#151226] border border-indigo-900/40 space-y-2 shadow-xl">
                  <h4 className="font-extrabold text-white text-sm">Membre BenSo</h4>
                  <p>Auteur certifié BenSo • Membre depuis janvier 2024</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Reader Profile Content (No Publications tab, clean & elegant) */
          <div className="space-y-3 pt-2 text-xs text-gray-300">
            <div className="p-5 rounded-3xl bg-[#151226]/80 border border-indigo-900/40 space-y-2 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-base">📖</span>
                <h4 className="font-extrabold text-white text-sm">Membre Lecteur BenSo</h4>
              </div>
              <p className="text-gray-300 leading-relaxed">
                <span className="font-bold text-white">{user.name}</span> est un membre lecteur sur BenSo. Ce membre privilégie la lecture, l'écoute et la découverte de récits passionnants.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#151226]/80 border border-indigo-900/40 space-y-1.5 shadow-xl backdrop-blur-md">
              <h4 className="font-extrabold text-white text-sm">Statut du compte</h4>
              <p className="text-indigo-300/80 font-medium">Lecteur passionné • Membre actif depuis janvier 2024</p>
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Avatar Viewer Modal */}
      {isAvatarFullscreenOpen && (
        <div
          onClick={() => setIsAvatarFullscreenOpen(false)}
          className="fixed inset-0 z-[1000000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-72 h-72 sm:w-96 sm:h-96 rounded-full object-cover shadow-2xl ring-4 ring-rose-500/40 border-4 border-white/20 animate-scaleUp"
          />
          <p className="mt-4 text-xs text-indigo-200 font-bold uppercase tracking-widest">
            {user.name}
          </p>
          <button
            type="button"
            onClick={() => setIsAvatarFullscreenOpen(false)}
            className="mt-6 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

    </div>
  );
};
