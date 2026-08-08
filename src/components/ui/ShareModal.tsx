'use client';

import React, { useState } from 'react';
import { StoryItem } from './StoryCard';

interface ShareModalProps {
  story: StoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: (updatedStory: StoryItem) => void;
}

// Clean crisp SVG brand logos
const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current text-blue-400" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5 fill-current text-sky-400" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.762-.168.711-.43 1.011-.684 1.033-.553.05-1.025-.367-1.561-.718-.839-.55-1.312-.892-2.126-1.428-.941-.62-.331-.961.206-1.519.14-.146 2.573-2.358 2.62-2.558.006-.025.011-.119-.044-.168s-.136-.032-.195-.019c-.083.019-1.41.897-3.98 2.632-.377.26-.718.388-1.024.381-.337-.007-.986-.19-1.468-.347-.591-.192-1.06-.294-1.019-.622.021-.171.258-.346.71-.525 2.782-1.211 4.638-2.011 5.568-2.4 2.65-.111 3.201 1.341 3.018 2.455z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 fill-current text-blue-500" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.262-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export const ShareModal: React.FC<ShareModalProps> = ({
  story,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}#story-${story.id}` : '';
  const shareText = `Découvrez l'œuvre "${story.title}" par ${story.author.name} sur BenSo ! 📚✨`;

  const handleRegisterShare = async () => {
    try {
      const res = await fetch(`/api/stories/${story.id}/share`, { method: 'POST' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.story && onShareSuccess) {
        onShareSuccess(json.story);
      }
    } catch (err) {
      console.error('Error registering share:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    handleRegisterShare();
    setTimeout(() => setCopied(false), 3000);
  };

  const shareNetworks = [
    {
      name: 'WhatsApp',
      subtitle: 'Discuter ou Statut',
      icon: <WhatsAppIcon />,
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
      hoverGlow: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
    },
    {
      name: 'Facebook',
      subtitle: 'Fil d\'actualité & Story',
      icon: <FacebookIcon />,
      badgeBg: 'bg-blue-500/15 border-blue-500/30',
      hoverGlow: 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'X (Twitter)',
      subtitle: 'Publier un post',
      icon: <XTwitterIcon />,
      badgeBg: 'bg-white/10 border-white/20',
      hoverGlow: 'hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: 'Telegram',
      subtitle: 'Canal ou message',
      icon: <TelegramIcon />,
      badgeBg: 'bg-sky-500/15 border-sky-500/30',
      hoverGlow: 'hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]',
      url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'LinkedIn',
      subtitle: 'Réseau pro',
      icon: <LinkedInIcon />,
      badgeBg: 'bg-blue-600/15 border-blue-600/30',
      hoverGlow: 'hover:border-blue-600/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
  ];

  const handleNetworkShare = (url: string) => {
    handleRegisterShare();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      
      {/* Modal Container with Premium Glassmorphic Design */}
      <div className="bg-[#0F0C20]/95 border border-white/10 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_0_60px_rgba(99,102,241,0.25)] relative overflow-hidden text-white flex flex-col gap-5">
        
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 sm:hidden" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#130E2B] rounded-[14px] flex items-center justify-center text-lg">
                ✨
              </div>
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight tracking-tight">
                Partager cette œuvre
              </h3>
              <p className="text-xs text-indigo-300 font-medium">Faites rayonner l'histoire sur vos réseaux</p>
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

        {/* Glossy Story Snapshot Card */}
        <div className="relative rounded-2xl overflow-hidden p-3.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-white/10 flex items-center gap-3.5">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 inline-block">
              {story.category}
            </span>
            <h4 className="text-sm font-black text-white truncate">{story.title}</h4>
            <p className="text-xs text-indigo-200/80 truncate">Par {story.author.name}</p>
          </div>
        </div>

        {/* One-Tap Direct Link Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-300 tracking-wide">
            Lien direct de l'œuvre
          </label>
          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 focus-within:border-indigo-500/60 transition-colors">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-indigo-200 px-3 py-1 flex-1 outline-none font-mono truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40 scale-105'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
          </div>
        </div>

        {/* Social Networks List Grid */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-300 tracking-wide">
            Partager sur vos réseaux sociaux :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shareNetworks.map((net) => (
              <button
                key={net.name}
                type="button"
                onClick={() => handleNetworkShare(net.url)}
                className={`flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 ${net.hoverGlow} text-white transition-all duration-300 active:scale-95 cursor-pointer text-left group`}
              >
                <div className={`w-9 h-9 rounded-xl ${net.badgeBg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {net.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-black text-white leading-tight group-hover:text-indigo-200 transition-colors">
                    {net.name}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">
                    {net.subtitle}
                  </span>
                </div>
                <span className="text-gray-500 group-hover:text-white transition-colors text-xs font-bold">➔</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toast confirmation banner */}
        {copied && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs text-center font-extrabold animate-fadeIn shadow-lg">
            ✨ Lien copié dans le presse-papier ! Vous pouvez le coller où vous voulez.
          </div>
        )}

      </div>
    </div>
  );
};
