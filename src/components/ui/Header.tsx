'use client';

import React from 'react';
import { SearchIcon, BellIcon, SparklesIcon } from './Icons';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  unreadNotifications?: number;
  activeTab?: string;
  discoverSubTab?: string;
  onDiscoverSubTabChange?: (subTab: string) => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  unreadNotifications = 3,
  activeTab = 'home',
  discoverSubTab = 'formats',
  onDiscoverSubTabChange,
  onProfileClick,
  onNotificationClick,
}) => {
  const homeFilters = [
    { id: 'all', label: 'Tout' },
    { id: 'free', label: 'Gratuit' },
  ];

  const discoverFilters = [
    { id: 'formats', label: 'Formats' },
    { id: 'genres', label: 'Genres' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B0914]/90 backdrop-blur-xl border-b border-indigo-950/60 py-2.5 px-4 md:px-8 shadow-lg shadow-black/20">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Top bar: Mobile Logo / Search / Notifications / Profile */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <SparklesIcon size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-rose-200 bg-clip-text text-transparent">
              BenSo
            </span>
          </div>

          {/* Sleek Professional Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-indigo-400/70">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-[#16122B] hover:bg-[#1C1738] focus:bg-[#1C1738] text-xs md:text-sm text-gray-100 placeholder-indigo-300/40 pl-9 pr-3.5 py-2 rounded-xl border border-indigo-900/40 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all duration-200 shadow-inner"
            />
          </div>

          {/* Action Buttons: Notifications Bell (Top Right) */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onNotificationClick}
              className="relative p-2 rounded-xl bg-[#16122B] hover:bg-[#1C1738] text-gray-300 hover:text-white border border-indigo-900/40 transition-all cursor-pointer shadow-sm active:scale-95"
              aria-label="Notifications"
              title="Centre de Notifications"
            >
              <BellIcon size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-rose-500/50 animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Contextual Filter Buttons */}
        {(activeTab === 'home' || activeTab === 'discover') && (
          <div className="flex items-center gap-2 py-0.5">
            {activeTab === 'discover' ? (
              discoverFilters.map((filter) => {
                const isActive = discoverSubTab === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => onDiscoverSubTabChange && onDiscoverSubTabChange(filter.id)}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white shadow-md shadow-indigo-500/30 border border-rose-400/30'
                        : 'bg-[#16122B] hover:bg-[#1F1A3A] text-gray-300 border border-indigo-900/40'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })
            ) : (
              homeFilters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white shadow-md shadow-indigo-500/30 border border-rose-400/30'
                        : 'bg-[#16122B] hover:bg-[#1F1A3A] text-gray-300 border border-indigo-900/40'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </header>
  );
};
