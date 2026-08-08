import React from 'react';

export interface BadgeProps {
  variant?: 'free' | 'premium' | 'preview' | 'genre' | 'season';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'free',
  children,
  className = '',
  icon,
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all';
  
  const variants = {
    free: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    premium: 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-900/30',
    preview: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    genre: 'bg-white/10 text-gray-200 border border-white/10 hover:bg-white/15',
    season: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {icon && <span className="inline-block">{icon}</span>}
      {children}
    </span>
  );
};
