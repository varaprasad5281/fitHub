import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, Users, Gift, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const MILESTONES = [
  {
    count: 5,
    label: '5 referrals',
    reward: 'Rare Badge + 100 Points',
    icon: '🔗',
    detail: '"Connector" badge + 100 points',
    rarity: 'rare',
  },
  {
    count: 10,
    label: '10 referrals',
    reward: '1 Month Free Pro',
    icon: '🏅',
    detail: 'Full Pro access, free for 30 days',
    rarity: 'pro',
  },
  {
    count: 15,
    label: '15 referrals',
    reward: 'Epic Badge + 250 Points',
    icon: '📣',
    detail: '"Influencer" badge + 250 points',
    rarity: 'epic',
  },
  {
    count: 20,
    label: '20 referrals',
    reward: '1 Month Free Elite',
    icon: '👑',
    detail: 'Full Elite access, free for 30 days',
    rarity: 'elite',
  },
  {
    count: 25,
    label: '25 referrals',
    reward: 'Coming Soon',
    icon: '🚀',
    detail: 'Something big is being planned...',
    rarity: 'coming_soon',
  },
];

const RARITY_STYLES = {
  rare:        { border: 'border-blue-500/50',   bg: 'bg-blue-900/20',   label: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-300' },
  epic:        { border: 'border-purple-500/50', bg: 'bg-purple-900/20', label: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  pro:         { border: 'border-amber-500/50',  bg: 'bg-amber-900/20',  label: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-300' },
  elite:       { border: 'border-amber-400/60',  bg: 'bg-amber-900/25',  label: 'text-amber-300',  badge: 'bg-amber-400/20 text-amber-200' },
  coming_soon: { border: 'border-zinc-700',      bg: 'bg-zinc-900/40',   label: 'text-zinc-500',   badge: 'bg-zinc-800 text-zinc-500' },
};

function MilestoneCard({ milestone, completed, granted }) {
  const achieved = completed >= milestone.count;
  const s = RARITY_STYLES[milestone.rarity];
  const progress = Math.min(100, Math.round((completed / milestone.count) * 100));

  return (
    <div className={`rounded-2xl border p-5 transition-all ${achieved ? `${s.border} ${s.bg} shadow-lg` : 'border-zinc-800 bg-zinc-900/50'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-3xl ${!achieved ? 'grayscale opacity-40' : ''}`}>{milestone.icon}</span>
          <div>
            <p className={`font-bold text-sm ${achieved ? 'text-white' : 'text-zinc-400'}`}>{milestone.label}</p>
            <p className={`text-xs font-semibold mt-0.5 ${achieved ? s.label : 'text-zinc-600'}`}>{milestone.reward}</p>
          </div>
        </div>
        {granted ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full whitespace-nowrap">
            <Check className="w-3 h-3" /> Claimed
          </span>
        ) : achieved ? (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.badge}`}>Unlocked</span>
        ) : null}
      </div>

      <p className={`text-xs mb-3 ${achieved ? 'text-zinc-300' : 'text-zinc-600'}`}>{milestone.detail}</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${achieved ? 'bg-amber-500' : 'bg-zinc-700'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-zinc-600 mt-1 text-right">
        {Math.min(completed, milestone.count)} / {milestone.count}
      </p>
    </div>
  );
}

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['referral-stats', user?.email],
    queryFn: () => api.functions.invoke('getReferralStats', {}),
    enabled: !!user,
  });

  const completed  = stats?.completed  ?? 0;
  const pending    = stats?.pending    ?? 0;
  const granted    = new Set(stats?.rewards_granted ?? []);
  const link       = stats?.referral_link ?? '';
  const code       = stats?.referral_code ?? '';

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy the link manually.');
    }
  };

  const handleShare = async () => {
    if (navigator.share && link) {
      try {
        await navigator.share({
          title: 'Join 7% with me',
          text: 'I use 7% to track my fitness. Join with my link and we both benefit!',
          url: link,
        });
      } catch {
        // user dismissed share sheet — no-op
      }
    } else {
      handleCopy();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Log in to view your referrals</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Referrals</h1>
          <p className="text-zinc-400">Invite friends. Earn rewards when they subscribe.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">{completed}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Subscribed</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-zinc-400">{pending}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Signed up (pending)</p>
              </div>
            </div>

            {/* Referral link card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Your Referral Link</p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 mb-3">
                <p className="flex-1 text-xs text-zinc-300 truncate font-mono">{link || '—'}</p>
                {code && (
                  <span className="text-[10px] font-bold text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                    {code}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-6">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">How it works</p>
              <ol className="space-y-2">
                {[
                  'Share your link with friends',
                  'They sign up via your link',
                  'Reward unlocks when they subscribe to any paid plan',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0 mt-px">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Milestones */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Milestone Rewards</p>
              </div>
              <div className="space-y-3">
                {MILESTONES.map(m => (
                  <MilestoneCard
                    key={m.count}
                    milestone={m}
                    completed={completed}
                    granted={granted.has(m.count)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
