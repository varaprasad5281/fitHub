# 7% Badge System - Complete Implementation

## Database Schema

### Badge
Master list of all badge definitions.
- `code` (unique): STREAK_7, TOP_10, MEAL_7, etc.
- `name`, `description`, `category`, `rarity`
- `icon`: Emoji representation
- `points_reward`: Bonus points for earning
- `is_active`: Can this badge be earned

### UserBadge
User's earned badges.
- Links to user via `created_by`
- `badge_code`: FK to Badge.code
- `earned_at`: When badge was earned
- `metadata`: Context (streak_length, rank, etc)
- `is_featured`: Featured on profile (max 3)

### BadgeProgress
Tracks progress toward locked badges (optional).
- `badge_code`: Badge being tracked
- `current_value`: Current progress
- `target_value`: Goal
- `progress_type`: What's being counted

### BadgeAuditLog
Complete history of badge unlocks.
- `user_email`, `badge_code`, `earned_at`
- `trigger_event`: What caused unlock
- `trigger_data`: Context
- `admin_awarded`: Was this manual?

## Badge Categories

- **Streak**: Consecutive day completion (7 badges)
- **Workouts**: Workout count milestones (4 badges)
- **Nutrition**: Meal logging & targets (4 badges)
- **Leaderboard**: Ranking achievements (5 badges) - Pro/Elite only
- **Membership**: Subscription status (3 badges)
- **Identity**: Psychological milestones (4 badges)
- **Seasonal**: Limited time events (1+ badges)

## Total: 31 Seeded Badges

Common (3), Uncommon (5), Rare (8), Elite (10), Legendary (5)

## Backend Functions

### seedBadges.js
Run once to populate Badge table.
```bash
curl -X POST https://app.api.dev/api/functions/seedBadges
```

### badgeUnlockEngine.js
Main badge evaluation engine.
Called automatically on:
- `workout_completed` → unlock workout badges
- `day_closed` → unlock streak badges
- `meal_logged` → unlock nutrition badges
- `subscription_updated` → unlock membership badges

```javascript
await api.functions.invoke('badgeUnlockEngine');
```

### getBadges.js
Frontend API for badge data.
```javascript
// All badges
const { data } = await api.functions.invoke('getBadges', { action: 'all' });

// User's earned badges
const { data } = await api.functions.invoke('getBadges', { action: 'me' });

// User's progress toward locked badges
const { data } = await api.functions.invoke('getBadges', { action: 'progress' });
```

## Frontend Components

### pages/Badges.jsx
Dedicated badges page with 3 tabs:
- **Earned**: Badges user has unlocked
- **Locked**: Remaining badges to chase
- **Featured**: User's 3 featured badges (displayed on profile)

### components/badge/BadgeNotificationCenter.jsx
Shows celebratory notification when badge earned.

### components/profile/BadgeManager.jsx
Shows earned badges on profile (updated).

## Integration Checklist

### 1. Setup (Admin)
- [ ] Deploy entities (Badge, UserBadge, BadgeProgress, BadgeAuditLog)
- [ ] Run `seedBadges` function
- [ ] Verify 31 badges in database

### 2. Workout Flow
After `WorkoutCompletion.create()`:
```javascript
await api.functions.invoke('badgeUnlockEngine');
queryClient.invalidateQueries({ queryKey: ['userBadges'] });
```

### 3. Daily Close / Streak
After streak calculation:
```javascript
await api.functions.invoke('badgeUnlockEngine');
```

### 4. Meal Logging
After `MealLog.create()`:
```javascript
await api.functions.invoke('badgeUnlockEngine');
```

### 5. Subscription Change
After `Subscription.update()`:
```javascript
await api.functions.invoke('badgeUnlockEngine');
```

### 6. Show Badge Unlock Notification
```javascript
import { triggerBadgeNotification } from '@/components/badge/BadgeNotificationCenter';

// When badge is earned (from badgeUnlockEngine response)
if (newBadges.length > 0) {
  const badge = await api.entities.Badge.filter({ code: newBadges[0] });
  triggerBadgeNotification(badge[0]);
}
```

### 7. Add to Layout
```javascript
import BadgeNotificationCenter from '@/components/badge/BadgeNotificationCenter';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <BadgeNotificationCenter />
    </>
  );
}
```

## Testing

### Test Streak Badges
1. Create 7 consecutive workout completions
2. Run `badgeUnlockEngine`
3. Verify STREAK_7 in UserBadge
4. Check BadgeAuditLog entry

### Test Workout Badges
1. Create 10 WorkoutCompletion records
2. Run `badgeUnlockEngine`
3. Verify WORKOUT_10 unlocked

### Test Leaderboard Badges
1. User needs Pro subscription
2. Ensure user ranks top 10
3. Run `badgeUnlockEngine`
4. Verify TOP_10 unlocked

### Test Feature Badges
1. User earned 3+ badges
2. Go to /Badges page
3. Click Feature on badge
4. Verify badge shows on profile

## Rarity Distribution

- **Common** (easy, early): Day 1, Meal 1, Workout 1
- **Uncommon** (habit forming): 3-day streak, 7 meal days
- **Rare** (discipline): 14-day streak, Top 50, Calorie precision
- **Elite** (hard): 30+ streak, Pro member, Top 10, Podium
- **Legendary** (ultra-rare): 90-day streak, Champion, The 7%

## Points Rewards

- Common: 10-15 pts
- Uncommon: 25-75 pts
- Rare: 100-150 pts
- Elite: 200-500 pts
- Legendary: 1000-1500 pts

## Anti-Cheat

- All badge unlocks server-side only
- Audit logged with trigger event
- Streak validation required
- Leaderboard rank verified before award
- Admin can award/revoke with reason

## Monitoring

Track in analytics:
```javascript
api.analytics.track({
  eventName: 'badge_unlocked',
  properties: {
    badge_code: 'STREAK_7',
    rarity: 'uncommon',
    points_awarded: 50,
  }
});
```

## Retention Impact

Badges increase retention by:
1. Early wins (Day 1) → builds confidence
2. Habit formation (Week 1) → maintains momentum
3. Identity shift (30 days) → "I'm disciplined"
4. Prestige (leaderboard) → competitive drive
5. Legendary anchors (90+ days) → long-term retention