/**
 * UpgradeTriggerManager
 * 
 * Manages psychology-driven upgrade prompts at key moments:
 * - After first workout completion
 * - At 7-day streak milestone
 * - At 10+ days active
 * - When approaching leaderboard eligibility
 * - At goal achievement
 * 
 * Usage:
 * import { getUpgradeTrigger } from '@/components/conversion/UpgradeTriggerManager';
 * 
 * const trigger = getUpgradeTrigger({
 *   streakLength: 7,
 *   daysActive: 10,
 *   workoutsCompleted: 5,
 *   estimatedRank: 47,
 *   hasUpgradedBefore: false,
 * });
 * 
 * if (trigger) {
 *   // Show ProUpsellModalEnhanced with trigger.type and trigger.context
 * }
 */

// Check if user should see upgrade prompt
export function getUpgradeTrigger(userData) {
  const {
    streakLength = 0,
    daysActive = 0,
    workoutsCompleted = 0,
    estimatedRank = null,
    hasUpgradedBefore = false,
    lastUpgradePromptDate = null,
    showedWorkoutCompleteTrigger = false,
  } = userData;

  // Never show more than once per day
  const hoursSinceLastPrompt = lastUpgradePromptDate
    ? (Date.now() - new Date(lastUpgradePromptDate).getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceLastPrompt < 24) {
    return null;
  }

  // Never show if already upgraded
  if (hasUpgradedBefore) {
    return null;
  }

  // Trigger 1: First Workout Completion (most powerful moment)
  if (workoutsCompleted === 1 && !showedWorkoutCompleteTrigger) {
    return {
      type: 'workout_complete',
      priority: 'high',
      message: 'You just joined the 7%. Time to compete.',
      contextData: { workoutsCompleted },
    };
  }

  // Trigger 2: 7-Day Streak Milestone (high commitment signal)
  if (streakLength === 7) {
    return {
      type: 'streak_milestone',
      priority: 'high',
      message: 'Your 7-day streak shows real discipline.',
      contextData: { streak: 7 },
    };
  }

  // Trigger 3: 30-Day Milestone (extreme commitment)
  if (streakLength === 30) {
    return {
      type: 'streak_milestone',
      priority: 'critical',
      message: '30 days straight! You\'re in the elite 1%.',
      contextData: { streak: 30 },
    };
  }

  // Trigger 4: 10+ Days Active (high engagement signal)
  if (daysActive === 10 && workoutsCompleted >= 5) {
    return {
      type: 'engagement',
      priority: 'high',
      message: 'You\'re consistently showing up. Time to compete.',
      contextData: { daysActive },
    };
  }

  // Trigger 5: 20+ Days Active (showing habit formation)
  if (daysActive === 20 && workoutsCompleted >= 12) {
    return {
      type: 'engagement',
      priority: 'medium',
      message: 'You\'re part of the committed few. Upgrade to prove it.',
      contextData: { daysActive },
    };
  }

  // Trigger 6: Leaderboard Eligibility (10+ workouts = can compete)
  if (workoutsCompleted === 10) {
    return {
      type: 'leaderboard',
      priority: 'high',
      message: 'You\'ve completed 10 workouts. You\'re ready to compete.',
      contextData: { workoutsCompleted, estimatedRank },
    };
  }

  // Trigger 7: Close to Top 100 (high status potential)
  if (estimatedRank && estimatedRank <= 150 && workoutsCompleted >= 10) {
    return {
      type: 'leaderboard',
      priority: 'medium',
      message: `You could rank #${estimatedRank}. Upgrade to claim it.`,
      contextData: { estimatedRank, workoutsCompleted },
    };
  }

  // No trigger
  return null;
}

// Get next milestone for engagement
export function getNextMilestone(userData) {
  const {
    streakLength = 0,
    daysActive = 0,
    workoutsCompleted = 0,
  } = userData;

  const milestones = [
    { type: 'first_workout', current: workoutsCompleted >= 1, next: 1, label: 'Complete 1 workout', emoji: '💪' },
    { type: 'seven_day_streak', current: streakLength >= 7, next: 7, label: '7-day streak', emoji: '🔥' },
    { type: 'ten_workouts', current: workoutsCompleted >= 10, next: 10, label: '10 completed workouts', emoji: '🎯' },
    { type: 'ten_days_active', current: daysActive >= 10, next: 10, label: '10 days active', emoji: '⭐' },
    { type: 'thirty_day_streak', current: streakLength >= 30, next: 30, label: '30-day streak', emoji: '👑' },
  ];

  // Find next uncompleted milestone
  return milestones.find(m => !m.current);
}

// Store that trigger was shown (to avoid repeating)
export function recordUpgradeTriggerShown(userData) {
  return {
    ...userData,
    lastUpgradePromptDate: new Date().toISOString(),
    showedWorkoutCompleteTrigger: userData.workoutsCompleted >= 1,
  };
}

// Helper: Calculate estimated leaderboard rank
export function estimateLeaderboardRank(workoutsCompleted, streakLength = 0, pointsEstimate = 0) {
  // Rough estimate based on engagement
  // Adjust these numbers based on actual leaderboard data
  const baseRank = 1000;
  const workoutBonus = Math.min(workoutsCompleted * 20, 300);
  const streakBonus = Math.min(streakLength * 10, 150);
  const pointsBonus = Math.min(pointsEstimate / 10, 200);

  return Math.max(1, Math.round(baseRank - workoutBonus - streakBonus - pointsBonus));
}

// Check if user meets leaderboard eligibility (10+ workouts)
export function isLeaderboardEligible(workoutsCompleted) {
  return workoutsCompleted >= 10;
}

// Check if user shows conversion readiness (multiple signals)
export function isConversionReady(userData) {
  const {
    daysActive = 0,
    workoutsCompleted = 0,
    streakLength = 0,
    lastWorkoutDate = null,
  } = userData;

  // Recent engagement (workout in last 48 hours)
  const hasRecentActivity = lastWorkoutDate
    ? (Date.now() - new Date(lastWorkoutDate).getTime()) < (48 * 60 * 60 * 1000)
    : false;

  // Multiple engagement signals
  const signals = [
    daysActive >= 5,
    workoutsCompleted >= 3,
    streakLength >= 3,
    hasRecentActivity,
  ].filter(Boolean).length;

  // "Ready" if at least 3 signals present
  return signals >= 3;
}

export default {
  getUpgradeTrigger,
  getNextMilestone,
  recordUpgradeTriggerShown,
  estimateLeaderboardRank,
  isLeaderboardEligible,
  isConversionReady,
};