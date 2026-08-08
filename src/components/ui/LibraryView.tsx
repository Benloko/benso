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
  // Default to 'unlocked' tab (no 'all' tab!)
  const [activeFilterTab, setActiveFilterTab] = useState<'unlocked' | 'bookmarked'>('unlocked');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered stories in library
  const libraryStories = stories.filter((story) => {
    if (unlockedStoryIds.includes(story.id) || story.isBookmarked || story.isPremium === false) {
      return true;
    }
    return true;
  });

  const unlockedCount = stories.filter((s) => unlockedStoryIds.includes(s.id) || s.isPremium).length;
  const bookmarkedCount = stories.filter((s) => s.isBookmarked).length;

  // Filtered list based on active tab ('unlocked' vs 'bookmarked') and search query
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

  return (
    <main className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 pb-28 pt-2">
      
      {/* Sleek Search & Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#130F28] p-3 sm:p-4 rounded-3xl border border-indigo-950/80 shadow-xl">
        
        {/* 2 Filter Tabs: Débloquées vs Mes Favoris */}
        <div className="flex items-center gap-2">
          {[
            { id: 'unlocked', label: `Débloquées 🔓 (${unlockedCount})` },
            { id: 'bookmarked', label: `Mes Favoris ⭐ (${bookmarkedCount})` },
          ].map((tab) => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-950/80 border border-rose-400/30'
                    : 'bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Enhanced Glassmorphism Search Bar */}
        <div className="relative sm:w-64">
          <input
            type="text"
            placeholder="Rechercher par titre ou auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181335]/90 text-xs text-white placeholder:text-indigo-300/50 pl-9 pr-8 py-2.5 rounded-2xl border border-indigo-900/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none transition-all shadow-inner"
          />
          <SearchIcon size={15} className="absolute left-3 top-3 text-rose-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[10px] text-gray-300 hover:text-white bg-white/10 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Full-Width Story Cards Feed */}
      {filteredStories.length === 0 ? (
        <div className="py-12 text-center bg-[#130E2E] rounded-3xl border border-indigo-900/40 p-8 space-y-3">
          <BookOpenIcon size={36} className="mx-auto text-indigo-400" />
          <h3 className="text-base font-bold text-white">Aucune histoire dans cette catégorie</h3>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat correspondant à "${searchQuery}".`
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
