/**
 * Smart Upgrade Prompt Component
 * Psychology-based upgrade triggers at meaningful moments
 * Never aggressive, always contextual
 */

import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function SmartUpgradePrompt() {
  const [promptData, setPromptData] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUpgradePrompt = async () => {
      try {
        const user = await api.auth.me();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const response = await api.functions.invoke('smartUpgradePrompt', {
          user_email: user.email
        });

        if (response?.data?.should_show_prompt) {
          // Track that we showed the prompt
          await api.functions.invoke('trackBehaviorMetric', {
            user_email: user.email,
            metric_type: 'upgrade_view',
            metadata: {
              trigger_context: response.data.trigger,
              context: response.data.trigger,
              user_level: response.data.level,
              subscription_status: response.data.subscription_status,
              streak_length: response.data.streak_length
            }
          }).catch(err => console.error('Failed to track:', err));

          setPromptData(response.data);
        }
      } catch (error) {
        console.error('Error checking upgrade prompt:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUpgradePrompt();
  }, []);

  if (isLoading || dismissed || !promptData) {
    return null;
  }

  const urgency = promptData.urgency === 'high';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`rounded-2xl p-4 border ${
          urgency
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-zinc-800 bg-zinc-900/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${urgency ? 'text-amber-400' : 'text-zinc-500'}`} />
            <h3 className={`text-sm font-bold uppercase tracking-wide ${
              urgency ? 'text-amber-400' : 'text-white'
            }`}>
              {promptData.tier_recommended === 'elite' ? 'Unlock Elite' : 'Go Pro'}
            </h3>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy */}
        <p className={`text-sm leading-relaxed mb-4 ${
          urgency ? 'text-amber-300' : 'text-zinc-300'
        }`}>
          {promptData.copy}
        </p>

        {/* CTA */}
        <Link to={createPageUrl('Subscription')}>
          <Button
            className={`w-full h-10 font-semibold rounded-lg flex items-center justify-center gap-2 ${
              urgency
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {promptData.tier_recommended === 'elite' ? 'View Elite' : 'View Pro'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        {/* Subtext */}
        <p className="text-xs text-zinc-600 text-center mt-2">
          No commitment. Cancel anytime.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}