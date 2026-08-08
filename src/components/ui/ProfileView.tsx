'use client';

import React, { useState } from 'react';
import { StoryItem, StoryCard } from './StoryCard';
import { LibraryView } from './LibraryView';
import { VerifiedIcon, BookOpenIcon } from './Icons';
import { ImageCropperModal } from './ImageCropperModal';

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

  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  
  // Default coverImage state (null for animated typographic banner, string if photo uploaded)
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // History of all user-uploaded cover photos
  const [coverHistory, setCoverHistory] = useState<string[]>([
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85',
  ]);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [cropperTarget, setCropperTarget] = useState<{ src: string; type: 'avatar' | 'cover' } | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Default animated gradient themes for cover & avatar when no custom photo is chosen
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
  // Deterministic index based on author name length
  const activeTheme = defaultThemes['Ben HOUNSA'.length % defaultThemes.length];

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
    { id: 'text', label: 'Lyrique', icon: '📝' },
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

  const handleUploadNewCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCoverHistory((prev) => [url, ...prev]);
      setCoverImage(url);
      showToast('📷 Nouvelle photo de couverture ajoutée et appliquée !');
    }
  };

  const handleDeleteCoverFromHistory = (photoUrl: string) => {
    setCoverHistory((prev) => prev.filter((u) => u !== photoUrl));
    if (coverImage === photoUrl) {
      setCoverImage(null);
    }
    showToast('🗑️ Photo supprimée de l\'historique !');
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
      <div className="relative rounded-3xl overflow-hidden h-36 sm:h-48 w-full shadow-2xl border border-indigo-950/80">
        
        {/* Render Image OR Animated Typography Banner if no photo selected */}
        {coverImage ? (
          <img
            src={coverImage}
            alt="Bannière de profil"
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
                BEN HOUNSA
              </h1>
              <p className="text-[10px] sm:text-xs text-indigo-200/80 font-black tracking-widest uppercase mt-1.5 italic">
                ✨ Auteur & Créateur BenSo
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Settings Gear Icon (⚙️) - Moved to TOP-LEFT, NO CARD CONTAINER, SMALL & HIGHER UP */}
        <button
          type="button"
          onClick={() => showToast('Paramètres du compte BenSo & Mode Sombre')}
          className="absolute top-2 left-2.5 w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
          title="Paramètres du compte"
        >
          ⚙️
        </button>

        {/* Pencil Edit Cover Button (✏️) on bottom right of cover */}
        <button
          type="button"
          onClick={() => {
            if (coverImage === null) {
              setActiveSlideIndex(coverHistory.length); // Animated banner at the end
            } else {
              const foundIdx = coverHistory.indexOf(coverImage);
              setActiveSlideIndex(foundIdx >= 0 ? foundIdx : 0);
            }
            setIsCoverModalOpen(true);
          }}
          className="absolute bottom-2.5 right-3 px-3 py-1.5 rounded-2xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer z-20"
          title="Gérer les photos de couverture"
        >
          <span className="text-sm">✏️</span>
          <span className="hidden sm:inline text-[11px] font-extrabold">Modifier la couverture</span>
        </button>

      </div>

      {/* 2. Profile Info (Avatar, Name, Followers) */}
      <div className="px-2 sm:px-4 relative flex items-end gap-3.5 sm:gap-4 -mt-8 sm:-mt-10 z-10">
        
        {/* Avatar Container */}
        <div className="relative shrink-0 group">
          
          {/* Main Round Avatar Button (Clicking photo opens Full-Screen Avatar View) */}
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#0A0718] shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-slate-900 group relative"
            title="Voir ou modifier la photo de profil"
          >
            {avatarImage ? (
              <img
                src={avatarImage}
                alt="Ben HOUNSA"
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            ) : (
              /* Cool Default User Avatar Silhouette & Gradient Background */
              <div className={`w-full h-full bg-gradient-to-tr ${activeTheme.avatar} flex items-center justify-center p-2 text-white shadow-inner`}>
                <svg className="w-10 h-10 sm:w-14 sm:h-14 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </button>

          {/* Camera Icon Button on Avatar (Direct Upload Input!) */}
          <label
            className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white shadow-lg ring-2 ring-[#0A0718] transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-xs sm:text-sm cursor-pointer z-10"
            title="Importer une nouvelle photo de profil"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  setCropperTarget({ src: url, type: 'avatar' });
                }
              }}
              className="hidden"
            />
            <span>📷</span>
          </label>

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

      {/* ================================================================= */}
      {/* NATIVE FULL-SCREEN COVER PICKER (ADD ICON ON 1ST PHOTO ONLY)     */}
      {/* ================================================================= */}
      {isCoverModalOpen && (() => {
        const isAnimatedBannerSlide = activeSlideIndex === coverHistory.length;
        const totalSlides = coverHistory.length + 1;

        return (
          <div className="fixed inset-0 z-[100000] bg-[#0A0718] flex flex-col justify-between animate-fadeIn text-white select-none">
            
            {/* TOP CONTROLS BAR (Refined compact icons w-8 h-8) */}
            <div className="p-3 pt-4 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-md"
                title="Fermer"
              >
                ✕
              </button>

              {/* Slide Indicator Badge */}
              <div className="px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold tracking-wider text-indigo-200 shadow-sm">
                {isAnimatedBannerSlide
                  ? '✨ Bannière Animée'
                  : `Photo ${activeSlideIndex + 1} / ${coverHistory.length}`}
              </div>

              {/* Right Action Icons (Delete, Apply Checkmark) */}
              <div className="flex items-center gap-1.5">
                
                {/* Delete Icon Button (shown on uploaded photo slides) */}
                {!isAnimatedBannerSlide && (
                  <button
                    type="button"
                    onClick={() => {
                      const photoToDelete = coverHistory[activeSlideIndex];
                      handleDeleteCoverFromHistory(photoToDelete);
                      setActiveSlideIndex(0);
                    }}
                    className="w-8 h-8 rounded-full bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white active:scale-95 flex items-center justify-center text-xs backdrop-blur-md border border-rose-500/40 transition-all cursor-pointer shadow-md"
                    title="Supprimer cette photo"
                  >
                    🗑️
                  </button>
                )}

                {/* Apply / Set Active Cover Checkmark Icon Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isAnimatedBannerSlide) {
                      setCoverImage(null);
                    } else {
                      setCoverImage(coverHistory[activeSlideIndex]);
                    }
                    setIsCoverModalOpen(false);
                    showToast('✅ Couverture définie avec succès !');
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    (isAnimatedBannerSlide && coverImage === null) ||
                    (!isAnimatedBannerSlide && coverImage === coverHistory[activeSlideIndex])
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 border border-emerald-300'
                      : 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white border border-rose-400/40'
                  }`}
                  title="Définir comme couverture active"
                >
                  ✓
                </button>

              </div>
            </div>

            {/* MAIN FULL-SCREEN SLIDE VIEW (EDGE TO EDGE, NO CARDS!) */}
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-auto">
              
              {/* If LAST SLIDE: Animated Typography Banner */}
              {isAnimatedBannerSlide ? (
                <div className={`w-full h-full max-h-[75vh] bg-gradient-to-r ${activeTheme.cover} relative overflow-hidden flex items-center justify-center p-6 shadow-2xl`}>
                  <div className="absolute -top-20 -left-20 w-80 h-80 bg-rose-500/25 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-bounce" />
                  
                  <div className="relative z-10 text-center animate-pulse -skew-x-6 sm:-skew-x-12 transform">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 via-rose-200 to-amber-200 drop-shadow-[0_10px_35px_rgba(244,63,94,0.8)] select-none">
                      BEN HOUNSA
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-200/90 font-black tracking-widest uppercase mt-2 italic">
                      ✨ Bannière Animée Typographique
                    </p>
                  </div>
                </div>
              ) : (
                /* Uploaded Photo Banner Display */
                <div className="w-full h-full max-h-[75vh] relative flex items-center justify-center bg-black">
                  <img
                    src={coverHistory[activeSlideIndex]}
                    alt={`Couverture ${activeSlideIndex + 1}`}
                    className="w-full h-full object-contain sm:object-cover animate-fadeIn"
                  />
                </div>
              )}

              {/* Navigation Left Arrow */}
              {activeSlideIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center text-lg font-bold backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer z-30"
                >
                  ‹
                </button>
              )}

              {/* Navigation Right Arrow */}
              {activeSlideIndex < totalSlides - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center text-lg font-bold backdrop-blur-md border border-white/20 shadow-xl transition-all cursor-pointer z-30"
                >
                  ›
                </button>
              )}

            </div>

            {/* BOTTOM CONTROLS & PAGINATION BAR (EN BAS DE LA PHOTO) */}
            <div className="p-4 pt-2 flex flex-col items-center gap-3 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent pb-6">
              
              {/* Sleek Camera Add Photo Button (En bas de la photo, présent sur toutes les diapositives) */}
              <label
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-2 transition-all cursor-pointer group text-xs font-extrabold"
                title="Ajouter une photo de couverture"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      setCropperTarget({ src: url, type: 'cover' });
                    }
                  }}
                  className="hidden"
                />
                <span className="text-sm group-hover:scale-110 transition-transform">📷</span>
                <span>Ajouter une photo</span>
              </label>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'w-6 bg-rose-400 shadow-md shadow-rose-500/50'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

            </div>

          </div>
        );
      })()}

      {/* ================================================================= */}
      {/* FULL-SCREEN AVATAR VIEWER & MANAGEMENT MODAL                    */}
      {/* ================================================================= */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100000] bg-[#0A0718]/95 backdrop-blur-xl flex flex-col justify-between animate-fadeIn text-white select-none p-4">
          
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between z-30 pt-2 sm:pt-4">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-md"
              title="Fermer"
            >
              ✕
            </button>

            {/* Slide Indicator Badge */}
            <div className="px-3 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-extrabold tracking-wider text-indigo-200 shadow-sm">
              Photo de profil
            </div>

            {/* Top Right Actions (Upload & Delete) */}
            <div className="flex items-center gap-1.5">
              {/* Delete profile photo button (if custom photo exists) */}
              {avatarImage && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarImage(null);
                    showToast('🗑️ Photo de profil réinitialisée !');
                  }}
                  className="w-8 h-8 rounded-full bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white active:scale-95 flex items-center justify-center text-xs backdrop-blur-md border border-rose-500/40 transition-all cursor-pointer shadow-md"
                  title="Supprimer la photo de profil"
                >
                  🗑️
                </button>
              )}

              {/* Upload new photo button */}
              <label
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center text-xs font-bold shadow-md transition-all cursor-pointer border border-indigo-400/40"
                title="Importer une nouvelle photo"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      setCropperTarget({ src: url, type: 'avatar' });
                    }
                  }}
                  className="hidden"
                />
                <span>➕</span>
              </label>
            </div>
          </div>

          {/* Main Centered Avatar Preview (Dans le rond pour voir le rendu exact avant validation!) */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto p-4">
            <div className="relative group">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt="Ben HOUNSA Photo de profil"
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-full object-cover shadow-2xl ring-4 ring-rose-500/40 border-4 border-white/20 animate-fadeIn"
                />
              ) : (
                <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr ${activeTheme.avatar} flex flex-col items-center justify-center p-6 shadow-2xl ring-4 ring-rose-500/40 border-4 border-white/20 text-white animate-fadeIn`}>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner mb-3">
                    <svg className="w-14 h-14 sm:w-18 sm:h-18 text-white/90 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase text-indigo-100">Avatar Par Défaut</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-indigo-200/80 font-medium text-center max-w-xs">
              {avatarImage
                ? 'Aperçu dans le rond de votre photo de profil'
                : 'Aucune photo personnalisée définie. Vous utilisez l\'avatar par défaut.'}
            </p>
          </div>

          {/* Bottom Action Bar (ICON-ONLY CONTROLS, NO TEXT WORDS!) */}
          <div className="flex items-center justify-center gap-3 pb-6">
            {/* Upload / Pick New Photo Icon Button */}
            <label
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center text-base font-bold shadow-xl transition-all cursor-pointer border border-indigo-400/40"
              title="Importer une photo"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setCropperTarget({ src: url, type: 'avatar' });
                  }
                }}
                className="hidden"
              />
              <span>📷</span>
            </label>

            {/* Apply / Confirm Checkmark Icon Button */}
            <button
              type="button"
              onClick={() => {
                setIsAvatarModalOpen(false);
                showToast('✅ Photo de profil validée !');
              }}
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center text-base font-bold shadow-xl transition-all border border-emerald-300 cursor-pointer"
              title="Valider"
            >
              ✓
            </button>

            {/* Delete / Reset Icon Button */}
            {avatarImage && (
              <button
                type="button"
                onClick={() => {
                  setAvatarImage(null);
                  showToast('🗑️ Photo de profil réinitialisée !');
                }}
                className="w-10 h-10 rounded-full bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white active:scale-95 flex items-center justify-center text-base font-bold shadow-xl transition-all border border-rose-500/40 cursor-pointer"
                title="Supprimer la photo de profil"
              >
                🗑️
              </button>
            )}
          </div>

        </div>
      )}

      {/* ================================================================= */}
      {/* INTERACTIVE IMAGE CROPPER MODAL                                  */}
      {/* ================================================================= */}
      {cropperTarget && (
        <ImageCropperModal
          imageSrc={cropperTarget.src}
          cropShape={cropperTarget.type === 'avatar' ? 'circle' : 'rect'}
          title={cropperTarget.type === 'avatar' ? 'Recadrer la photo de profil' : 'Recadrer la couverture'}
          onCropComplete={(croppedUrl) => {
            if (cropperTarget.type === 'avatar') {
              setAvatarImage(croppedUrl);
              setIsAvatarModalOpen(true);
              showToast('📸 Aperçu dans le rond ! Cliquez sur ✓ pour valider');
            } else {
              setCoverHistory((prev) => [croppedUrl, ...prev]);
              setCoverImage(croppedUrl);
              setActiveSlideIndex(0);
              setIsCoverModalOpen(true);
              showToast('📷 Aperçu de la couverture ! Cliquez sur ✓ pour valider');
            }
            setCropperTarget(null);
          }}
          onClose={() => setCropperTarget(null)}
        />
      )}

    </div>
  );
};
