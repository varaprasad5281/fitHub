import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Award, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reactionEmojis = ['🔥', '💪', '👏', '❤️', '🎉'];

const activityIcons = {
  workout: { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
  meal: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  streak: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  achievement: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  leaderboard: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function ActivityCardEnhanced({ activity, reactions = [], onReact }) {
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const config = activityIcons[activity.activity_type] || activityIcons.workout;
  const Icon = config.icon;

  // Count reactions by emoji
  const reactionCounts = reactionEmojis.reduce((acc, emoji) => {
    acc[emoji] = reactions.filter(r => r.emoji === emoji).length;
    return acc;
  }, {});

  const totalReactions = reactions.length;
  const topEmojis = reactionEmojis
    .filter(emoji => reactionCounts[emoji] > 0)
    .sort((a, b) => reactionCounts[b] - reactionCounts[a])
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/70 transition-colors"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-white font-medium text-sm truncate">
                {activity.username || activity.target_user_email}
              </p>
              <p className="text-zinc-400 text-xs">{activity.activity_description}</p>
            </div>

            {/* Milestone badge */}
            {activity.is_milestone && (
              <div className="flex-shrink-0 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                <p className="text-amber-400 text-xs font-semibold">🎯 Milestone</p>
              </div>
            )}
          </div>

          {/* Activity-specific details */}
          {activity.activity_type === 'leaderboard' && activity.metadata?.rank_change && (
            <div className={`text-xs mb-2 ${
              activity.metadata.rank_change < 0 ? 'text-green-400' : 'text-zinc-500'
            }`}>
              {activity.metadata.rank_change < 0
                ? `📈 Moved from #${activity.metadata.old_rank} to #${activity.metadata.new_rank}`
                : `📉 Ranked at #${activity.metadata.new_rank}`}
            </div>
          )}

          {activity.activity_type === 'achievement' && activity.metadata?.badge_name && (
            <div className="text-xs text-purple-400 mb-2">
              ⭐ Unlocked: {activity.metadata.badge_name}
            </div>
          )}

          {activity.activity_type === 'streak' && activity.metadata?.streak_count && (
            <div className="text-xs text-yellow-400 mb-2">
              🔥 {activity.metadata.streak_count}-day streak!
            </div>
          )}

          {/* Reaction stats */}
          {totalReactions > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-xs text-zinc-500">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
              {topEmojis.map(emoji => (
                <span key={emoji} className="text-sm">{emoji}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reaction buttons */}
      <div className="flex gap-1 mt-3 relative">
        <Button
          onClick={() => setShowReactionMenu(!showReactionMenu)}
          size="sm"
          variant="ghost"
          className="text-zinc-400 hover:text-amber-400 h-7 px-2 text-xs rounded-full"
        >
          <Heart className="w-3 h-3 mr-1" /> React
        </Button>

        {showReactionMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-full left-0 mb-2 flex gap-1 bg-zinc-800 rounded-full p-2 border border-zinc-700 z-10"
          >
            {reactionEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(activity.id, emoji);
                  setShowReactionMenu(false);
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Timestamp */}
      <p className="text-xs text-zinc-600 mt-2">
        {new Date(activity.created_date).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </motion.div>
  );
}