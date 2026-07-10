/**
 * Functions router.
 * Replaces base44.functions.invoke('functionName', body)
 *
 * POST /api/functions/:name   → invoke named function
 * GET  /api/functions/:name   → invoke (for read-only functions)
 *
 * The Stripe webhook is registered separately in index.js with raw body parsing.
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const { hasProAccess } = require('../utils/subscriptionAccess');

const router = express.Router();

// Wraps a handler so it 403s unless the caller has an active Pro/Elite subscription.
// Use for regeneration/on-demand endpoints; NOT for the one-time free onboarding calls.
const requirePro = (handler) => async (req, res) => {
  const subscription = await Subscription.findOne({ created_by: req.user.email });
  if (!hasProAccess(subscription)) {
    return res.status(403).json({ error: 'This feature requires an active Pro or Elite subscription' });
  }
  return handler(req, res);
};

// ── Function handlers ─────────────────────────────────────────────────────────
const handlers = {
  // Points & progression
  getUserPointsAndLevel:        require('./functions/getUserPointsAndLevel'),
  calculateDailyPoints:         require('./functions/calculateDailyPoints'),
  calculateDailyPointsQueued:   require('./functions/calculateDailyPoints'),
  validateWorkoutCompletion:    require('./functions/validateWorkoutCompletion'),
  awardWorkoutPoints:           require('./functions/validateWorkoutCompletion'),

  // Workout generation
  // NOTE: generatePersonalizedWorkout is shared by two very different call sites -
  // Onboarding.jsx's one-time free initial plan (generateWorkoutFromProfile /
  // generateInitialWorkout) and the paid regenerate-a-plan actions on
  // Workouts.jsx / WorkoutBuilder.jsx (generatePersonalizedWorkout /
  // generateWorkoutRateLimited). Only the latter two require an active subscription.
  generatePersonalizedWorkout:  requirePro(require('./functions/generatePersonalizedWorkout')),
  generateWorkoutFromProfile:   require('./functions/generatePersonalizedWorkout'),
  generateWorkoutRateLimited:   requirePro(require('./functions/generatePersonalizedWorkout')),
  generateInitialWorkout:       require('./functions/generatePersonalizedWorkout'),
  generateWeeklyWorkout:        requirePro(require('./functions/generateWeeklyWorkout')),

  // Coaching
  generateDailyCoaching:        require('./functions/generateDailyCoaching'),
  generateWeeklyCoaching:       require('./functions/generateDailyCoaching'),
  resolveCoachingReview:        require('./functions/resolveCoachingReview'),

  // Leaderboard
  getLeaderboard:               require('./functions/getLeaderboard'),
  getLeaderboardCached:         require('./functions/getLeaderboard'),
  getLeaderboardCachedSecure:   require('./functions/getLeaderboard'),
  getLeaderboardWithPoints:     require('./functions/getLeaderboard'),

  // Stripe / subscriptions
  createCheckout:               require('./functions/createCheckout'),
  verifyCheckoutSession:        require('./functions/verifyCheckoutSession'),
  syncSubscription:             require('./functions/syncSubscription'),
  cancelSubscription:           require('./functions/cancelSubscription'),

  // Social
  getFriendsList:               require('./functions/getFriendsList'),
  getFriendsActivity:           require('./functions/getFriendsList'),
  chatMessage:                  require('./functions/chatMessage'),
  initializeChat:               require('./functions/chatMessage'),
  getConversations:             require('./functions/chatMessage'),

  // AI / integrations
  invokeLLM:                    require('./functions/invokeLLM'),
  sendEmail:                    require('./functions/sendEmail'),
  generateImage:                require('./functions/generateImage'),
  generateRecipeSuggestions:    require('./functions/generateRecipeSuggestions'),
  // generateMealPlan is Onboarding.jsx's one-time free initial plan; mealPlan is
  // Nutrition.jsx's on-demand regeneration, which requires an active subscription.
  generateMealPlan:             require('./functions/generateMealPlan'),
  mealPlan:                     requirePro(require('./functions/generateMealPlan')),

  // Badges
  getBadges:                    require('./functions/getBadges'),
  getBadgeProgress:             (req, res) => { req.body.action = 'progress'; return require('./functions/getBadges')(req, res); },
  awardFounderBadge:            require('./functions/awardFounderBadge'),

  // Challenges
  getChallenges:                require('./functions/manageChallenges').getChallenges,
  createChallenge:              require('./functions/manageChallenges').createChallenge,
  joinChallenge:                require('./functions/manageChallenges').joinChallenge,
  leaveChallenge:               require('./functions/manageChallenges').leaveChallenge,
  generateDailyChallenge:       require('./functions/manageChallenges').generateDailyChallenge,
  generateInitialChallenge:     require('./functions/manageChallenges').generateInitialChallenge,

  // Friends & social
  friendRequest:                require('./functions/manageFriendship').friendRequest,
  manageFriendRequest:          require('./functions/manageFriendship').manageFriendRequest,
  searchUsers:                  require('./functions/manageFriendship').searchUsers,
  suggestedFriends:             require('./functions/manageFriendship').suggestedFriends,
  getFriendComparison:          require('./functions/manageFriendship').getFriendComparison,

  // Subscription
  getSubscriptionHistory:       require('./functions/getSubscriptionHistory').getSubscriptionHistory,
  getPortalUrl:                 require('./functions/getSubscriptionHistory').getPortalUrl,

  // Nutrition history
  updateNutritionHistory:       require('./functions/updateNutritionHistory'),

  // Workout completion (one per day, keep last 7)
  completeWorkout:              require('./functions/completeWorkout'),

  // Streak tracking
  updateStreak:                 require('./functions/updateStreak'),

  // Goal progress
  updateGoalProgress:           require('./functions/updateGoalProgress').updateGoalProgress,
  verifyGoalCompletion:         require('./functions/updateGoalProgress').verifyGoalCompletion,
  generateGoalRecommendations:  require('./functions/updateGoalProgress').generateGoalRecommendations,

  // Content moderation
  sanitizeChat:                 require('./functions/moderateContent').sanitizeChat,
  moderateProfilePicture:       require('./functions/moderateContent').moderateProfilePicture,

  // Account management
  forgetAccount:                require('./functions/forgetAccount'),

  // Referrals
  getReferralStats:             require('./functions/getReferralStats'),

  // Misc
  smartUpgradePrompt:           require('./functions/miscFunctions').smartUpgradePrompt,
  trackBehaviorMetric:          require('./functions/miscFunctions').trackBehaviorMetric,
  activatePrestige:             require('./functions/miscFunctions').activatePrestige,

  // Auth utilities
  sendPasswordReset:            require('./functions/sendPasswordReset'),
};

// Stripe webhook - raw body, no auth
router.post('/stripeWebhook', require('./functions/stripeWebhook'));

// Public functions - no auth required (user is not logged in for these)
router.post('/sendPasswordReset', require('./functions/sendPasswordReset'));
router.post('/sendEmail', require('./functions/sendEmail'));

// All other functions require auth
router.use(protect);

router.all('/:name', async (req, res) => {
  const { name } = req.params;
  const handler = handlers[name];

  if (!handler) {
    return res.status(404).json({ error: `Function "${name}" not found` });
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error(`[function/${name}]`, err.message, err.stack);
    res.status(500).json({ error: 'Something went wrong on our end. Please try again in a moment.' });
  }
});

module.exports = router;
