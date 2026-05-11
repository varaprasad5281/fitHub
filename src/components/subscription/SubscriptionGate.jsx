import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/client';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const _api = /** @type {any} */ (api);

// Pages that are always accessible regardless of subscription
const OPEN_PATHS = ['/subscription', '/onboarding', '/login', '/register', '/pricing', '/terms', '/privacy', '/contact'];

const PRO_FEATURES = [
  '🥗 Nutrition tracking & AI meal plans',
  '💪 Personalised workout plans',
  '🎯 Daily coaching & guidance',
  '📊 Progress tracking & streaks',
  '🏆 Leaderboard & social features',
];

/** @param {{ children: React.ReactNode }} props */
export default function SubscriptionGate({ children }) {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isOpenPath = OPEN_PATHS.some(p =>
    location.pathname.toLowerCase().startsWith(p)
  );

  const { data: subscriptions = [], isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => _api.entities.Subscription.list().catch(() => []),
    enabled: !!user && !isOpenPath,
    staleTime: 1000 * 60,
  });

  // Don't gate open pages or while loading
  if (isOpenPath || isLoadingAuth || !user) return <>{children}</>;

  // Still fetching subscription - let through to avoid flash
  if (subLoading) return <>{children}</>;

  const sub = subscriptions[0];
  const plan = sub?.plan;
  const status = sub?.status;

  // Determine if the user has active paid access
  const hasAccess =
    plan && plan !== 'starter' &&
    (status === 'active' || status === 'trial' ||
      (status === 'cancelled' && sub?.end_date && new Date(sub.end_date) > new Date()));

  if (hasAccess) return <>{children}</>;

  // Locked screen
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Unlock 7% Features
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Start your <span className="text-amber-400 font-semibold">7-day free trial</span> to access all features. No charge until the trial ends - cancel anytime.
        </p>

        {/* Feature list */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 mb-6 text-left">
          <ul className="space-y-3">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                {f.slice(2)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <span className="text-3xl font-black text-green-400">Free</span>
          <span className="text-green-500/70 text-sm font-semibold ml-2">for 7 days</span>
        </div>
        <p className="text-zinc-500 text-xs mb-6">then £12.99/month</p>

        <Button
          onClick={() => navigate('/Subscription')}
          className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold rounded-xl text-base shadow-lg shadow-amber-500/20 mb-4"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View Plans &amp; Start Free Trial
        </Button>

        <button
          onClick={() => navigate('/login')}
          className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
        >
          Sign in to a different account
        </button>
      </div>
    </div>
  );
}
