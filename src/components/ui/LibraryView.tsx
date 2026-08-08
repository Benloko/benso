'use client';

import React, { useState } from 'react';
import { StoryCard, StoryItem } from './StoryCard';
import { SearchIcon, BookOpenIcon } from './Icons';
import { Button } from './Button';

interface LibraryViewProps {
  stories: StoryItem[];
  unlockedStoryIds: string[];
  onOpenStoryDetail: (story: StoryItem) => void;
  onOpenPaymentModal: (story: StoryItem) => void;
  onOpenComments?: (story: StoryItem) => void;
  onOpenShare?: (story: StoryItem) => void;
  onNavigateHome: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  unlockedStoryIds,
  onOpenStoryDetail,
  onOpenPaymentModal,
  onOpenComments,
  onOpenShare,
  onNavigateHome,
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unlocked' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Combined stories in library (either in unlockedStoryIds or saved as bookmarked)
  const libraryStories = stories.filter((story) => {
    if (unlockedStoryIds.includes(story.id) || story.isBookmarked || story.isPremium === false) {
      return true;
    }
    return true; // Default show available catalog in user's bookshelf
  });

  // Filtered list based on active tab and search query
  const filteredStories = libraryStories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilterTab === 'unlocked') {
      return unlockedStoryIds.includes(story.id) || story.isPremium;
    }
    if (activeFilterTab === 'bookmarked') {
      return !!story.isBookmarked;
    }

    return true;
  });

  const unlockedCount = stories.filter((s) => unlockedStoryIds.includes(s.id) || s.isPremium).length;

  return (
    <main className="p-3 sm:p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4 md:space-y-6 pb-28">
      
      {/* Sleek Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Ma Bibliothèque</h2>
            <span className="bg-indigo-600/30 text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {unlockedCount} débloquée(s)
            </span>
          </div>
          <p className="text-xs text-indigo-300/70 mt-0.5 font-medium">
            Vos histoires enregistrées et débloquées sur BenSo
          </p>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#130F28] p-3 rounded-2xl border border-indigo-950/80">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: `Toutes (${libraryStories.length})` },
            { id: 'unlocked', label: `Débloquées 🔓 (${unlockedCount})` },
            { id: 'bookmarked', label: `Mes Favoris ⭐` },
          ].map((tab) => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md border border-rose-400/30'
                    : 'bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative sm:w-56">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181335] text-xs text-white placeholder:text-indigo-300/40 pl-8 pr-7 py-2 rounded-xl border border-indigo-900/50 focus:border-indigo-500 focus:outline-none transition-all"
          />
          <SearchIcon size={14} className="absolute left-2.5 top-2.5 text-indigo-400/60" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-xs text-gray-400 hover:text-white bg-white/10 w-4 h-4 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stories Feed using standard StoryCard component */}
      {filteredStories.length === 0 ? (
        <div className="py-12 text-center bg-[#151226] rounded-3xl border border-indigo-900/30 p-8 space-y-3">
          <BookOpenIcon size={36} className="mx-auto text-indigo-400" />
          <h3 className="text-base font-bold text-white">Aucune histoire trouvée dans votre bibliothèque</h3>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat pour "${searchQuery}".`
              : 'Sauvegardez vos histoires préférées ou débloquez-en de nouvelles.'}
          </p>
          <Button variant="coral" size="sm" onClick={onNavigateHome}>
            Explorer le catalogue
          </Button>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredStories.map((story) => (
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

    </main>
  );
};
