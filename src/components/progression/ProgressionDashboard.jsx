/**
 * Progression Dashboard
 * Complete engagement & retention hub
 */

import React from 'react';
import { motion } from 'framer-motion';
import LevelProgressBar from './LevelProgressBar';
import ChallengeTracker from './ChallengeTracker';
import PrestigeDisplay from './PrestigeDisplay';
import PerksPanel from './PerksPanel';
import UserRewardsPanel from '../badge/UserRewardsPanel';

export default function ProgressionDashboard() {
  return (
    <div className="space-y-4">
      {/* Level & XP */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <LevelProgressBar />
      </motion.div>

      {/* Challenges */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ChallengeTracker />
      </motion.div>

      {/* Perks */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <PerksPanel />
      </motion.div>

      {/* Prestige */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <PrestigeDisplay />
      </motion.div>

      {/* Active Rewards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Active Rewards</h3>
          <UserRewardsPanel />
        </div>
      </motion.div>
    </div>
  );
}