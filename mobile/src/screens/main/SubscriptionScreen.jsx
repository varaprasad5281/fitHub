import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { activeSub, hasProAccess, hasEliteAccess } from '../../lib/subscriptionUtils';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';

const PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: '$9.99/mo',
    description: 'Personalised workouts, meal plans, AI coaching',
    features: ['AI Workout Generation', 'Nutrition Tracking', 'AI Meal Plans', 'AI Coaching', 'Challenges & Leaderboard'],
    color: COLORS.accent,
  },
  {
    id: 'elite_monthly',
    name: 'Elite',
    price: '$19.99/mo',
    description: 'Everything in Pro, plus priority support and advanced analytics',
    features: ['Everything in Pro', 'Advanced Progress Analytics', 'Priority AI Responses', 'Elite Badge & Status', 'Early Access to Features'],
    color: '#a855f7',
  },
];

export default function SubscriptionScreen() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });

  const sub = activeSub(subscriptions);
  const isPro   = hasProAccess(sub);
  const isElite = hasEliteAccess(sub);

  const openBilling = () => {
    // In production, link to your Stripe billing portal or in-app purchase flow
    Linking.openURL('https://your-production-server.com/billing');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.label}>💳 Subscription</Text>
        <Text style={styles.title}>Your Plan</Text>
      </View>

      {/* Current plan */}
      <View style={styles.currentPlanCard}>
        <View style={styles.currentPlanTop}>
          <View>
            <Text style={styles.currentPlanLabel}>Current Plan</Text>
            <Text style={styles.currentPlanName}>
              {isElite ? 'Elite' : isPro ? 'Pro' : 'Free'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            sub?.status === 'active' ? styles.badgeActive : styles.badgeFree,
          ]}>
            <Text style={[styles.statusText, sub?.status === 'active' ? styles.textActive : styles.textFree]}>
              {sub?.status || 'free'}
            </Text>
          </View>
        </View>
        {sub?.end_date && (
          <Text style={styles.renewText}>
            {sub.status === 'cancelled' ? `Access until ${sub.end_date}` : `Renews ${sub.end_date}`}
          </Text>
        )}
        {(isPro || isElite) && (
          <TouchableOpacity onPress={openBilling} style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Manage Billing →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Plan cards */}
      {!isElite && (
        <>
          <Text style={styles.sectionTitle}>
            {isPro ? 'Upgrade to Elite' : 'Choose a Plan'}
          </Text>
          {PLANS.filter(p => !isPro || p.id === 'elite_monthly').map(plan => (
            <View key={plan.id} style={[styles.planCard, { borderColor: plan.color + '40' }]}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                </View>
                {sub?.plan === plan.id && (
                  <View style={[styles.currentBadge, { backgroundColor: plan.color + '20', borderColor: plan.color + '40' }]}>
                    <Text style={[styles.currentBadgeText, { color: plan.color }]}>Current</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planDesc}>{plan.description}</Text>
              <View style={styles.features}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              {sub?.plan !== plan.id && (
                <Button
                  onPress={openBilling}
                  style={[styles.upgradeBtn, { backgroundColor: plan.color }]}
                >
                  {isPro ? 'Upgrade to Elite' : `Get ${plan.name}`}
                </Button>
              )}
            </View>
          ))}
          <Text style={styles.disclaimer}>
            Subscriptions are managed via Stripe. Tap "Manage Billing" to update or cancel.
          </Text>
        </>
      )}

      {isElite && (
        <View style={styles.eliteCard}>
          <Text style={styles.eliteEmoji}>👑</Text>
          <Text style={styles.eliteTitle}>You're on Elite!</Text>
          <Text style={styles.eliteText}>You have access to all features. Thank you for your support.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  currentPlanCard: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, padding: 20, marginBottom: 28,
  },
  currentPlanTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  currentPlanLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  currentPlanName: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  badgeActive: { backgroundColor: COLORS.successBg, borderColor: 'rgba(34,197,94,0.3)' },
  badgeFree: { backgroundColor: COLORS.card, borderColor: COLORS.border },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  textActive: { color: COLORS.success },
  textFree: { color: COLORS.textMuted },
  renewText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  manageBtn: { alignSelf: 'flex-start' },
  manageBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  planCard: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    padding: 20, marginBottom: 16,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  planName: { fontSize: 20, fontWeight: '900' },
  planPrice: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  currentBadgeText: { fontSize: 11, fontWeight: '700' },
  planDesc: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14, lineHeight: 18 },
  features: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  featureCheck: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  featureText: { fontSize: 13, color: COLORS.text, flex: 1 },
  upgradeBtn: { height: 44 },
  disclaimer: { fontSize: 11, color: COLORS.textSubtle, textAlign: 'center', lineHeight: 16 },
  eliteCard: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)', padding: 32, alignItems: 'center',
  },
  eliteEmoji: { fontSize: 40, marginBottom: 12 },
  eliteTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  eliteText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
