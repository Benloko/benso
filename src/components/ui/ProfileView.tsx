'use client';

import React, { useState } from 'react';
import { StoryItem, StoryCard } from './StoryCard';
import { LibraryView } from './LibraryView';
import { VerifiedIcon, BookOpenIcon } from './Icons';

interface ProfileViewProps {
  stories: StoryItem[];
  unlockedStoryIds: string[];
  onOpenStoryDetail: (story: StoryItem) => void;
  onOpenPaymentModal: (story: StoryItem) => void;
  onOpenComments?: (story: StoryItem) => void;
  onOpenShare?: (story: StoryItem) => void;
  onNavigateHome: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  stories,
  unlockedStoryIds,
  onOpenStoryDetail,
  onOpenPaymentModal,
  onOpenComments,
  onOpenShare,
  onNavigateHome,
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'my_stories' | 'library'>('my_stories');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'audio'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [avatarImage] = useState<string>(
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  );
  const [coverImage] = useState<string>(
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85'
  );
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Filter stories authored by current user (Ben HOUNSA)
  const myAuthoredStories = stories.filter(
    (s) => s.author.name.toLowerCase().includes('ben') || s.author.handle === '@benhounsa'
  );

  // Dynamic filtering by media type
  const filteredAuthoredStories = myAuthoredStories.filter((s) => {
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
    { id: 'text', label: 'Écrit', icon: '📝' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'video', label: 'Vidéo', icon: '🎥' },
    { id: 'audio', label: 'Audio', icon: '🎙️' },
  ];

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const getFilterLabel = () => {
    const found = filterOptions.find((f) => f.id === filterType);
    return found && filterType !== 'all' ? `Publications (${found.label})` : 'Publications';
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-gray-100 p-3 sm:p-5 space-y-4 pb-28">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000000] bg-indigo-600/90 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border border-indigo-400/40 animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastNotice}</span>
        </div>
      )}

