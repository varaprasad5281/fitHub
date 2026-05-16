import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { useLanguage } from '@/components/i18n/LanguageContext';

export default function SuggestedFriendsCard({ suggestion, onAddFriend, isLoading }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Avatar */}
        <UserAvatar
          src={suggestion.profile_picture}
          name={suggestion.username}
          className="w-10 h-10"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{suggestion.username}</p>
          <div className="flex items-center gap-1 flex-wrap mt-0.5">
            {suggestion.reasons?.map((reason, i) => (
              <span key={i} className="text-xs text-zinc-400">
                {reason}
                {i < suggestion.reasons.length - 1 ? ' • ' : ''}
              </span>
            ))}
            {suggestion.mutual_friend_count > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-400 font-medium">
                <Users className="w-3 h-3" />
                {suggestion.mutual_friend_count} mutual
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onAddFriend(suggestion.email)}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className="shrink-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold text-xs rounded-full"
      >
        {isLoading ? 'Adding...' : 'Add'}
      </Button>
    </motion.div>
  );
}