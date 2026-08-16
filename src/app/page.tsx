'use client';

import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Navbar } from '@/components/ui/Navbar';
import { StoryCard, StoryItem } from '@/components/ui/StoryCard';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { StoryDetailModal } from '@/components/ui/StoryDetailModal';
import { CreateStoryModal } from '@/components/ui/CreateStoryModal';
import { CommentsModal } from '@/components/ui/CommentsModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { MessagesView } from '@/components/ui/MessagesView';
import { LibraryView } from '@/components/ui/LibraryView';
import { ProfileView } from '@/components/ui/ProfileView';
import { NotificationsModal } from '@/components/ui/NotificationsModal';
import { UserProfileModal, UserProfileData } from '@/components/ui/UserProfileModal';
import { SparklesIcon, VerifiedIcon, StarIcon, LockIcon, BookOpenIcon, HeartIcon } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Initial dataset matching BenSo reference specifications
const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: "L'Ombre du Baobab",
    author: {
      name: 'Amina Kouyaté',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      handle: '@amina.k',
    },
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=85',
    category: 'Conte & Légende',
    isPremium: true,
    priceFCFA: 500,
    rating: 4.9,
    reviewsCount: 342,
    excerpt: "Sous les étoiles du Mali, une jeune femme mystérieuse détient les secrets d'un arbre millénaire. Une quête de mémoire et de vérité commence dans un royaume oublié...",
    likesCount: 4120,
    commentsCount: 892,
    sharesCount: 2100,
    publishedAt: 'Il y a 2h',
  },
  {
    id: 'story-2',
    title: 'Les Secrets de Kétou',
    author: {
      name: 'Amara Diop',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      handle: '@amara_diop',
    },
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85',
    category: 'Fantastique & Romance',
    isPremium: true,
    priceFCFA: 1000,
    rating: 4.8,
    reviewsCount: 1240,
    excerpt: "Quand la tradition rencontre le destin moderne, les esprits de la forêt murmurent un amour interdit capable de soulever des royaumes.",
    likesCount: 8900,
    commentsCount: 1540,
    sharesCount: 3200,
    publishedAt: 'Hier à 18h',
  },
  {
    id: 'story-3',
    title: 'Les Amazones du Dahomey',
    author: {
      name: 'Ben HOUNSA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      handle: '@benhounsa',
    },
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
    category: 'Histoire & Héritage',
    isPremium: false,
    rating: 5.0,
    reviewsCount: 86,
    excerpt: "Plongez au cœur du XIXe siècle dans le royaume du Danxomé. Découvrez le courage sans égal des Agoodjiés, guerrières intrépides devenues légende.",
    likesCount: 1250,
    commentsCount: 340,
    sharesCount: 520,
    publishedAt: 'Il y a 3 jours',
  },
];

