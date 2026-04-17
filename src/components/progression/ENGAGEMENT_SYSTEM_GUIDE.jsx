# 7% Engagement, Progression & Retention System
## Adult-Focused Performance Platform

## Overview

Complete engagement engine integrating streaks, badges, rewards, progress tracking, challenges, perks, and prestige into a professional discipline-based system. Designed for serious athletes and self-improvement focused adults — not gamification.

---

## 1. Streak Protection Economy

### Shield System

**Streak Shield** (consumable reward)

- Protects one missed day within window
- Earned via badges (STREAK_7, STREAK_14, STREAK_30, STREAK_90)
- Stored in UserReward with expiry
- Cannot stack (1 active at a time)
- Expires if unused

**When user misses a day:**

```
Check active shield
  ↓
If available:
  - Consume 1 use
  - Preserve streak
  - Show: "Streak Protected 🛡️"
  - Log: RewardAuditLog (action="used")
```

**Anti-exploit:**
- Server-validates expiry
- Quantity tracked in UserReward
- One-time use per shield
- Rate-limited by badge unlock events

---

## 2. Elite Perks System

### Pro Tier Perks

✅ Leaderboard access
✅ Badge frame display on leaderboard
✅ +5% weekly point multiplier

### Elite Tier Perks

✅ All Pro perks +
✅ Profile prestige glow (✨)
✅ Exclusive Elite badge frame (👑)
✅ Advanced stats (consistency score, trends)
✅ +10% weekly point multiplier (capped)
✅ Priority in tie-break leaderboard ranking

**Activation:**

```
User subscribes to Pro/Elite
  ↓
applySubscriptionPerks() called
  ↓
Perks activated based on subscription.plan
  ↓
Multipliers applied server-side during:
  - Point calculation
  - XP grant
  - Leaderboard ranking
```

**Implementation:**

```javascript
// During point award
let pointsAwarded = basePoints;

if (subscription.plan.includes('elite')) {
  pointsAwarded *= 1.10; // 10% elite bonus
} else if (subscription.plan.includes('pro')) {
  pointsAwarded *= 1.05; // 5% pro bonus
}
```

---

## 3. Seasonal/Challenge Reward System

### Challenge Structure

**Weekly Challenges**
- Run Monday → Sunday
- 3-5 objectives
- Examples: "Warrior Week" (5 workouts), "Nutrition Master" (log meals 5 days)
- Rewards: +200 points, 1x shield, 100 XP
- Difficulty: Medium

**Monthly Challenges**
- Run full calendar month
- 3-5 harder objectives
- Examples: "Discipline Month" (30-day streak, 24 workouts)
- Rewards: +500 points, 2x shields, 300 XP
- Difficulty: Hard

**Seasonal Challenges** (Future)
- 90-day sprints
- Elite-exclusive events
- Major rewards

### Challenge Mechanics

**Tracking:**
- UserChallengeProgress created on first activity
- Progress updated on: workout, meal, day close
- Metrics:
  - workouts_completed
  - meals_logged
  - streak_maintained
  - calorie_accuracy (simplified)
  - points_earned

**Completion:**
```
checkChallengeCompletion() called on activity
  ↓
For each challenge:
  - Update progress values
  - Check if all objectives ≥ target
  ↓
If completed:
  - Award points + XP + boosts
  - Create badge
  - Mark rewards_claimed
  - Log in RewardAuditLog
```

**Rewards:**
```javascript
{
  challenge_id: "...",
  reward_type: "points" | "xp" | "streak_shield" | "double_points",
  value: 200 | 300 | 1 | 2
}
```

---

## 4. Prestige System (Endgame Retention)

### When Triggered

User becomes eligible when:

1. **High Level** (Level 30+)
2. **Elite Badges** (Multiple elite/legendary badges earned)
3. **90+ Streak** (Maintain 90-day consecutive streak)

### Prestige Effect

**What happens:**
```
User clicks "Activate Prestige"
  ↓
activatePrestige() called
  ↓
- Prestige Level set to 1
- Visible level reset to ~50% (strategy: feel like progress, not a loss)
- Award 500 points + 2000 XP
- Unlock prestige cosmetic glow (✨)
- Create prestige badge entry
- Log prestige activation
  ↓
Result: New identity, rare status, new milestones
```

