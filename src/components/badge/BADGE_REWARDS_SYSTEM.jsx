# Badge Rewards System Documentation

## Overview

When users earn badges, they receive meaningful rewards that reinforce discipline, increase engagement, and enhance the premium feel of the platform. Rewards are server-side only and fully audited.

---

## Reward Types

### 1. Points Rewards

Direct leaderboard points awarded when badge earned.

| Badge | Points | Rarity |
|-------|--------|--------|
| STREAK_7 | +50 | Uncommon |
| STREAK_14 | +100 | Rare |
| STREAK_30 | +250 | Rare |
| STREAK_90 | +500 | Elite |
| WORKOUT_1 | +25 | Common |
| WORKOUT_10 | +100 | Uncommon |
| WORKOUT_25 | +200 | Rare |
| WORKOUT_50 | +300 | Rare |
| MEAL_1 | +15 | Common |
| MEAL_7 | +50 | Uncommon |
| MEAL_30 | +150 | Rare |
| TOP_50 | +200 | Rare |
| TOP_10 | +400 | Elite |
| PODIUM | +500 | Elite |
| CHAMPION | +1000 | Legendary |

**Implementation**: Direct update to Points.total_points and Points.weekly_points. Logged in PointsAuditLog with action="badge_reward".

### 2. Temporary Boosts (Consumables)

Limited-use rewards that activate on specific events.

#### **Streak Shield** (Consumable)

Protects streak if user misses a day within expiry window.

| Badge | Shields | Expiry |
|-------|---------|--------|
| STREAK_7 | 1x | 30 days |
| STREAK_14 | 1x | 30 days |
| STREAK_30 | 2x | 60 days |
| STREAK_90 | 3x | 90 days |

**Usage**: When user misses day (streak would break):
1. Check if active shield available
2. If yes: consume shield → preserve streak
3. Show toast: "Streak Protected! 🛡️"
4. Log in RewardAuditLog with action="used"

**Prevents abuse**: Shield expires if unused. One use per shield. Cannot be stacked.

#### **2x Points Day** (Consumable)

Next completed day awards double points.

| Badge | Uses | Expiry |
|-------|------|--------|
| WORKOUT_10 | 1x | 7 days |
| WORKOUT_50 | 1x | 7 days |
| MEAL_30 | 1x | 7 days |

**Usage**: When user closes day:
1. Check if 2x points reward available
2. If yes: multiply points earned × 2, consume reward
3. Show toast: "2x Points Day activated! 🎉"
4. Log with action="used"

**Prevents abuse**: Expires after 7 days. One use per reward. Must be explicitly "activated" on a day.

#### **Recovery Boost** (Consumable, Future)

If user returns after inactivity, first day gives +50 bonus points.

| Trigger | Bonus | Expiry |
|---------|-------|--------|
| 7+ days inactive | +50 pts | 30 days |

**Implementation**: Granted when user is inactive 7+ days and returns. Consumed on first day back.

### 3. Cosmetic / Prestige Rewards (Permanent)

Visual enhancements that do NOT affect gameplay.

| Badge | Reward | Effect |
|-------|--------|--------|
| PRO_MEMBER | Profile Glow | Subtle amber glow on profile card |
| ELITE_MEMBER | Premium Glow | Stronger purple glow on profile |
| TOP_10 | Leaderboard Frame | Premium gold frame on leaderboard |
| PODIUM | Leaderboard Frame | Premium gold frame on leaderboard |
| CHAMPION | Legendary Frame | Ultra-premium animated frame |

**Expiry**: Never (permanent).

**Implementation**: Stored in UserReward with expires_at=null. Render logic checks for these rewards when displaying profile/leaderboard.

### 4. Progression Acceleration (Permanent)

Small boosts to progression rates.

| Badge | Reward | Bonus | Duration |
|-------|--------|-------|----------|
| STREAK_30 | Streak Bonus | +1 day (once) | 30 days |
| ELITE_MEMBER | Point Multiplier | +5% multiplier | Permanent |

**Streak Bonus**: Awards 1 extra streak day. Used once, expires after 30 days.

**Point Multiplier**: 5% bonus on all points earned. Stacks multiplicatively with 2x boosts. Permanent.

**Prevents abuse**: 
- Streak bonus is one-time per badge
- Multiplier applies globally, not stackable multiplicatively
- Verified server-side during point calculation

---

## Backend Flow

### Reward Award (On Badge Unlock)

```
badgeUnlockEngine() awards badge
  ↓
calls awardBadgeRewards(badge_code, user_email, badge_rarity)
  ↓
Query Reward table for all rewards matching badge_code
  ↓
For each reward:
  - Check user rarity eligibility
  - If points: award directly to Points entity
  - If temporary: create UserReward with quantity & expiry
  - If cosmetic: create permanent UserReward
  - Log in RewardAuditLog (action="earned")
  ↓
Return awarded rewards list to frontend
```

### Reward Consumption (On Trigger Event)

```
Event triggered (day missed, day completed, etc.)
  ↓
Frontend/Backend checks for available rewards
  ↓
If reward available:
  - Validate expiry
  - Validate quantity remaining
  - Deduct one use
  - Apply reward effect
  - Log in RewardAuditLog (action="used")
  - Show feedback to user
```

