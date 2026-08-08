'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftIcon, 
  LockIcon, 
  VerifiedIcon, 
  HeartIcon, 
  ShareIcon,
  BookmarkIcon 
} from './Icons';
import { Badge } from './Badge';
import { StoryItem } from './StoryCard';

interface StoryDetailModalProps {
  story: StoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentModal: (story: StoryItem) => void;
  onOpenShare?: (story: StoryItem) => void;
  onOpenComments?: (story: StoryItem) => void;
  isUnlocked?: boolean;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  isOpen,
  onClose,
  onOpenPaymentModal,
  onOpenShare,
  onOpenComments,
  isUnlocked = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Reader state
  const [isReadingView, setIsReadingView] = useState<boolean>(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
    if (story) {
      setLikeCount(story.likesCount);
      setIsLiked(story.isLiked || false);
      setIsBookmarked(story.isBookmarked || false);
      setIsReadingView(false);
      setActivePageIndex(0);
    }
  }, [isOpen, story]);

  if (!isOpen || !story) return null;

  const handleLikeToggle = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/stories/${story.id}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Error toggling like in detail modal:', err);
    }
  };

  const handleBookmarkToggle = async () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    try {
      await fetch(`/api/stories/${story.id}/bookmark`, { method: 'POST' });
    } catch (err) {
      console.error('Error toggling bookmark in detail modal:', err);
    }
  };

  // Build images / planches cards list
  const storyPages = (story.contentFiles && story.contentFiles.length > 0)
    ? story.contentFiles
    : [
        { id: 'page-1', previewUrl: story.coverImage, name: 'Plan 1' },
        { id: 'page-2', previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80', name: 'Plan 2' },
        { id: 'page-3', previewUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80', name: 'Plan 3' },
        { id: 'page-4', previewUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=80', name: 'Plan 4' },
      ];

  const totalPages = storyPages.length;
  // If story is paid & locked, max free visible pages is 2. The 3rd index (2) is the Paywall Card.
  const isPaidAndLocked = story.isPremium && !isUnlocked;
  const maxAccessibleIndex = isPaidAndLocked ? 2 : totalPages - 1;

  const isCurrentPageLocked = isPaidAndLocked && activePageIndex >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md animate-fadeIn p-2 sm:p-4 overflow-hidden">
      <div 
        ref={modalScrollRef}
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#110D21] sm:rounded-3xl border border-indigo-500/35 shadow-[0_0_60px_rgba(99,102,241,0.25)] flex flex-col overflow-y-auto text-white relative scrollbar-none"
      >
        
        {/* ================================================================= */}
        {/* VIEW 1: IMMERSIVE READER VIEW (WHEN OPENED TO READ)              */}
        {/* ================================================================= */}
        {isReadingView ? (
          <div className="flex flex-col h-full min-h-[500px] bg-black text-white relative">
            
            {/* Sleek Header Bar */}
            <div className="p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between z-30 shrink-0">
              <button
                type="button"
                onClick={() => setIsReadingView(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowLeftIcon size={14} />
                <span>Retour aux détails</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
                  {isCurrentPageLocked ? '🔒 Suite réservée' : `Page ${activePageIndex + 1} / ${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Central Reader Card Display Area */}
            <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 bg-[#0B0818] overflow-hidden">
              
              {/* IF PAGE IS LOCKED (PAID & LOCKED & INDEX >= 2) */}
              {isCurrentPageLocked ? (
                <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#16112E] border border-rose-500/40 text-center space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-3xl mx-auto shadow-inner">
                    🔒
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Découvrez la suite de l'œuvre</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Vous avez parcouru les 2 premières pages gratuites. Pour accéder à la suite et soutenir l'auteur, débloquez l'accès complet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenPaymentModal(story)}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LockIcon size={16} />
                    <span>Débloquer pour {story.priceFCFA || 500} F CFA</span>
                  </button>
                </div>
              ) : (
                /* NORMAL IMAGE PAGE DISPLAY */
                <div className="relative w-full h-full max-h-[600px] flex items-center justify-center">
                  <img
                    src={storyPages[activePageIndex]?.previewUrl || story.coverImage}
                    alt={`Page ${activePageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
                  />
                </div>
              )}

              {/* FLOATING SUBTLE TRANSLUCENT SIDE NAV ICONS (NO BULKY BUTTONS!) */}
              <button
                type="button"
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center text-lg font-black transition-all z-20 ${
                  activePageIndex === 0
                    ? 'bg-black/20 text-gray-600 border-white/5 cursor-not-allowed opacity-30'
                    : 'bg-black/60 hover:bg-rose-600 text-white border-white/20 hover:scale-110 active:scale-95 cursor-pointer shadow-lg'
                }`}
                title="Page précédente"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => setActivePageIndex((prev) => Math.min(maxAccessibleIndex, prev + 1))}
                disabled={activePageIndex >= maxAccessibleIndex}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center text-lg font-black transition-all z-20 ${
                  activePageIndex >= maxAccessibleIndex
                    ? 'bg-black/20 text-gray-600 border-white/5 cursor-not-allowed opacity-30'
                    : 'bg-black/60 hover:bg-indigo-600 text-white border-white/20 hover:scale-110 active:scale-95 cursor-pointer shadow-lg'
                }`}
                title="Page suivante"
              >
                ›
              </button>

            </div>

          </div>
        ) : (

          /* ================================================================= */
          /* VIEW 2: DETAILS VIEW WITH INITIAL COVER CARD & TAP STICKER       */
          /* ================================================================= */
          <>
            {/* TOP HEADER BAR */}
            <div className="relative w-full p-4 sm:p-5 bg-gradient-to-b from-[#181335] to-[#110D21] border-b border-indigo-950/80 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 text-xs font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ArrowLeftIcon size={16} />
                  <span>Fermer</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLikeToggle}
                    className="flex items-center gap-1.5 bg-[#1C163C] px-3 py-1.5 rounded-full border border-indigo-900/60 text-xs text-rose-400 font-extrabold hover:scale-105 transition-transform cursor-pointer"
                  >
                    <HeartIcon size={15} filled={isLiked} />
                    <span>{likeCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBookmarkToggle}
                    className={`p-2 rounded-full border text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isBookmarked 
                        ? 'bg-rose-500 text-white border-rose-400' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                    title="Sauvegarder l'œuvre"
                  >
                    <BookmarkIcon size={16} filled={isBookmarked} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenShare) onOpenShare(story);
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all shadow-md cursor-pointer"
                    title="Partager"
                  >
                    <ShareIcon size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="genre">{story.category}</Badge>
                  {story.isPremium ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold flex items-center gap-1">
                      <LockIcon size={12} /> {story.priceFCFA || 500} F CFA
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold">
                      🟢 Gratuit
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                  {story.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-400"
                  />
                  <span>Par <strong className="text-white">{story.author.name}</strong></span>
                  {story.author.isVerified && <VerifiedIcon size={14} />}
                </div>
              </div>
            </div>

            {/* MAIN BODY CONTENT AREA */}
            <div className="p-4 sm:p-6 space-y-5">
              
              {/* FIRST INITIAL COVER CARD */}
              <div 
                onClick={() => setIsReadingView(true)}
                className="relative w-full aspect-[16/10] sm:aspect-[2/1] rounded-3xl overflow-hidden bg-black/80 border-2 border-indigo-500/40 shadow-2xl cursor-pointer group hover:border-rose-500/60 transition-all hover:scale-[1.01]"
              >
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                    story.coverEffect && story.coverEffect !== 'none' ? `anim-${story.coverEffect}` : ''
                  }`}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Cover Effect Tag Overlay */}
                {story.coverEffect && story.coverEffect !== 'none' && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black text-rose-300 border border-white/20 shadow-md">
                    ⚡ Effet {story.coverEffect}
                  </div>
                )}

                {/* SMALL COMPACT ELEGANT PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReadingView(true);
                  }}
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/80 hover:bg-rose-600 backdrop-blur-md text-white border border-white/20 hover:border-rose-400 text-[11px] font-bold flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                >
                  <span className="text-xs animate-bounce">👆</span>
                  <span>Cliquer pour voir l'aperçu</span>
                </button>
              </div>

              {/* ELEGANT DESCRIPTION / SYNOPSIS BELOW CARDS */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  📜 Description de l'œuvre
                </h3>
                <div className="bg-[#15102A] p-4 sm:p-5 rounded-2xl border border-indigo-900/50 shadow-lg">
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    {story.fullContent || story.excerpt}
                  </p>
                </div>
              </div>

              {/* PDF ATTACHMENT ACTION BUTTON IF PDF URL PRESENT */}
              {story.pdfUrl && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">Document PDF Manuscrit</h4>
                      <p className="text-[11px] text-indigo-300">Prêt pour la lecture complète</p>
                    </div>
                  </div>
                  <a
                    href={story.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    Consulter le PDF
                  </a>
                </div>
              )}

            </div>

            {/* COMPACT, PROFESSIONAL & ULTRA-SLEEK BOTTOM CTA BUTTON */}
            <div className="sticky bottom-0 bg-[#110D21]/95 backdrop-blur-xl border-t border-indigo-950 p-3.5 flex justify-center z-30">
              {story.isPremium && !isUnlocked ? (
                <button
                  type="button"
                  onClick={() => onOpenPaymentModal(story)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
                >
                  <LockIcon size={15} />
                  <span>Débloquer ({story.priceFCFA || 500} F CFA)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReadingView(true)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🟢 Ouvrir l'histoire</span>
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