      {/* 1. Cover Banner Card */}
      <div className="relative rounded-3xl overflow-hidden h-36 sm:h-48 w-full bg-slate-950 shadow-xl border border-indigo-950/80">
        <img
          src={coverImage}
          alt="Bannière de profil"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Settings Gear Icon (⚙️) */}
        <button
          type="button"
          onClick={() => showToast('Paramètres du compte BenSo & Mode Sombre')}
          className="absolute top-3 right-3 p-2.5 rounded-2xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
          title="Paramètres"
        >
          ⚙️
        </button>

        {/* Change Cover Camera Button (📷) */}
        <button
          type="button"
          onClick={() => showToast('Changer la photo de couverture')}
          className="absolute bottom-2.5 right-3 px-3 py-1.5 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer z-10"
          title="Modifier la couverture"
        >
          <span>📷</span>
          <span className="hidden sm:inline text-[11px]">Couverture</span>
        </button>
      </div>

      {/* 2. Profile Info (Avatar, Name, Followers) */}
      <div className="px-2 sm:px-4 relative flex items-end gap-3.5 sm:gap-4 -mt-8 sm:-mt-10 z-10">
        
        {/* Avatar */}
        <div className="relative shrink-0 group">
          <img
            src={avatarImage}
            alt="Ben HOUNSA"
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#0A0718] shadow-2xl bg-slate-900"
          />
          <button
            type="button"
            onClick={() => showToast('Modifier la photo de profil')}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-lg ring-2 ring-[#0A0718] transition-transform active:scale-110 cursor-pointer text-xs"
            title="Changer la photo"
          >
            📸
          </button>
        </div>

        {/* User Name & Social Stats */}
        <div className="space-y-1 pb-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">Ben HOUNSA</h1>
            <VerifiedIcon size={20} className="text-amber-400 shrink-0" />
          </div>
          
          <div className="flex items-center gap-4 text-xs pt-0.5">
            <button 
              onClick={() => showToast('Liste de vos 1,2k abonnés')}
              className="hover:underline text-left cursor-pointer flex items-center gap-1"
            >
              <span className="font-extrabold text-white">1,2k</span>
              <span className="text-gray-400 font-medium text-[11px]">Abonnés</span>
            </button>

            <button 
              onClick={() => showToast('148 abonnements')}
              className="hover:underline text-left cursor-pointer flex items-center gap-1"
            >
              <span className="font-extrabold text-white">148</span>
              <span className="text-gray-400 font-medium text-[11px]">Abonnements</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. Action Bar: Wallet Strip & Tableau de bord Button */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-1">
        
        {/* Solde Strip */}
        <div className="flex-1 w-full bg-[#161133] border border-indigo-900/50 py-2 px-3.5 rounded-xl flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-sm">💰</span>
            <span className="text-gray-400 text-[11px] font-medium">Solde :</span>
            <span className="font-extrabold text-emerald-400 font-mono text-xs sm:text-sm">14 500 F CFA</span>
          </div>

          <button
            onClick={() => alert("Retrait Mobile Money (14 500 F CFA) initié vers MTN/Moov/Orange.")}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            Retirer
          </button>
        </div>

        {/* Tableau de bord Button */}
        <button
          type="button"
          onClick={() => showToast('Tableau de bord créateur & Statistiques de lecture')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1C163D] hover:bg-[#251D52] text-indigo-200 border border-indigo-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <span>📊</span>
          <span>Tableau de bord</span>
        </button>

      </div>

      {/* 4. Sub-Tabs Navigation (Publications ▾ Dropdown vs Bibliothèque) */}
      <div className="relative flex items-center justify-center gap-3 pt-2 pb-1 z-30">
        
        {/* Publications Tab with Dropdown Filter Menu */}
        <div className="relative flex-1 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              if (activeProfileTab !== 'my_stories') {
                setActiveProfileTab('my_stories');
              }
              setIsFilterOpen(!isFilterOpen);
            }}
            className={`w-full sm:w-auto text-center px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeProfileTab === 'my_stories'
                ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-950/80 border border-rose-400/30'
                : 'bg-[#140F2D] hover:bg-[#1A143A] text-gray-300 hover:text-white border border-indigo-950/60'
            }`}
          >
            <span>{getFilterLabel()}</span>
            <span className={`text-[10px] transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Filter Dropdown Popover */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#181338]/95 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl p-1.5 z-[100] space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] text-indigo-300/70 font-bold uppercase tracking-wider px-3 py-1 border-b border-indigo-900/40">
                Filtrer par format
              </div>
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setFilterType(opt.id as any);
                    setIsFilterOpen(false);
                    showToast(`Filtre activé : ${opt.label}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    filterType === opt.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </span>
                  {filterType === opt.id && <span className="text-rose-400 font-extrabold text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bibliothèque Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveProfileTab('library');
            setIsFilterOpen(false);
          }}
          className={`flex-1 sm:flex-none text-center px-6 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeProfileTab === 'library'
              ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-950/80 border border-rose-400/30'
              : 'bg-[#140F2D] hover:bg-[#1A143A] text-gray-300 hover:text-white border border-indigo-950/60'
          }`}
        >
          Bibliothèque
        </button>

      </div>

      {/* 5. Main Tab Content (No extra section title headers!) */}
      {activeProfileTab === 'my_stories' && (
        <div className="space-y-4 pt-1">
          {filteredAuthoredStories.length === 0 ? (
            <div className="py-12 text-center bg-[#130E2E] rounded-3xl border border-indigo-900/40 p-8 space-y-3">
              <BookOpenIcon size={36} className="mx-auto text-indigo-400" />
              <p className="text-xs text-gray-300">Aucune publication dans cette catégorie.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAuthoredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onOpenStoryDetail={onOpenStoryDetail}
                  onOpenPaymentModal={onOpenPaymentModal}
                  onOpenComments={onOpenComments}
                  onOpenShare={onOpenShare}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeProfileTab === 'library' && (
        <div className="w-full">
          <LibraryView
            stories={stories}
            unlockedStoryIds={unlockedStoryIds}
            onOpenStoryDetail={onOpenStoryDetail}
            onOpenPaymentModal={onOpenPaymentModal}
            onOpenComments={onOpenComments}
            onOpenShare={onOpenShare}
            onNavigateHome={onNavigateHome}
          />
        </div>
      )}

    </div>
  );
};