---

## Database Schema

### Reward
Master list of badge → reward mappings.

```javascript
{
  badge_code: "STREAK_7",
  reward_type: "streak_shield",
  value: 1,                        // Shield count or multiplier value
  quantity: 1,
  duration_days: 30,               // null if permanent
  description: "Protect next missed day",
  rarity_minimum: "common",        // Eligibility check
  is_active: true
}
```

### UserReward
Active/earned rewards for user.

```javascript
{
  created_by: "user@example.com",
  reward_type: "streak_shield",
  badge_code: "STREAK_7",
  value: 1,
  quantity_remaining: 1,           // Uses left
  quantity_used: 0,
  earned_at: "2026-02-18T...",
  expires_at: "2026-03-20T...",   // null if permanent
  last_used_at: null,
  is_active: true
}
```

### RewardAuditLog
Complete audit trail.

```javascript
{
  user_email: "user@example.com",
  reward_type: "streak_shield",
  badge_code: "STREAK_7",
  action: "earned" | "used" | "expired" | "revoked",
  value: 1,
  quantity_change: 1 | -1,
  triggered_event: "badge_unlocked" | "streak_missed" | "day_closed",
  timestamp: "2026-02-18T..."
}
```

---

## Backend Functions

### `seedRewards.js`
Populates Reward table with all badge → reward mappings.
```bash
api.functions.invoke('seedRewards')  # Admin only
```

### `awardBadgeRewards.js`
Called by badgeUnlockEngine after badge is earned.
```javascript
{
  badge_code: "STREAK_7",
  user_email: "user@example.com",
  badge_rarity: "uncommon"
}
```

Returns awarded rewards list.

### `consumeReward.js`
Deducts one use from a reward when activated.
```javascript
{
  user_reward_id: "...",
  trigger_event: "streak_missed"
}
```

Returns success + remaining uses.

---

## Frontend Integration

### 1. Show Rewards in Badge Unlock Modal

```jsx
<BadgePremiumUnlock
  badge={badge}
  rewards={awardedRewards}  // From awardBadgeRewards() response
  onFeature={handleFeature}
  onClose={handleClose}
/>
```

RewardShowcase component displays:
- Reward icon
- Reward label
- Description
- Value/count if applicable

### 2. Show Active Rewards on Profile

```jsx
<UserRewardsPanel />
```

Displays:
- Active temporary boosts (with expiry)
- Permanent cosmetic/progression rewards
- Remaining uses for consumables

### 3. Activate Boosts During Relevant Actions

**When day is closed**:
```javascript
// Check for available 2x points reward
if (has2xPointsReward) {
  pointsEarned *= 2;
  await consumeReward(user_reward_id, "day_closed");
  toast.success("2x Points Day activated!");
}
```

**When streak would break**:
```javascript
// Check for streak shield
if (hasStreakShield) {
  await consumeReward(shield_id, "streak_missed");
  preserveStreak();
  toast.success("Streak Protected! 🛡️");
}
```

---

## Anti-Exploit Measures

✅ **Server-Authoritative**: All rewards awarded and consumed server-side only.

✅ **Audit Logging**: Every reward action logged with timestamp, user, and trigger event.

✅ **Expiry Validation**: Expired rewards automatically marked inactive, cannot be consumed.

✅ **Quantity Tracking**: Consumables tracked with remaining_uses, cannot go below 0.

✅ **Eligibility Checks**: Rarity filtering ensures users only get rewards they qualify for.

✅ **Prevent Stacking**: 
- Multiple 2x boosts cannot stack (one active at a time)
- Point multiplier applies multiplicatively, not additively

✅ **One-Time Limits**: Streak bonus, specific boosts limited to one use.

✅ **Rate Limiting**: Badge unlock engine called only on specific events, not spammable.

---

## Testing Checklist

- [ ] User earns STREAK_7 → receives +50 points + 1 streak shield
- [ ] Points added to PointsAuditLog with action="badge_reward"
- [ ] Shield stored in UserReward with 30-day expiry
- [ ] RewardAuditLog shows earned, used, expired entries
- [ ] User misses day with active shield → shield consumed, streak preserved
- [ ] User closes day with 2x points reward → points doubled, reward consumed
- [ ] Expired rewards cannot be used (validation passes)
- [ ] Multiple boosts cannot stack (logic prevents)
- [ ] Mobile: UserRewardsPanel displays correctly
- [ ] Cosmetic rewards render on profile (Premium Glow, etc.)

---

## Files

- `entities/Reward.json` — Reward definitions
- `entities/UserReward.json` — Active user rewards
- `entities/RewardAuditLog.json` — Audit trail
- `functions/seedRewards.js` — Populate rewards
- `functions/awardBadgeRewards.js` — Grant rewards on badge unlock
- `functions/consumeReward.js` — Consume rewards
- `components/badge/RewardShowcase.jsx` — Unlock modal rewards display
- `components/badge/UserRewardsPanel.jsx` — Profile rewards panel