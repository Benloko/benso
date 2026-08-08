'use client';

import React from 'react';
import { 
  HomeIcon, 
  CompassIcon, 
  PlusCircleIcon, 
  LibraryIcon, 
  MessageIcon,
  UserIcon,
  SparklesIcon,
  BookOpenIcon,
  BellIcon
} from './Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  isAction?: boolean;
}

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateModal?: () => void;
  isMobileChatOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenCreateModal, isMobileChatOpen = false }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Accueil', icon: <HomeIcon size={22} /> },
    { id: 'discover', label: 'Découvrir', icon: <CompassIcon size={22} /> },
    { id: 'create', label: 'Publier', icon: <PlusCircleIcon size={26} />, isAction: true },
    { id: 'messages', label: 'Messages', icon: <MessageIcon size={22} /> },
    { id: 'profile', label: 'Profil', icon: <UserIcon size={22} /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120F24]/90 backdrop-blur-xl border-t border-indigo-950/60 px-2 py-2 ${
        isMobileChatOpen ? 'hidden' : 'block'
      }`}>
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => onOpenCreateModal ? onOpenCreateModal() : onTabChange('create')}
                  className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
                  aria-label="Créer une histoire"
                >
                  <div className="w-13 h-13 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform duration-200">
                    <div className="w-full h-full rounded-full bg-[#0B0914] flex items-center justify-center text-rose-400 group-hover:text-white transition-colors">
                      <PlusCircleIcon size={28} />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-rose-400 mt-1">Publier</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.id === 'notifications' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#120F24] animate-pulse" />
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-400" />
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40 bg-[#120F24] border-r border-indigo-950/60 p-5 overflow-y-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => onTabChange('home')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <SparklesIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-rose-300 bg-clip-text text-transparent">
              BenSo
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium">Stories & Community</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 mb-8">
          <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</p>
          {navItems.map((item) => {
            if (item.isAction) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/40 shadow-sm'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Button for Creators */}
        <button
          onClick={() => onOpenCreateModal ? onOpenCreateModal() : onTabChange('create')}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all cursor-pointer mb-6"
        >
          <PlusCircleIcon size={20} />
          <span>Créer une œuvre</span>
        </button>

        {/* Wallet / Earnings Widget Preview */}
        <div className="mt-auto p-4 rounded-2xl bg-[#181433] border border-indigo-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Solde Créateur</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Actif</span>
          </div>
          <p className="text-lg font-bold text-white mb-3">14 500 F CFA</p>
          <button 
            onClick={() => alert("Portefeuille Créateur BenSo: Demande de retrait Mobile Money disponible à partir de 1 000 F CFA.")}
            className="w-full text-center text-xs py-2 rounded-xl bg-white/10 hover:bg-white/15 text-indigo-300 transition-colors font-medium cursor-pointer"
          >
            Gérer mes revenus
          </button>
        </div>
      </aside>
    </>
  );
};
