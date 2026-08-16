'use client';

import React, { useState, useEffect } from 'react';
import { StoryItem } from './StoryCard';
import { VerifiedIcon, HeartIcon } from './Icons';

export interface CommentItem {
  id: string;
  storyId: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: CommentItem[];
}

interface CommentsModalProps {
  story: StoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (updatedStory: StoryItem) => void;
  onOpenUserProfile?: (user: { name: string; avatar: string; handle?: string; isVerified?: boolean; isCreator?: boolean; role?: string }) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  story,
  isOpen,
  onClose,
  onCommentAdded,
  onOpenUserProfile,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && story) {
      fetchComments();
    }
  }, [isOpen, story]);

  const fetchComments = async (isBackground = false) => {
    if (!story) return;
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/comments`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setComments(json.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  if (!isOpen || !story) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = newCommentText.trim();
    if (!textToSend) return;

    // Create Optimistic Comment object
    const optimisticComment: CommentItem = {
      id: `temp-${Date.now()}`,
      storyId: story.id,
      author: {
        name: 'Vous (Lecteur BenSo)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
      },
      text: textToSend,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      parentId: replyingTo ? replyingTo.id : null,
      replies: [],
    };

    // Instant local UI update
    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingTo.id) {
            return {
              ...c,
              replies: [...(c.replies || []), optimisticComment],
            };
          }
          return c;
        })
      );
    } else {
      setComments((prev) => [optimisticComment, ...prev]);
    }

    const currentReplyTarget = replyingTo;
    setNewCommentText('');
    setReplyingTo(null);

    if (onCommentAdded) {
      onCommentAdded({
        ...story,
        commentsCount: story.commentsCount + 1,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          parentId: currentReplyTarget ? currentReplyTarget.id : null,
          authorName: 'Vous (Lecteur BenSo)',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        }),
      });

      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.comment) {
        fetchComments(true);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
          };
        }
        if (c.replies) {
          const updatedReplies = c.replies.map((r) => {
            if (r.id === commentId) {
              const isLiked = !r.isLiked;
              return {
                ...r,
                isLiked,
                likesCount: isLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
              };
            }
            return r;
          });
          return { ...c, replies: updatedReplies };
        }
        return c;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#0F0C20]/95 border border-white/10 w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-[0_0_60px_rgba(99,102,241,0.25)] relative overflow-hidden text-white h-[85vh] max-h-[720px] flex flex-col">
        
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#130E2B] rounded-[14px] flex items-center justify-center text-lg">
                💬
              </div>
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight tracking-tight">
                Espace Commentaires ({comments.length || story.commentsCount})
              </h3>
              <p className="text-xs text-indigo-300 truncate max-w-[240px] sm:max-w-[300px]">
                "{story.title}"
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Comments Feed Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-indigo-300 text-xs font-bold">Chargement des commentaires...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-center space-y-3 p-4 bg-white/[0.02] rounded-3xl border border-white/5">
              <span className="text-4xl">✨</span>
              <div>
                <p className="text-sm font-black text-white">Soyez le premier à commenter cette œuvre !</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Partagez vos réactions et soutenez l'auteur dans sa création.</p>
              </div>
            </div>
          ) : (
            comments.map((comm) => (
              <div key={comm.id} className="space-y-2.5 animate-fadeIn">
                {/* Main Comment Bubble */}
                <div className="flex gap-3 items-start group">
                  <img
                    src={comm.author.avatar}
                    alt={comm.author.name}
                    onClick={() => {
                      onClose();
                      onOpenUserProfile?.({
                        name: comm.author.name,
                        avatar: comm.author.avatar,
                        isVerified: comm.author.isVerified,
                        isCreator: comm.author.isVerified !== false,
                        role: comm.author.isVerified !== false ? 'Auteur & Créateur' : 'Membre Lecteur',
                      });
                    }}
                    className="w-9 h-9 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0 mt-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform"
                    title={`Voir le profil de ${comm.author.name}`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="bg-white/[0.04] hover:bg-white/[0.06] transition-colors p-3.5 rounded-2xl border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <div 
                          onClick={() => {
                            onClose();
                            onOpenUserProfile?.({
                              name: comm.author.name,
                              avatar: comm.author.avatar,
                              isVerified: comm.author.isVerified,
                              isCreator: comm.author.isVerified !== false,
                              role: comm.author.isVerified !== false ? 'Auteur & Créateur' : 'Membre Lecteur',
                            });
                          }}
                          className="flex items-center gap-1.5 cursor-pointer hover:underline"
                        >
                          <span className="font-black text-xs text-white">{comm.author.name}</span>
                          {comm.author.isVerified && <VerifiedIcon size={14} />}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed font-normal">{comm.text}</p>
                    </div>

                    {/* Action Bar under main comment */}
                    <div className="flex items-center gap-4 px-2 text-[11px] font-bold text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleLikeComment(comm.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          comm.isLiked ? 'text-rose-400 font-black' : 'hover:text-rose-300'
                        }`}
                      >
                        <HeartIcon size={14} filled={comm.isLiked} />
                        <span>{comm.likesCount > 0 ? comm.likesCount : 'J\'aime'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(comm)}
                        className="hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>↩️ Répondre</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Threaded Nested Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="pl-8 sm:pl-10 space-y-2.5 border-l-2 border-indigo-500/30 ml-4.5">
                    {comm.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2.5 items-start">
                        <img
                          src={reply.author.avatar}
                          alt={reply.author.name}
                          onClick={() => {
                            onClose();
                            onOpenUserProfile?.({
                              name: reply.author.name,
                              avatar: reply.author.avatar,
                              isVerified: reply.author.isVerified,
                              isCreator: reply.author.isVerified !== false,
                              role: reply.author.isVerified !== false ? 'Auteur & Créateur' : 'Membre Lecteur',
                            });
                          }}
                          className="w-7 h-7 rounded-xl object-cover ring-1 ring-indigo-500/30 shrink-0 mt-0.5 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                          title={`Voir le profil de ${reply.author.name}`}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="bg-white/[0.05] p-3 rounded-2xl border border-white/10 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <div 
                                onClick={() => {
                                  onClose();
                                  onOpenUserProfile?.({
                                    name: reply.author.name,
                                    avatar: reply.author.avatar,
                                    isVerified: reply.author.isVerified,
                                    isCreator: reply.author.isVerified !== false,
                                    role: reply.author.isVerified !== false ? 'Auteur & Créateur' : 'Membre Lecteur',
                                  });
                                }}
                                className="flex items-center gap-1 cursor-pointer hover:underline"
                              >
                                <span className="font-black text-[11px] text-indigo-200">{reply.author.name}</span>
                                {reply.author.isVerified && <VerifiedIcon size={12} />}
                              </div>
                              <span className="text-[9px] text-gray-400">
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-200 leading-normal font-normal">{reply.text}</p>
                          </div>

                          <div className="flex items-center gap-3 px-2 text-[10px] font-bold text-gray-400">
                            <button
                              type="button"
                              onClick={() => handleLikeComment(reply.id)}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                reply.isLiked ? 'text-rose-400 font-black' : 'hover:text-rose-300'
                              }`}
                            >
                              <HeartIcon size={12} filled={reply.isLiked} />
                              <span>{reply.likesCount > 0 ? reply.likesCount : 'J\'aime'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Replying Banner Indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-indigo-950/80 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200 shrink-0">
            <span className="font-medium flex items-center gap-1.5">
              <span>↩️ Réponse à</span>
              <strong className="text-white font-bold">{replyingTo.author.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-white font-bold text-xs px-2 py-0.5 rounded-lg hover:bg-white/10"
            >
              Annuler ✕
            </button>
          </div>
        )}

        {/* Bottom Comment Input Form */}
        <form onSubmit={handleSendComment} className="p-3.5 bg-white/[0.02] border-t border-white/10 flex items-center gap-2.5 shrink-0">
          <input
            type="text"
            required
            placeholder={replyingTo ? `Répondre à ${replyingTo.author.name}...` : "Exprimez-vous sur cette œuvre..."}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-white/[0.05] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl border border-white/10 focus:border-rose-500/80 focus:bg-white/[0.08] focus:outline-none placeholder:text-gray-500 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !newCommentText.trim()}
            className={`px-5 py-3 rounded-2xl font-black text-xs transition-all duration-300 shadow-lg flex items-center gap-1.5 shrink-0 ${
              newCommentText.trim() && !submitting
                ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-rose-500/25 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            <span>{submitting ? '...' : 'Envoyer'}</span>
            <span>➔</span>
          </button>
        </form>

      </div>
    </div>
  );
};