**Reward:**
- +500 points
- Prestige glow on profile (permanent)
- Special prestige badge
- +2% discipline score (permanent multiplier)
- Can only prestige once per account (makes it exclusive)

**Prestige Display:**
```jsx
<PrestigeDisplay />
  - Shows "Prestige 1" if prestiged
  - Shows lock + eligibility hints if not
  - Button to activate if eligible
```

---

## 5. Progress Score & Level System

Renamed from XP to Progress Score to reflect discipline progression rather than game mechanics.

### Progress Score Curve (Scaling Difficulty)

```javascript
Level 1-10:   100-516 XP per level   (fast)
Level 10-25:  550-1700 XP per level  (moderate)
Level 25-50:  1850-15000 XP per level (slow)
```

Example:
- Level 1 → 2: 100 XP
- Level 10 → 11: 550 XP
- Level 25 → 26: 1850 XP
- Level 50 → 51: 15000 XP

### Progress Awards

| Activity | Progress | Multiplier |
|----------|----------|-----------|
| Workout completed | 25 | ✓ Sub bonus |
| Day closed | 50 | ✓ Sub bonus |
| Meal logged | 10 | ✓ Sub bonus |
| Streak maintained | 15 | ✓ Sub bonus |
| Badge earned | 100 | ✗ No multiplier |
| Challenge completed | 200 | ✗ No multiplier |

**Subscription Modifiers (Server-side, Capped):**
- **Pro Tier:** +5% performance modifier (professional benefits)
- **Elite Tier:** +10% performance modifier (capped, prestige only)

### Level Milestones

At certain levels, users unlock:
- Level 10: +100 bonus points
- Level 25: Unlock 2x points boost
- Level 50: Prestige eligible

### Progress Breakdown

Stored in UserLevel.progress_breakdown:
```javascript
{
  workout_completed: 500,
  day_closed: 2000,
  meal_logged: 200,
  badge_earned: 1000,
  challenge_completed: 1200,
  streak_day: 150
}
```

---

## 6. Anti-Exploit Rules

✅ **Server-Authoritative**: All XP/rewards granted server-side only via function calls.

✅ **Audit Logging**: Every action logged in PointsAuditLog or RewardAuditLog with timestamp.

✅ **Multiplier Caps**: 
- Pro: max 5% bonus
- Elite: max 10% bonus
- Cannot stack (multiplicative, not additive)

✅ **Quantity Tracking**: Consumables (shields) tracked with remaining_uses.

✅ **Expiry Validation**: Expired rewards marked inactive, cannot be used.

✅ **Rate Limiting**: Activities rate-limited per day/week to prevent farming.

✅ **Badge Gating**: Challenges require active subscription tier.

✅ **One-Time Limits**: Prestige once per account. Streaks shields not stackable.

---

## 7. Database Schema

### UserLevel
```javascript
{
  created_by: "user@example.com",
  current_level: 25,
  total_xp: 12500,
  xp_in_level: 150,
  xp_needed_for_next: 1850,
  prestige_level: 0,
  prestige_triggers: ["high_level"],
  last_prestige_at: null,
  xp_breakdown: { workout_completed: 500, ... },
  level_unlocks: ["level_10_points", "level_25_boost"]
}
```

### Challenge
```javascript
{
  challenge_type: "weekly",
  name: "Warrior Week",
  description: "...",
  objectives: [
    { metric: "workouts_completed", target: 5, ... },
    { metric: "streak_maintained", target: 7, ... }
  ],
  start_date: "2026-02-23T00:00:00Z",
  end_date: "2026-03-02T23:59:59Z",
  difficulty: "medium",
  min_subscription: "none",
  is_active: true
}
```

### UserChallengeProgress
```javascript
{
  created_by: "user@example.com",
  challenge_id: "...",
  progress: [
    { objective_index: 0, current_value: 3, target_value: 5, completed: false },
    { objective_index: 1, current_value: 7, target_value: 7, completed: true }
  ],
  completed: false,
  rewards_claimed: false,
  joined_at: "2026-02-23T..."
}
```

