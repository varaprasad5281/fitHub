/**
 * Badge Detail Modal
 * Shows full details of a locked badge with progress
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RARITY_STYLES } from './badgeDesignTokens';

export default function BadgeDetailModal({ badge, progress, onClose, onAction }) {
  if (!badge) return null;

  const rarityStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
  const progressPercent = progress?.progress_percent || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative max-w-md w-full rounded-3xl overflow-hidden ${rarityStyle.background} ${rarityStyle.border} ${rarityStyle.shadow}`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon with lock */}
            <div className="relative inline-block mb-6">
              <div className="text-6xl opacity-40">{badge.icon}</div>
              <Lock className="w-5 h-5 absolute bottom-0 right-0 text-zinc-600 bg-zinc-900 rounded-full p-1" />
            </div>

            {/* Badge name */}
            <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${rarityStyle.text}`}>
              {badge.rarity}
            </p>

            {/* Description */}
            <p className="text-zinc-400 text-sm mb-6">{badge.description}</p>

            {/* Requirement */}
            <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-400 uppercase mb-1">Requirement</p>
                  <p className="text-sm text-zinc-300">{progress?.action}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-400">Progress</p>
                  <p className="text-sm font-bold text-zinc-300">
                    {progress.current} / {progress.target}
                  </p>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-2 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-500"
                />
                <p className="text-xs text-zinc-500 mt-2">{progressPercent}% complete</p>
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={onAction}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-xl h-11"
            >
              Work Toward This Badge
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}