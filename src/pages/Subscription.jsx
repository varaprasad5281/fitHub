import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, ExternalLink, AlertCircle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import CancelModal from "@/components/subscription/CancelModal";
import { createPageUrl } from "@/utils";
import PricingSection from "@/components/landing/PricingSection";
import { withActionDebug } from '@/components/debug/ActionDebugger';
import { activeSub } from '@/lib/subscriptionUtils';

export default function Subscription() {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    api.analytics.track({
      eventName: 'subscription_page_viewed',
      properties: { page: 'subscription' }
    });

    // When landing here after a successful Stripe checkout, verify payment directly
    // with Stripe and update the subscription immediately - no webhook dependency.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('checkout') === 'success' && sessionId) {
      window.history.replaceState({}, '', window.location.pathname);
      api.functions.invoke('verifyCheckoutSession', { session_id: sessionId })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          toast.success('Payment successful! Your plan is now active 🎉');
        })
        .catch(() => {
          // Fallback: just refetch - webhook may have already updated it
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          toast.success('Subscription activated!');
        });
    } else if (params.get('checkout') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription activated!');
    }
  }, []);

  const { data: subscriptions = [], isLoading, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const list = await api.entities.Subscription.list();
      // Auto-heal: if the user has a Stripe subscription but plan is 'starter',
      // sync the real plan from Stripe in the background.
      const active = list.find(s => s.stripe_subscription_id &&
        (s.plan === 'starter' || !s.plan));
      if (active) {
        api.functions.invoke('syncSubscription')
          .then(result => {
            if (result?.success) queryClient.invalidateQueries({ queryKey: ['subscription'] });
          })
          .catch(() => {});
      }
      return list;
    },
    staleTime: 1000 * 60,
  });

  const { data: history } = useQuery({
    queryKey: ['subscriptionHistory'],
    queryFn: async () => {
      const { data } = await api.functions.invoke('getSubscriptionHistory');
      return data;
    },
    initialData: { subscriptionHistory: [], invoices: [] },
    staleTime: 1000 * 60 * 5,
  });

  const subscription = activeSub(subscriptions);
  const isPro = subscription?.plan === 'pro_monthly' || subscription?.plan === 'pro_yearly';
  const isElite = subscription?.plan === 'elite_monthly' || subscription?.plan === 'elite_yearly';
  const isActive = subscription?.status === 'active';
  const isTrial = subscription?.status === 'trial';
  const isCancelled = subscription?.status === 'cancelled';
  const isPastDue = subscription?.status === 'past_due';
  const isExpired = subscription?.status === 'expired';

  // Grace period: user cancelled but still has access until period end
  const isGracePeriod = isCancelled && subscription?.end_date &&
                        new Date(subscription.end_date) > new Date();

  // Trial days remaining
  const trialDaysRemaining = isTrial && subscription?.trial_end
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (billingPeriod) => {
    if (window.self !== window.top) {
      toast.error('Checkout only works from published apps. Please open this app in a new tab.');
      return;
    }

    setIsUpgrading(true);

    api.analytics.track({
      eventName: 'subscription_upgrade_clicked',
      properties: { plan: billingPeriod }
    });

    await withActionDebug('Subscription Upgrade ' + billingPeriod, async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) {
        api.auth.redirectToLogin(createPageUrl('Subscription'));
        return;
      }

      const user = await api.auth.me();
      const idempotencyKey = 'checkout_' + user.email + '_' + billingPeriod + '_' + Date.now();

      const appOrigin = window.location.origin;
      const response = await api.functions.invoke('createCheckout', {
        billingPeriod,
        userEmail: user ? user.email : null,
        idempotencyKey,
        successUrl: `${appOrigin}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appOrigin}/subscription?checkout=cancelled`,
      });

      const data = response.data;
      const status = response.status;

      if (status !== 200) {
        throw new Error((data && data.error) || ('Server error: ' + status));
      }

      if (!data || !data.url) {
        throw new Error('No checkout URL returned from server');
      }

      window.location.href = data.url;
    }, {
      setLoading: setIsUpgrading,
      onError: (error) => {
        api.analytics.track({
          eventName: 'subscription_checkout_failed',
          properties: { plan: billingPeriod, error: error ? error.message : 'unknown' }
        });
        toast.error((error && error.message) || 'Failed to start checkout. Please try again.');
      }
    })();
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleDowngradeContact = () => {
    toast.info('To downgrade your plan, please contact our support team.', {
      description: 'Email us at team@7percent.info and we\'ll process your request within 24 hours.',
      duration: 8000,
      action: {
        label: 'Email Support',
        onClick: () => window.open('mailto:team@7percent.info?subject=Plan%20Downgrade%20Request', '_blank'),
      },
    });
  };

  const handleConfirmCancel = async () => {
    await withActionDebug('Cancel Subscription', async () => {
      await api.functions.invoke('cancelSubscription');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelModal(false);
      toast.success('Subscription cancelled');
      api.analytics.track({
        eventName: 'subscription_cancelled',
        properties: { plan: subscription ? subscription.plan : null }
      });
    }, {
      setLoading: setCancelling,
      onError: () => toast.error('Failed to cancel subscription')
    })();
  };

  const handleManageBilling = async () => {
    await withActionDebug('Manage Billing Portal', async () => {
      const response = await api.functions.invoke('getPortalUrl');
      const url = response && response.data && response.data.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        throw new Error('No billing portal URL returned');
      }
    }, {
      onError: () => toast.error('Failed to open billing portal')
    })();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Pricing Section */}
      <PricingSection fullPage={true} onUpgrade={handleUpgrade} />

      {/* Current Plan & Management */}
      <div className="p-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.15em]">Subscription</p>
          </div>
          <h1 className="text-3xl font-bold text-white">Manage Your Plan</h1>
        </div>

        {/* Current Plan */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Current Plan</h3>
              <p className="text-zinc-500 text-sm">
                {subscription?.plan === 'starter' && 'Free Starter'}
                {subscription?.plan === 'pro_monthly' && '7% Pro - Monthly'}
                {subscription?.plan === 'pro_yearly' && '7% Pro - Yearly'}
                {subscription?.plan === 'elite_monthly' && '7% Elite - Monthly'}
                {subscription?.plan === 'elite_yearly' && '7% Elite - Yearly'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${
             isActive
               ? 'bg-green-500/10 border border-green-500/30'
               : isTrial
               ? 'bg-blue-500/10 border border-blue-500/30'
               : isGracePeriod
               ? 'bg-amber-500/10 border border-amber-500/30'
               : isPastDue
               ? 'bg-red-500/10 border border-red-500/30'
               : 'bg-zinc-800 border border-zinc-700'
            }`}>
             <span className={`text-sm font-medium ${
               isActive
                 ? 'text-green-400'
                 : isTrial
                 ? 'text-blue-400'
                 : isGracePeriod
                 ? 'text-amber-400'
                 : isPastDue
                 ? 'text-red-400'
                 : 'text-zinc-500'
             }`}>
               {isPastDue
                 ? 'Payment Failed'
                 : isTrial
                 ? `Trial - ${trialDaysRemaining}d left`
                 : isGracePeriod
                 ? `Cancels ${new Date(subscription.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                 : isActive
                 ? 'Active'
                 : subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1)
               }
             </span>
            </div>
          </div>

          {isTrial && isPro && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium text-sm mb-1">Free Trial Active - {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining</p>
                <p className="text-zinc-400 text-xs">No charge yet. Your card will be billed automatically when the trial ends. Cancel anytime before then.</p>
              </div>
            </div>
          )}

          {(isPro || isElite) && (isActive || isGracePeriod || isTrial) && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4">
              <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium text-sm mb-1">
                  {isElite ? 'Elite Features Active' : 'Pro Features Active'}
                </p>
                <ul className="text-zinc-400 text-xs space-y-1">
                  {isElite && <li>• Everything in Pro, plus:</li>}
                  <li>• Global leaderboard access</li>
                  <li>• Weekly competitive challenges</li>
                  <li>• Badge & achievement system</li>
                  {!isElite && <li>• ⚠️ Social &amp; competitive features not included - upgrade to Elite</li>}
                  <li>• Streak multipliers active</li>
                  {isElite && (
                    <>
                      <li>• Elite leaderboard division</li>
                      <li>• Private Elite group chat</li>
                      <li>• Advanced coaching</li>
                      <li>• Elite profile highlight & verified badge</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {isTrial && subscription?.trial_end && (
            <p className="text-blue-400/70 text-sm">
              Trial ends {new Date(subscription.trial_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} - card will be charged automatically
            </p>
          )}
          {!isTrial && subscription?.start_date && (
            <p className="text-zinc-600 text-sm">
              Active since {new Date(subscription.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Actions - Only show for existing subscribers */}
        {(isPro || isElite) && (isActive || isGracePeriod || isTrial) && (
          <div className="space-y-4">
            <button
              onClick={handleManageBilling}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Manage Billing
            </button>

            {/* Downgrade Options */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-white font-semibold mb-4">Change Plan</h3>
              <div className="space-y-3">
                {isElite && (
                  <button
                    onClick={handleDowngradeContact}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors font-medium text-sm"
                  >
                    Downgrade to Pro (Monthly)
                  </button>
                )}
                {isElite && (
                  <button
                    onClick={handleDowngradeContact}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors font-medium text-sm"
                  >
                    Downgrade to Pro (Yearly)
                  </button>
                )}
                {isTrial && (
                  <button
                    onClick={handleCancelClick}
                    className="w-full flex items-center justify-center h-11 rounded-xl border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm"
                  >
                    Cancel Free Trial
                  </button>
                )}
              </div>
            </div>

            {!isTrial && (
              <button
                onClick={handleCancelClick}
                className="w-full flex items-center justify-center h-11 rounded-xl border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

            {/* Info */}
            <div className="mt-8 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-zinc-600 text-xs leading-relaxed">
              {isPastDue
                ? 'Payment failed. Please update your payment method in the billing portal to restore your Pro access.'
                : isTrial
                ? `Your free trial ends in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}. Cancel before then to avoid being charged. No refunds after the trial converts.`
                : (isPro || isElite)
                ? 'Cancelling will disable premium features at the end of your billing period. You can resubscribe anytime.'
                : 'Upgrade to unlock leaderboard access, advanced analytics, and coaching insights.'}
            </p>
            </div>
            </div>
            </div>
            </div>

       <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
        cancelling={cancelling}
      />

      {/* Subscription History */}
      {history?.subscriptionHistory && history.subscriptionHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Plan History</h2>
          <div className="space-y-3">
            {history.subscriptionHistory.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium capitalize">{sub.plan.replace('_', ' ')}</p>
                    <p className="text-zinc-500 text-sm">
                      £{(sub.amount / 100).toFixed(2)}/{sub.interval}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : sub.status === 'past_due'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
                  }`}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs">
                  {new Date(sub.startDate).toLocaleDateString('en-GB')} 
                  {sub.cancelledAt ? ` → ${new Date(sub.cancelledAt).toLocaleDateString('en-GB')}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing History */}
      {history?.invoices && history.invoices.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Billing History</h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900/50">
              {/* Header */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-4 p-4 border-b border-zinc-800 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <div>Invoice</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Action</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-zinc-800">
                {history.invoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 items-center text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-xs sm:hidden">Invoice</span>
                      <span className="text-white font-medium">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-xs sm:hidden">Date</span>
                      <span className="text-white">
                        {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('en-GB') : 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-xs sm:hidden">Amount</span>
                      <span className="text-white font-medium">
                        £{(invoice.amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-xs sm:hidden">Status</span>
                      <span className={`w-fit px-2 py-1 rounded text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex">
                      {invoice.pdfUrl && (
                        <a 
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}