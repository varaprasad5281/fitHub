# Implementation Checklist

## Phase 1: Backend Infrastructure ✅

- [x] Create UserLevel entity (XP, levels, prestige)
- [x] Create Challenge entity (weekly/monthly definitions)
- [x] Create UserChallengeProgress entity (track progress)
- [x] Create ChallengeReward entity (reward definitions)
- [x] Create SubscriptionPerk entity (Pro/Elite perks)
- [x] Implement grantXP function (25 lines per activity)
- [x] Implement activatePrestige function (rare, one-time)
- [x] Implement seedChallenges function (populate table)
- [x] Implement checkChallengeCompletion function (track + award)
- [x] Implement applySubscriptionPerks function (activate/deactivate)

## Phase 2: Frontend UI ✅

- [x] Build LevelProgressBar component (XP display)
- [x] Build ChallengeTracker component (weekly/monthly view)
- [x] Build PerksPanel component (show active perks)
- [x] Build PrestigeDisplay component (status + button)
- [x] Build ProgressionDashboard component (unified hub)

## Phase 3: Integration (TODO - Requires existing code)

- [ ] Add ProgressionDashboard to Home/Dashboard
- [ ] Hook grantXP on day close
- [ ] Hook grantXP on workout complete
- [ ] Hook grantXP on meal logged
- [ ] Hook checkChallengeCompletion after day close
- [ ] Hook applySubscriptionPerks on login
- [ ] Update Leaderboard to apply Pro/Elite perks
- [ ] Integrate Prestige glow into profile rendering

## Phase 4: Streak Protection (Existing + New)

- [x] Streak shields stored in UserReward (already exists)
- [ ] Hook shield check when streak would break
- [ ] Show "Streak Protected" toast on activation
- [ ] Log usage in RewardAuditLog

## Phase 5: Data & Testing

- [ ] Run seedChallenges() function
- [ ] Create test user account
- [ ] Verify XP granted for activities
- [ ] Verify level up at thresholds
- [ ] Verify challenge progress tracking
- [ ] Verify prestige eligibility at level 30
- [ ] Verify perks multiplier applied
- [ ] Verify shield usage on missed day
- [ ] Check audit logs for all actions

## Server Setup

To activate the system:

```bash
# 1. Seed challenges (admin only)
await api.functions.invoke('seedChallenges');

# 2. Seed subscription perks
await api.entities.SubscriptionPerk.bulkCreate([
  { subscription_tier: 'pro', perk_type: 'leaderboard_access', value: 1, ... },
  { subscription_tier: 'pro', perk_type: 'points_multiplier', value: 5, ... },
  { subscription_tier: 'elite', perk_type: 'points_multiplier', value: 10, ... },
  // ... more perks
]);

# 3. Hook into existing functions
// In day_close: await grantXP('day_closed')
// In workout_complete: await grantXP('workout_completed')
// etc.
```

## Integration Points

### Day Close
```javascript
// In your day close logic:
await api.functions.invoke('grantXP', {
  user_email: user.email,
  xp_source: 'day_closed',
  source_value: 50
});

await api.functions.invoke('checkChallengeCompletion', {});
```

### Workout Complete
```javascript
await api.functions.invoke('grantXP', {
  user_email: user.email,
  xp_source: 'workout_completed',
  source_value: 25
});

await api.functions.invoke('checkChallengeCompletion', {});
```

### Meal Logged
```javascript
await api.functions.invoke('grantXP', {
  user_email: user.email,
  xp_source: 'meal_logged',
  source_value: 10
});

await api.functions.invoke('checkChallengeCompletion', {});
```

### Badge Earned
```javascript
// In awardBadgeRewards or badgeUnlockEngine:
await api.functions.invoke('grantXP', {
  user_email: user.email,
  xp_source: 'badge_earned',
  source_value: 100
});
```

### Streak Missed
```javascript
// In streak break logic:
const shield = await checkActiveShield(user.email);
if (shield) {
  await consumeReward(shield.id, 'streak_missed');
  preserveStreak();
  toast.success("Streak Protected!");
} else {
  breakStreak();
}
```

## Perks Application

### Points Calculation
```javascript
let pointsAwarded = basePoints;

const subscription = await getActiveSubscription(user.email);
if (subscription?.plan?.includes('elite')) {
  pointsAwarded *= 1.10;  // 10% elite bonus
} else if (subscription?.plan?.includes('pro')) {
  pointsAwarded *= 1.05;  // 5% pro bonus
}

// Apply to PointsAuditLog
await logPoints(user.email, pointsAwarded);
```

### Leaderboard Ranking
```javascript
// When ranking users in leaderboard:
let userScore = calculateBaseScore(user);

const subscription = await getActiveSubscription(user.email);
if (subscription?.plan?.includes('elite')) {
  // Elite users get priority in tie-breaks
  userScore += 0.001; // Tiny bonus for consistent ranking
}

return sortByScore(users);
```

## Deliverables Summary

✅ **Entities:** 5 new entities (UserLevel, Challenge, UserChallengeProgress, ChallengeReward, SubscriptionPerk)

✅ **Backend:** 5 functions (grantXP, activatePrestige, seedChallenges, checkChallengeCompletion, applySubscriptionPerks)

✅ **Frontend:** 5 components + ProgressionDashboard (LevelProgressBar, ChallengeTracker, PerksPanel, PrestigeDisplay, UserRewardsPanel)

✅ **Anti-Exploit:** Server-side validation, audit logging, multiplier caps, rate limiting, expiry checks

✅ **Documentation:** Complete guide + implementation checklist

✅ **Integration:** Ready for hook into existing day_close, workout, meal, badge systems

## Next Steps

1. Copy integration code into existing functions
2. Run seedChallenges() in admin panel
3. Create SubscriptionPerk seed data
4. Add ProgressionDashboard to home/dashboard
5. Test with sample user account
6. Monitor audit logs for exploits