### SubscriptionPerk
```javascript
{
  subscription_tier: "pro",
  perk_type: "points_multiplier",
  value: 5,  // 5% bonus
  description: "+5% bonus to weekly points",
  is_active: true
}
```

---

## 8. Backend Functions

### `grantXP(user_email, xp_source, source_value)`
Awards progress score, handles leveling, checks prestige eligibility.

Returns:
```javascript
{
  progress_awarded: 25,
  total_progress: 12500,
  level: 25,
  leveled_up: false,
  prestige_eligible: true
}
```

### `activatePrestige()`
Activates prestige for eligible user. One-time.

Returns:
```javascript
{
  prestige_level: 1,
  new_level: 12,
  rewards: [{ type: 'prestige_glow', value: 1 }]
}
```

### `seedChallenges()`
Admin function - populates Challenge table.

### `checkChallengeCompletion()`
Tracks progress, awards on completion.

### `applySubscriptionPerks(user_email)`
Determines active perks based on subscription.

---

## 9. UI Integration

### ProgressionDashboard
Main engagement hub showing:
- LevelProgressBar (XP progress, level, prestige)
- ChallengeTracker (weekly/monthly progress)
- PerksPanel (active subscription perks)
- PrestigeDisplay (status, prestige button)
- UserRewardsPanel (active boosts)

### Integration Points

**Dashboard Home:**
```jsx
<ProgressionDashboard />
```

**Profile Page:**
Add to profile sidebar.

**Day Close:**
After user closes day:
```javascript
await api.functions.invoke('grantXP', {
  user_email,
  xp_source: 'day_closed',
  source_value: 50
});

await api.functions.invoke('checkChallengeCompletion');
```

**Workout Complete:**
```javascript
await api.functions.invoke('grantXP', {
  user_email,
  xp_source: 'workout_completed',
  source_value: 25
});
```

**Badge Earned:**
```javascript
// In badgeUnlockEngine, after badge created:
await api.functions.invoke('grantXP', {
  user_email,
  xp_source: 'badge_earned',
  source_value: 100
});
```

---

## 10. Testing Checklist

- [ ] User gains XP from workouts/meals/day close
- [ ] Level up triggers correctly, XP curve scales
- [ ] Prestige eligibility shows at level 30
- [ ] Prestige activates once, resets level correctly
- [ ] Pro/Elite perks apply multipliers
- [ ] Weekly challenges track and complete
- [ ] Monthly challenges harder than weekly
- [ ] Challenge rewards awarded on completion
- [ ] Streak shield consumed on missed day
- [ ] Streak shield cannot be used after expiry
- [ ] Multiple shields not stackable
- [ ] ProgressionDashboard displays all info
- [ ] Mobile: All components responsive
- [ ] Audit logging: Every action logged

---

## 11. Files

**Entities:**
- `entities/UserLevel.json` — XP, level, prestige
- `entities/Challenge.json` — Challenge definitions
- `entities/UserChallengeProgress.json` — User progress
- `entities/ChallengeReward.json` — Rewards per challenge
- `entities/SubscriptionPerk.json` — Perk definitions

**Functions:**
- `functions/grantXP.js` — Award XP, handle leveling
- `functions/activatePrestige.js` — Prestige mechanics
- `functions/seedChallenges.js` — Populate challenges
- `functions/checkChallengeCompletion.js` — Track progress
- `functions/applySubscriptionPerks.js` — Apply perks

**Components:**
- `components/progression/LevelProgressBar.jsx` — XP bar
- `components/progression/ChallengeTracker.jsx` — Challenges
- `components/progression/PrestigeDisplay.jsx` — Prestige UI
- `components/progression/PerksPanel.jsx` — Perks display
- `components/progression/ProgressionDashboard.jsx` — Hub

---

## Result

**Engagement Loop:**
```
User logs in
  ↓
See XP progress → motivated to level up
  ↓
See weekly challenge → actionable goals
  ↓
Complete activity → gain XP
  ↓
Level up → unlock perks/milestones
  ↓
Reach level 30 → prestige available
  ↓
Prestige → rare identity, new milestones
  ↓
Return to loop with renewed motivation
```

This system is core to retention apps like Duolingo, Fitbit, Strava. Users keep returning for progression milestones, not just activity tracking.