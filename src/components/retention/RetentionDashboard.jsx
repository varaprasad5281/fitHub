/**
 * Retention Dashboard
 * Core engagement & retention metrics for users
 * Integrates: personal identity, daily progress, upgrade prompts
 */

import React from 'react';
import { motion } from 'framer-motion';
import PersonalIdentity from './PersonalIdentity';
import DailyProgressWidget from './DailyProgressWidget';
import ProgressHistory from './ProgressHistory';
import SmartUpgradePrompt from './SmartUpgradePrompt';

export default function RetentionDashboard() {
  return (
    <div className="space-y-4">
      {/* Identity (top) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <PersonalIdentity />
      </motion.div>

      {/* Daily Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DailyProgressWidget />
      </motion.div>

      {/* Smart Upgrade Prompt (contextual) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SmartUpgradePrompt />
      </motion.div>

      {/* Progress History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ProgressHistory />
      </motion.div>
    </div>
  );
}