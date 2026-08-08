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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [unlockedStoryIds, setUnlockedStoryIds] = useState<string[]>([]);

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
    <div className="min-h-screen bg-[#0B0914] text-gray-100 flex flex-col md:flex-row pb-28 md:pb-8">
      {/* Navigation (Sidebar desktop + Bottom bar mobile) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-w-0 flex flex-col">
        
        {/* Sticky Header - Rendered only on Home tab */}
        {activeTab === 'home' && (
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            activeTab={activeTab}
            discoverSubTab={discoverSubTab}
            onDiscoverSubTabChange={setDiscoverSubTab}
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
          <main className="w-full flex-1 flex flex-col items-center justify-center p-1 sm:p-4 pb-16 md:pb-0">
            <MessagesView />
          </main>
        )}

        {/* Tab 4: Personal Library */}
        {activeTab === 'library' && (
          <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Ma Bibliothèque</h2>
              <Badge variant="free">{unlockedStoryIds.length} œuvre(s) débloquée(s)</Badge>
            </div>

            {unlockedStoryIds.length === 0 ? (
              <div className="py-12 text-center bg-[#151226] rounded-3xl border border-indigo-900/30 p-8 space-y-3">
                <BookOpenIcon size={40} className="mx-auto text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Votre bibliothèque est vide</h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto">
                  Achetez une œuvre via Mobile Money ou sauvegardez une histoire gratuite pour la retrouver ici à tout moment.
                </p>
                <Button variant="coral" size="sm" onClick={() => setActiveTab('home')}>
                  Découvrir les sables de récits
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stories.filter(s => unlockedStoryIds.includes(s.id)).map(story => (
                  <div 
                    key={story.id} 
                    onClick={() => setSelectedStoryForDetail(story)}
                    className="bg-[#151226] p-4 rounded-2xl border border-indigo-900/40 flex items-center gap-3 cursor-pointer hover:border-indigo-500/50"
                  >
                    <img src={story.coverImage} alt={story.title} className="w-16 h-20 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{story.title}</h4>
                      <p className="text-xs text-indigo-300">{story.author.name}</p>
                      <span className="text-[10px] text-emerald-400 font-bold block mt-2">✓ Débloqué & Accessible</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* Tab 4: Creator / User Profile */}
        {activeTab === 'profile' && (
          <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-[#151226] p-6 rounded-3xl border border-indigo-900/40 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Ben HOUNSA"
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Ben HOUNSA</h2>
                    <VerifiedIcon size={20} />
                  </div>
                  <p className="text-xs text-indigo-300">@benhounsa • Promoteur & Auteur</p>
                  <p className="text-xs text-gray-400 mt-1">Cotonou, Bénin 🇧🇯</p>
                </div>
              </div>

              {/* Creator Financials Widget */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#1A162F] border border-indigo-900/30 text-center">
                <div>
                  <span className="text-xs text-gray-400 block">Solde Disponible</span>
                  <span className="text-base font-extrabold text-emerald-400">14 500 F CFA</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Ventes Totales</span>
                  <span className="text-base font-extrabold text-amber-300">29 Ventes</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-xs text-gray-400 block">Commission BenSo</span>
                  <span className="text-base font-extrabold text-indigo-300">15 %</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="coral" 
                  size="md" 
                  fullWidth 
                  onClick={() => alert("Demande de retrait vers le numéro Mobile Money +229 97XX XX XX initiée (14 500 F CFA).")}
                >
                  Retirer mes gains (Mobile Money)
                </Button>
              </div>
            </div>
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
        isUnlocked={selectedStoryForDetail ? unlockedStoryIds.includes(selectedStoryForDetail.id) : false}
      />

      {/* Comments Modal */}
      <CommentsModal
        story={selectedStoryForComments}
        isOpen={!!selectedStoryForComments}
        onClose={() => setSelectedStoryForComments(null)}
        onCommentAdded={() => fetchStories()}
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

    </div>
  );
}
