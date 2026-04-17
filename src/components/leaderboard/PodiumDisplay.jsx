import React from 'react';
import { Crown, Award, Medal } from "lucide-react";
import { motion } from "framer-motion";

const countryFlags = {
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Netherlands": "🇳🇱",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "Brazil": "🇧🇷",
  "India": "🇮🇳",
  "South Africa": "🇿🇦",
  "Nigeria": "🇳🇬",
  "Mexico": "🇲🇽",
};

export default function PodiumDisplay({ top3, timeframe = 'weekly', category = 'points' }) {
  const [first, second, third] = top3;

  const getValue = (entry) => {
    if (category === 'points') {
      return timeframe === 'weekly' ? entry.weekly_points : entry.total_points;
    } else if (category === 'workouts') {
      return entry.workouts_count || 0;
    } else if (category === 'nutrition') {
      return entry.meals_logged || 0;
    } else {
      return entry.current_streak || 0;
    }
  };

  const getLabel = () => {
    if (category === 'points') return 'pts';
    if (category === 'workouts') return 'workouts';
    if (category === 'nutrition') return 'meals';
    return 'days';
  };

  const PodiumCard = ({ entry, rank, delay }) => {
    const heights = { 1: 'h-36 sm:h-48', 2: 'h-32 sm:h-40', 3: 'h-28 sm:h-36' };
    const widths = { 1: 'w-20 sm:w-28', 2: 'w-18 sm:w-28', 3: 'w-18 sm:w-28' };
    const icons = { 1: Crown, 2: Award, 3: Medal };
    const Icon = icons[rank];
    
    const colors = {
      1: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/40', icon: 'text-amber-400', glow: 'animate-pulse-glow' },
      2: { bg: 'from-zinc-600/20 to-zinc-700/10', border: 'border-zinc-500/40', icon: 'text-zinc-300', glow: '' },
      3: { bg: 'from-amber-900/20 to-amber-950/10', border: 'border-amber-800/40', icon: 'text-amber-700', glow: '' },
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`flex flex-col items-center ${rank === 2 ? 'order-1' : rank === 1 ? 'order-2' : 'order-3'}`}
      >
        {/* Profile Picture */}
        <div className={`relative mb-2 sm:mb-3 ${rank === 1 ? 'w-16 h-16 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-20 sm:h-20'}`}>
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${colors[rank].bg} border-2 ${colors[rank].border} ${colors[rank].glow} flex items-center justify-center overflow-hidden`}>
            {entry.profile_picture_url ? (
              <img 
                src={entry.profile_picture_url} 
                alt={entry.username} 
                className="w-full h-full object-cover" 
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="text-3xl font-black text-zinc-400">
                {entry.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${colors[rank].bg} border ${colors[rank].border} flex items-center justify-center ${colors[rank].glow}`}>
            <Icon className={`w-4 h-4 ${colors[rank].icon}`} />
          </div>
        </div>

        {/* Country Flag */}
        {entry.country && (
          <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{countryFlags[entry.country] || '🌍'}</div>
        )}

        {/* Username */}
        <p className="text-white font-semibold text-xs sm:text-sm mb-1 text-center truncate max-w-full px-1">
          {entry.username || 'Anonymous'}
        </p>

        {/* Podium */}
        <div className={`${heights[rank]} ${widths[rank]} rounded-t-2xl bg-gradient-to-b ${colors[rank].bg} border-t-2 border-x-2 ${colors[rank].border} ${colors[rank].glow} flex flex-col items-center justify-start pt-2 sm:pt-4`}>
          <div className={`text-2xl sm:text-4xl font-black ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-zinc-300' : 'text-amber-700'}`}>
            #{rank}
          </div>
          <div className="text-white text-base sm:text-lg font-bold mt-1 sm:mt-2">
            {getValue(entry)}
          </div>
          <div className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider">{getLabel()}</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 px-2">
        {second && <PodiumCard entry={second} rank={2} delay={0.2} />}
        {first && <PodiumCard entry={first} rank={1} delay={0} />}
        {third && <PodiumCard entry={third} rank={3} delay={0.4} />}
      </div>
    </div>
  );
}