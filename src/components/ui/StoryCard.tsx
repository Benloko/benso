'use client';

import React, { useState } from 'react';
import { 
  HeartIcon, 
  CommentIcon, 
  ShareIcon, 
  BookmarkIcon, 
  VerifiedIcon, 
  PlayIcon, 
  LockIcon, 
  UnlockIcon,
  StarIcon 
} from './Icons';
import { Badge } from './Badge';

export interface StoryItem {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    handle: string;
  };
  coverImage: string;
  coverEffect?: string;
  category: string;
  isPremium: boolean;
  priceFCFA?: number;
  rating?: number;
  reviewsCount?: number;
  excerpt: string;
  fullContent?: string;
  pdfUrl?: string;
  mediaUrl?: string;
  contentFiles?: Array<{ id: string; previewUrl?: string; name: string; size?: number }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  publishedAt: string;
  hasFreePreview?: boolean;
}

interface StoryCardProps {
  story: StoryItem;
  onOpenStoryDetail: (story: StoryItem) => void;
  onOpenPaymentModal: (story: StoryItem) => void;
  onOpenComments?: (story: StoryItem) => void;
  onOpenShare?: (story: StoryItem) => void;
  onStoryUpdated?: (updatedStory: StoryItem) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onOpenStoryDetail,
  onOpenPaymentModal,
  onOpenComments,
  onOpenShare,
  onStoryUpdated,
}) => {
  const [liked, setLiked] = useState(story.isLiked || false);
  const [likes, setLikes] = useState(story.likesCount);
  const [bookmarked, setBookmarked] = useState(story.isBookmarked || false);

  // Fallback image handling to prevent broken alt text floating over blank cards
  const [imgSrc, setImgSrc] = useState<string>(
    story.coverImage || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
  );
  const [hasImgError, setHasImgError] = useState<boolean>(false);

  const handleImgError = () => {
    if (!hasImgError) {
      setHasImgError(true);
      setImgSrc('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);
    setLiked(newLiked);
    setLikes(newLikes);

    try {
      const res = await fetch(`/api/stories/${story.id}/like`, { method: 'POST' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.story && onStoryUpdated) {
        onStoryUpdated(json.story);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);

    try {
      const res = await fetch(`/api/stories/${story.id}/bookmark`, { method: 'POST' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.story && onStoryUpdated) {
        onStoryUpdated(json.story);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  return (
    <article 
      onClick={() => onOpenStoryDetail(story)}
      className="bg-[#130F26] hover:bg-[#171330] transition-all duration-300 rounded-3xl p-4 sm:p-5 border border-indigo-900/40 hover:border-indigo-500/45 shadow-xl shadow-black/50 flex flex-col gap-4 cursor-pointer group relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all" />

      {/* Author Header (Name + PublishedAt - Padlock status top right) */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={story.author.avatar}
              alt={story.author.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            {story.author.isVerified && (
              <span className="absolute -bottom-1 -right-1">
                <VerifiedIcon size={15} />
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">
              {story.author.name}
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">
              {story.publishedAt}
            </p>
          </div>
        </div>

        {/* Top Right: Photorealistic 3D Metallic Vector Padlocks (Red Closed for Paid, Green Open for Free) */}
        <div className="flex items-center justify-center hover:scale-110 transition-transform duration-200">
          {story.isPremium ? (
            <div title="Œuvre Payante (Cadenas Fermé)">
              <LockIcon size={25} className="drop-shadow-[0_4px_12px_rgba(244,63,94,0.6)]" />
            </div>
          ) : (
            <div title="Œuvre Gratuite (Cadenas Ouvert)">
              <UnlockIcon size={25} className="drop-shadow-[0_4px_12px_rgba(52,211,153,0.6)]" />
            </div>
          )}
        </div>
      </div>

      {/* Cover Image & Media Section - High Visual Impact Artwork */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[2/1] bg-[#161133] z-10 shadow-md isolate transform-gpu shrink-0">
        <img
          src={imgSrc}
          alt=""
          onError={handleImgError}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            story.coverEffect && story.coverEffect !== 'none' ? `anim-${story.coverEffect}` : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#130F26]/95 via-transparent to-black/20" />
        
        {/* Category Badge on Top Left */}
        <div className="absolute top-3 left-3">
          <Badge variant="genre">{story.category}</Badge>
        </div>

        {/* Rating Badge on Top Right */}
        {story.rating && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-semibold text-amber-300 flex items-center gap-1 border border-white/10">
            <StarIcon size={13} filled />
            <span>{story.rating}</span>
            {story.reviewsCount && (
              <span className="text-gray-400 font-normal text-[10px]">({story.reviewsCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Title & Description with Refined Typography */}
      <div className="z-10 flex flex-col gap-1.5 shrink-0">
        <h3 className="text-base sm:text-lg font-black text-gray-100 group-hover:text-indigo-300 transition-colors leading-snug tracking-tight">
          {story.title}
        </h3>
        <p className="text-xs sm:text-sm text-indigo-100/75 line-clamp-2 leading-relaxed font-normal">
          {story.excerpt}
        </p>
      </div>

      {/* Social Interactions Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-indigo-950/80 text-gray-400 text-xs z-10">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-white/5 ${
            liked ? 'text-rose-400 font-bold' : 'hover:text-rose-300'
          }`}
        >
          <HeartIcon size={17} filled={liked} />
          <span>{likes}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenComments) onOpenComments(story);
            else onOpenStoryDetail(story);
          }}
          className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-white/5"
        >
          <CommentIcon size={17} />
          <span>{story.commentsCount}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenShare) onOpenShare(story);
          }}
          className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-white/5"
        >
          <ShareIcon size={17} />
          <span>{story.sharesCount}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-white/5 ${
            bookmarked ? 'text-indigo-400' : 'hover:text-gray-200'
          }`}
          aria-label="Sauvegarder"
        >
          <BookmarkIcon size={17} filled={bookmarked} />
        </button>
      </div>
    </article>
  );
};
