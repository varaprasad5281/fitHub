import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrency } from "@/components/hooks/useCurrency";
import { Loader2 } from "lucide-react";
import { api } from '@/api/client';
import { activeSub } from '@/lib/subscriptionUtils';

/**
 * @param {{ fullPage?: boolean, onUpgrade?: (period: string) => void }} props
 */
export default function PricingSection({ fullPage = false }) {
  const [billing, setBilling] = useState('monthly');
  const { formatPrice } = useCurrency();

  // Detect if the logged-in user has already used their free trial
  const { data: authUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
  });
  const hasUsedTrial = activeSub(subscriptions)?.had_trial === true;
  // Track which specific plan is loading — null means nothing is loading
  const [upgradingPlan, setUpgradingPlan] = useState(/** @type {string|null} */(null));

  /** @param {string} billingPeriod */
  const handleUpgrade = async (billingPeriod) => {
    if (window.self !== window.top) {
      toast.error('Checkout only works from published apps. Please open this app in a new tab.');
      return;
    }

    setUpgradingPlan(billingPeriod);
    try {
      const isAuth = api.auth.isAuthenticated();
      let userEmail;

      if (isAuth) {
        const user = await api.auth.me();
        userEmail = user?.email;
      } else {
        userEmail = prompt('Enter your email to proceed with checkout:');
        if (!userEmail || !userEmail.includes('@')) {
          toast.error('Valid email required to proceed');
          return;
        }
      }

      if (!userEmail) {
        toast.error('Could not get email. Please log in and try again.');
        return;
      }

      const idempotencyKey = `checkout_${userEmail}_${billingPeriod}_${Date.now()}`;
      const appOrigin = window.location.origin;
      const data = await api.functions.invoke('createCheckout', {
        billingPeriod,
        userEmail,
        idempotencyKey,
        successUrl: `${appOrigin}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appOrigin}/subscription?checkout=cancelled`,
      });

      if (!data?.url) {
        throw new Error('Could not connect to checkout. Please try again.');
      }

      window.location.href = data.url;
    } catch (err) {
      toast.error((err instanceof Error ? err.message : null) || 'Failed to start checkout. Please try again.');
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      name: "7% Pro",
      priceGBP: billing === 'monthly' ? 12.99 : 8.25,
      period: "/month",
      yearlyBillingGBP: 99,
      savingsGBP: 56,
      quote: "Most popular. Track, train, and stay consistent.",
      features: [
        "🥗 Nutrition tracking & meal plans",
        "💪 Workout plans & builder",
        "🎯 Coaching & guidance",
      ],
      noFeatures: [],
      limits: null,
      cta: hasUsedTrial
        ? (billing === 'monthly' ? "Subscribe Now" : "Subscribe & Save 36%")
        : (billing === 'monthly' ? "Start Free Trial" : "Start Free Trial. Save 36%"),
      highlight: false,
      badge: hasUsedTrial ? null : "7 DAY FREE TRIAL",
      trial: !hasUsedTrial,
      trialUsed: hasUsedTrial,
    },
    {
      name: "7% Elite",
      priceGBP: billing === 'monthly' ? 24.99 : 16.58,
      wasGBP: billing === 'monthly' ? 36.99 : 24.99,
      period: "/month",
      yearlyBillingGBP: 199,
      savingsGBP: 100,
      quote: "The 1% of the 7%. Serious athletes only.",
      features: [
        "✅ Everything in Pro, plus:",
        "🏆 Leaderboard access & rankings",
        "👥 Friends & social features",
        "📣 Social feed & activity",
        "🎯 Challenges & competitions",
      ],
      limits: null,
      cta: billing === 'monthly' ? "Go Elite" : "Go Elite. Save 33%",
      highlight: true,
      badge: "BEST VALUE"
    }
  ];

  return (
    <section className={`${fullPage ? 'pt-12' : 'py-24'} px-6 bg-zinc-950`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Discipline isn't expensive.<br />
            <span className="text-amber-400">Quitting is.</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-4">
            Start free. Upgrade to compete globally and unlock elite accountability.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-green-400 text-sm font-semibold">7-day free trial on Pro. No card surprises.</span>
          </div>
          <p className="text-zinc-600 text-sm">
            Over 10,000 people building the 7% habit 🔥
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all active:scale-95 ${
                billing === 'monthly'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all relative active:scale-95 ${
                billing === 'yearly'
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-green-500 text-black text-[10px] font-bold uppercase pointer-events-none">
                Best
              </span>
            </button>
          </div>
          {billing === 'yearly' && (
            <p className="text-green-400 text-sm font-semibold animate-pulse">
              🎉 Save up to {formatPrice(100)}/year
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-3xl p-6 sm:p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-2 border-amber-500/30 shadow-[0_0_50px_rgba(251,191,36,0.2)]'
                  : 'bg-zinc-900/50 border border-zinc-800'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider ${
                    plan.trial
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{plan.name}</h3>
                {plan.trial ? (
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-green-400">Free</span>
                      <span className="text-green-500/70 text-sm font-semibold">7-day trial</span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">
                      then {formatPrice(plan.priceGBP)}/month
                      {billing === 'yearly' && plan.yearlyBillingGBP && (
                        <span className="text-green-400 font-semibold ml-1">· Save {formatPrice(plan.savingsGBP)}/yr on annual</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="mb-1">
                    {plan.wasGBP && (
                      <span className="text-zinc-400 text-2xl sm:text-3xl font-bold decoration-red-500 decoration-2 line-through mr-1">
                        {formatPrice(plan.wasGBP)}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-white">{formatPrice(plan.priceGBP)}</span>
                      <span className="text-zinc-500 text-base sm:text-lg">{plan.period}</span>
                    </div>
                    {plan.yearlyBillingGBP && billing === 'yearly' && (
                      <p className="text-green-400 text-xs font-semibold mt-1">Billed {formatPrice(plan.yearlyBillingGBP)}/year · Save {formatPrice(plan.savingsGBP)}</p>
                    )}
                  </div>
                )}
                <p className="text-zinc-400 text-sm italic leading-relaxed mt-2">"{plan.quote}"</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sm leading-relaxed text-zinc-300">{feature}</span>
                  </li>
                ))}
                {plan.noFeatures && plan.noFeatures.map((feature, i) => (
                  <li key={`no-${i}`} className="flex items-start gap-2">
                    <span className="text-sm leading-relaxed text-zinc-500 italic">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limits && (
                <div className="mb-6 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-zinc-500 text-xs text-center">{plan.limits}</p>
                </div>
              )}

              <Button
                onClick={() => handleUpgrade(plan.name === "7% Pro"
                  ? (billing === 'monthly' ? 'pro_monthly' : 'pro_yearly')
                  : (billing === 'monthly' ? 'elite_monthly' : 'elite_yearly')
                )}
                disabled={upgradingPlan === (plan.name === "7% Pro"
                  ? (billing === 'monthly' ? 'pro_monthly' : 'pro_yearly')
                  : (billing === 'monthly' ? 'elite_monthly' : 'elite_yearly'))}
                className={`w-full h-10 sm:h-12 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black shadow-[0_4px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:cursor-wait'
                    : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-wait'
                }`}
              >
                {upgradingPlan === (plan.name === "7% Pro"
                  ? (billing === 'monthly' ? 'pro_monthly' : 'pro_yearly')
                  : (billing === 'monthly' ? 'elite_monthly' : 'elite_yearly')) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Processing…
                  </>
                ) : (
                  plan.cta
                )}
              </Button>

              <p className="text-center text-zinc-600 text-xs mt-3">
                {plan.trialUsed
                  ? 'Free trial already used — billed immediately'
                  : plan.trial
                    ? '7-day free trial • Cancel anytime'
                    : 'Cancel anytime • No commitment'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}