export default function Home() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [discoverSubTab, setDiscoverSubTab] = useState<string>('formats');
  
  // Modals state
  const [selectedStoryForDetail, setSelectedStoryForDetail] = useState<StoryItem | null>(null);
  const [selectedStoryForPayment, setSelectedStoryForPayment] = useState<StoryItem | null>(null);
  const [selectedStoryForComments, setSelectedStoryForComments] = useState<StoryItem | null>(null);
  const [selectedStoryForShare, setSelectedStoryForShare] = useState<StoryItem | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const [activeChatTargetUser, setActiveChatTargetUser] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(false);
  const [unlockedStoryIds, setUnlockedStoryIds] = useState<string[]>([]);

  const handleOpenUserProfile = (user: { name: string; avatar: string; handle?: string; isVerified?: boolean; isCreator?: boolean; role?: string }) => {
    setSelectedUserProfile({
      name: user.name,
      avatar: user.avatar,
      handle: user.handle,
      isVerified: user.isVerified,
      isCreator: user.isCreator,
      role: user.role,
    });
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.append('filter', activeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery);

      const res = await fetch(`/api/stories?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.stories) {
        setStories(json.stories);
      }
    } catch (err) {
      console.error('Error fetching stories from backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStories();
  }, [activeFilter, searchQuery]);

  const handlePaymentSuccess = (storyId: string) => {
    if (!unlockedStoryIds.includes(storyId)) {
      setUnlockedStoryIds([...unlockedStoryIds, storyId]);
    }
  };

  const handleCreateStory = (newStory: StoryItem) => {
    fetchStories();
  };

  return (
    <div className={`min-h-screen bg-[#0B0914] text-gray-100 flex flex-col md:flex-row ${activeTab === 'messages' ? 'pb-16 md:pb-0' : 'pb-28 md:pb-8'}`}>
      {/* Navigation (Sidebar desktop + Bottom bar mobile) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileChatOpen(false);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        isMobileChatOpen={isMobileChatOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 md:ml-64 min-w-0 flex flex-col ${activeTab === 'messages' ? 'relative z-[100]' : ''}`}>
        
        {/* Sticky Header - Rendered on Home and Discover tabs */}
        {(activeTab === 'home' || activeTab === 'discover') && (
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            activeTab={activeTab}
            discoverSubTab={discoverSubTab}
            onDiscoverSubTabChange={setDiscoverSubTab}
            onProfileClick={() => setActiveTab('profile')}
            onNotificationClick={() => setIsNotificationsModalOpen(true)}
          />
        )}

        {/* Tab 1: Home Feed */}
        {activeTab === 'home' && (
          <main className="p-3 sm:p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4 md:space-y-6">
            {/* Stories Cards Feed List - Direct access after filters */}
            <div className="space-y-4 md:space-y-6">
              {loading && stories.length === 0 ? (
                <div className="py-12 text-center text-indigo-300 text-sm font-bold animate-pulse">
                  ⚡ Chargement des histoires depuis le Backend BenSo...
                </div>
              ) : (
                stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onOpenStoryDetail={(story) => setSelectedStoryForDetail(story)}
                    onOpenPaymentModal={(story) => setSelectedStoryForPayment(story)}
                    onOpenComments={(story) => setSelectedStoryForComments(story)}
                    onOpenShare={(story) => setSelectedStoryForShare(story)}
                    onOpenUserProfile={handleOpenUserProfile}
                    onStoryUpdated={() => fetchStories()}
                  />
                ))
              )}

              {!loading && stories.length === 0 && (
                <div className="py-12 text-center bg-[#151226] rounded-3xl border border-indigo-900/30 p-8 space-y-3">
                  <p className="text-gray-400 text-sm">Aucune histoire enregistrée en base de données ne correspond à votre recherche.</p>
                  <Button variant="glass" size="sm" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </main>
        )}

        {/* Tab 2: Discover / Categories (Formats or Genres) */}
        {activeTab === 'discover' && (
          <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-5 pb-28">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {discoverSubTab === 'formats' ? 'Formats de Création' : 'Genres & Thématiques'}
              </h2>
            </div>

            {discoverSubTab === 'formats' ? (
              /* 2x2 Grid for 4 Formats (Lyrique, Image, Vidéo, Audio) */
              <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
                {[
                  { 
                    id: 'lyrique', 
                    name: 'Lyrique', 
                    emoji: '📝', 
                    tagline: 'Récits & Textes poétiques', 
                    image: '/category_lyrique.png',
                  },
                  { 
                    id: 'image', 
                    name: 'Image', 
                    emoji: '💬', 
                    tagline: 'Illustrations & BD parlantes', 
                    image: '/category_image.png',
                  },
                  { 
                    id: 'video', 
                    name: 'Vidéo', 
                    emoji: '🎬', 
                    tagline: 'Cinéma & Conte animé', 
                    image: '/category_video.png',
                  },
                  { 
                    id: 'audio', 
                    name: 'Audio', 
                    emoji: '🎧', 
                    tagline: 'Slam & Podcasts vocaux', 
                    image: '/category_audio.png',
                  },
                ].map((format) => (
                  <div 
                    key={format.id} 
                    onClick={() => { setActiveFilter('all'); setActiveTab('home'); }}
                    className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[4/3] bg-[#141026] border border-indigo-900/40 hover:border-indigo-500/60 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.03]"
                  >
                    {/* Category Artwork */}
                    <img 
                      src={format.image} 
                      alt={format.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0819] via-[#0B0819]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                    {/* Title & Emoji written directly on the image */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">{format.emoji}</span>
                        <h3 className="font-black text-white text-lg sm:text-xl tracking-tight leading-tight group-hover:text-indigo-200 transition-colors">
                          {format.name}
                        </h3>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-300 font-medium line-clamp-1">
                        {format.tagline}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Genres Categories Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Conte & Légende', count: '142 œuvres', color: 'from-amber-600 to-rose-600' },
                  { name: 'Roman & Fiction', count: '98 œuvres', color: 'from-purple-600 to-indigo-600' },
                  { name: 'Histoire & Culture', count: '64 œuvres', color: 'from-emerald-600 to-teal-600' },
                  { name: 'Manga & BD', count: '52 œuvres', color: 'from-cyan-600 to-blue-600' },
                  { name: 'Poésie & Slam', count: '39 œuvres', color: 'from-pink-600 to-rose-600' },
                  { name: 'Audio & Podcast', count: '27 œuvres', color: 'from-orange-600 to-amber-600' },
                ].map((cat, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { setActiveFilter('all'); setActiveTab('home'); }}
                    className={`p-5 rounded-3xl bg-gradient-to-br ${cat.color} cursor-pointer hover:scale-105 transition-transform shadow-xl flex flex-col justify-end min-h-[120px]`}
                  >
                    <h3 className="font-extrabold text-white text-base leading-tight">{cat.name}</h3>
                    <p className="text-xs text-white/80 mt-1">{cat.count}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* Tab 3: Messages & Chat Inbox */}
        {activeTab === 'messages' && (
          <main className="w-full flex-1 flex flex-col min-h-0 h-[calc(100vh-64px)] md:h-screen overflow-hidden relative z-[100]">
            <MessagesView 
              onMobileChatToggle={setIsMobileChatOpen} 
              onOpenUserProfile={handleOpenUserProfile}
              targetUserName={activeChatTargetUser}
              onBackNavigation={() => {
                if (activeChatTargetUser) {
                  const targetName = activeChatTargetUser;
                  setActiveChatTargetUser(null);
                  handleOpenUserProfile({
                    name: targetName,
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    role: 'Auteur BenSo',
                  });
                }
              }}
            />
          </main>
        )}

        {/* Tab 4: Personal Library */}
        {activeTab === 'library' && (
          <main className="w-full flex-1 min-w-0">
            <LibraryView
              stories={stories}
              unlockedStoryIds={unlockedStoryIds}
              onOpenStoryDetail={(story) => setSelectedStoryForDetail(story)}
              onOpenPaymentModal={(story) => setSelectedStoryForPayment(story)}
              onOpenComments={(story) => setSelectedStoryForComments(story)}
              onOpenShare={(story) => setSelectedStoryForShare(story)}
              onNavigateHome={() => setActiveTab('home')}
            />
          </main>
        )}

        {/* Tab 5: Profile & Personal Library */}
        {activeTab === 'profile' && (
          <main className="w-full flex-1 min-w-0">
            <ProfileView
              stories={stories}
              unlockedStoryIds={unlockedStoryIds}
              onOpenStoryDetail={(story) => setSelectedStoryForDetail(story)}
              onOpenPaymentModal={(story) => setSelectedStoryForPayment(story)}
              onOpenComments={(story) => setSelectedStoryForComments(story)}
              onOpenShare={(story) => setSelectedStoryForShare(story)}
              onNavigateHome={() => setActiveTab('home')}
            />
          </main>
        )}

      </div>

      {/* Payment Modal */}
      <PaymentModal
        story={selectedStoryForPayment}
        isOpen={!!selectedStoryForPayment}
        onClose={() => setSelectedStoryForPayment(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Story Detail & Reader Modal */}
      <StoryDetailModal
        story={selectedStoryForDetail}
        isOpen={!!selectedStoryForDetail}
        onClose={() => setSelectedStoryForDetail(null)}
        onOpenPaymentModal={(story) => {
          setSelectedStoryForDetail(null);
          setSelectedStoryForPayment(story);
        }}
        onOpenShare={(story) => setSelectedStoryForShare(story)}
        onOpenComments={(story) => setSelectedStoryForComments(story)}
        onOpenUserProfile={handleOpenUserProfile}
        isUnlocked={selectedStoryForDetail ? unlockedStoryIds.includes(selectedStoryForDetail.id) : false}
      />

      {/* Comments Modal */}
      <CommentsModal
        story={selectedStoryForComments}
        isOpen={!!selectedStoryForComments}
        onClose={() => setSelectedStoryForComments(null)}
        onCommentAdded={() => fetchStories()}
        onOpenUserProfile={handleOpenUserProfile}
      />

      {/* Share Modal */}
      <ShareModal
        story={selectedStoryForShare}
        isOpen={!!selectedStoryForShare}
        onClose={() => setSelectedStoryForShare(null)}
        onShareSuccess={() => fetchStories()}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStoryCreated={handleCreateStory}
      />

      {/* Notifications Modal Drawer */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      {/* Other User Profile View Modal */}
      <UserProfileModal
        user={selectedUserProfile}
        isOpen={!!selectedUserProfile}
        stories={stories}
        unlockedStoryIds={unlockedStoryIds}
        onClose={() => setSelectedUserProfile(null)}
        onOpenStoryDetail={(story) => setSelectedStoryForDetail(story)}
        onOpenPaymentModal={(story) => setSelectedStoryForPayment(story)}
        onOpenComments={(story) => setSelectedStoryForComments(story)}
        onOpenShare={(story) => setSelectedStoryForShare(story)}
        onOpenMessage={(userName) => {
          setSelectedUserProfile(null);
          setActiveChatTargetUser(userName);
          setActiveTab('messages');
        }}
      />

    </div>
  );
}
