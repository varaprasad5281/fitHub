import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Users, MessageCircle, Activity, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOCK_FRIENDS = [
  { name: 'Alex R.', streak: 14, points: 1840 },
  { name: 'Jordan K.', streak: 9,  points: 1560 },
  { name: 'Sam T.',   streak: 21, points: 2210 },
  { name: 'Morgan L.',streak: 6,  points: 1120 },
];

const MOCK_ACTIVITY = [
  { name: 'Alex R.',   action: 'completed a workout',   time: '2h ago' },
  { name: 'Jordan K.', action: 'logged 3 meals',         time: '4h ago' },
  { name: 'Sam T.',    action: 'hit a 21-day streak 🔥', time: '6h ago' },
];

export default function SocialsPreview() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Elite Feature Preview</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Your Social Circle</h3>
        <p className="text-sm text-zinc-500">Unlock friends, messaging, and activity feed with Elite</p>
      </div>

      {/* Friends list preview (blurred + locked) */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Friends</p>
        <div className="space-y-2 relative">
          {MOCK_FRIENDS.map((friend, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Locked overlay */}
              <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Unlock with Elite</span>
                </div>
              </div>

              {/* Card content behind overlay */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between opacity-50 blur-[2px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {friend.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{friend.name}</p>
                    <p className="text-xs text-zinc-500">🔥 {friend.streak} day streak</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-amber-400">{friend.points} pts</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity feed preview (blurred + locked) */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Activity Feed</p>
        <div className="space-y-2 relative">
          {MOCK_ACTIVITY.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Unlock with Elite</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-3 opacity-50 blur-[2px]">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {item.name[0]}
                </div>
                <p className="text-sm text-zinc-300">
                  <span className="font-semibold text-white">{item.name}</span> {item.action}
                </p>
                <span className="text-xs text-zinc-600 ml-auto whitespace-nowrap">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Elite section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <Users className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Build your circle</p>
            <p className="text-xs text-zinc-500">Add friends and hold each other accountable</p>
          </div>
        </div>
        <div className="flex gap-3">
          <MessageCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Direct messaging</p>
            <p className="text-xs text-zinc-500">Chat directly with your training partners</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Activity className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Live activity feed</p>
            <p className="text-xs text-zinc-500">See your friends' workouts, meals and streaks in real time</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Friends leaderboard</p>
            <p className="text-xs text-zinc-500">Compete privately with people you actually know</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => navigate(createPageUrl('Subscription'))}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          Unlock Social Features
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      <p className="text-xs text-center text-zinc-500 mt-4">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
