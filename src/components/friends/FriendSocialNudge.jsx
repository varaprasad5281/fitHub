import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';
import { api } from '@/api/client';

export default function FriendSocialNudge({ userEmail, onNudgeAction }) {
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeType, setNudgeType] = useState('no_friends');

  useEffect(() => {
    const checkNudgeEligibility = async () => {
      try {
        // Check if last nudge was more than 3 days ago
        const lastNudgeTime = localStorage.getItem('last_friend_nudge_time');
        const now = Date.now();

        if (lastNudgeTime && now - parseInt(lastNudgeTime) < 3 * 24 * 60 * 60 * 1000) {
          return; // Too soon
        }

        // Check friend count
        const friendships = await api.entities.Friendship.filter({
          requester_email: userEmail,
          status: 'accepted',
        });

        if (friendships.length === 0) {
          // No friends after signup
          const userCreatedDate = new Date();
          const daysSinceSignup = 0; // Would need to fetch from User entity
          // For now, show nudge if user has been active
          setNudgeType('no_friends');
          setShowNudge(true);
        }
      } catch (error) {
        console.log('Nudge check error:', error);
      }
    };

    const timer = setTimeout(checkNudgeEligibility, 2000); // Check after 2s
    return () => clearTimeout(timer);
  }, [userEmail]);

  const handleAction = () => {
    localStorage.setItem('last_friend_nudge_time', String(Date.now()));
    onNudgeAction?.();
    setShowNudge(false);
  };

  const nudges = {
    no_friends: {
      title: "You're building momentum.",
      message: "Add someone to stay accountable.",
      color: 'border-amber-500/20 bg-amber-500/5',
      icon_color: 'text-amber-400',
    },
    streak_started: {
      title: "Streak's looking strong.",
      message: "Share progress with a friend.",
      color: 'border-blue-500/20 bg-blue-500/5',
      icon_color: 'text-blue-400',
    },
    milestone_badge: {
      title: "Achievement unlocked.",
      message: "Your circle should see this.",
      color: 'border-purple-500/20 bg-purple-500/5',
      icon_color: 'text-purple-400',
    },
  };

  const nudge = nudges[nudgeType] || nudges.no_friends;

  return (
    <AnimatePresence>
      {showNudge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 max-w-sm rounded-xl border ${nudge.color} p-4 shadow-xl z-40`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Zap className={`w-5 h-5 ${nudge.icon_color} shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{nudge.title}</h3>
                <p className="text-zinc-400 text-xs mt-1">{nudge.message}</p>
                <Button
                  onClick={handleAction}
                  size="sm"
                  className="mt-3 h-7 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold text-xs rounded-full"
                >
                  Add Friends
                </Button>
              </div>
            </div>
            <button
              onClick={() => setShowNudge(false)}
              className="text-zinc-400 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}