import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, Flame, Zap, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const reactionEmojis = {
  fire: '🔥',
  muscle: '💪',
  heart: '❤️',
  rocket: '🚀',
  clap: '👏'
};

export default function ActivityCard({ activity, reactions = [] }) {
  const queryClient = useQueryClient();
  const [isReacting, setIsReacting] = useState(false);

  const handleReaction = async (reactionType) => {
    try {
      setIsReacting(true);
      const userEmail = (await api.auth.me())?.email;
      
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.reaction_type === reactionType && r.reactor_email === userEmail
      );

      if (existingReaction) {
        await api.entities.SocialReaction.delete(existingReaction.id);
      } else {
        await api.entities.SocialReaction.create({
          activity_feed_id: activity.id,
          reaction_type: reactionType,
          reactor_email: userEmail,
          reactor_username: (await api.auth.me())?.full_name
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social-reactions'] });
    } catch (error) {
      toast.error('Failed to react');
    } finally {
      setIsReacting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `🏆 ${activity.title}\n${activity.description}\n\n7% Fitness App`;
      if (navigator.share) {
        await navigator.share({ title: '7% Activity', text: shareText });
        await api.entities.ActivityFeed.update(activity.id, {
          share_count: (activity.share_count || 0) + 1
        });
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Activity copied to clipboard');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const reactionCounts = {};
  reactions.forEach(r => {
    reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
      <div className="mb-3">
        <p className="text-white font-semibold text-sm">{activity.title}</p>
        <p className="text-zinc-400 text-xs mt-1">{activity.description}</p>
        <p className="text-zinc-600 text-xs mt-2">@{activity.target_username}</p>
      </div>

      {/* Reaction Display */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-zinc-800">
          {Object.entries(reactionCounts).map(([type, count]) => (
            <span 
              key={type} 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/50 text-xs"
            >
              {reactionEmojis[type]} {count}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {['fire', 'muscle', 'heart', 'rocket'].map(type => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isReacting}
            className="flex-1 py-2 px-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300"
          >
            {reactionEmojis[type]}
          </button>
        ))}
        <button
          onClick={handleShare}
          className="py-2 px-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800 transition-colors"
        >
          <Share2 className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}