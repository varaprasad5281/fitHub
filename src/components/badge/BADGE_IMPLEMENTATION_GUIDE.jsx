# Badge System Implementation Guide

## Overview

60+ badges across 7 categories, auto-unlock on conditions met, full tier system with animations.

## Component Files

1. **badgeDefinitions.js** - All 60+ badge metadata
2. **BadgeCard.jsx** - Single badge display with tooltip
3. **BadgeShowcase.jsx** - Grid view (grouped by tier/category)
4. **BadgeProgress.jsx** - Shows next locked badge + progress
5. **checkAndUnlockBadges.js** - Backend function to check/unlock

## Integration Steps

### Step 1: Update Profile to Show Badges
```javascript
// pages/Profile.jsx - Replace BadgeManager import
import BadgeShowcase from '@/components/badge/BadgeShowcase';
import BadgeProgress from '@/components/badge/BadgeProgress';

// In render, replace BadgeManager with:
<BadgeShowcase badges={earnedBadges} groupBy="tier" maxDisplay={12} />
<BadgeProgress lockedBadges={lockedBadges} progress={badgeProgress} />
```

### Step 2: Fetch Badges in Profile
```javascript
// Add to useQuery hooks in Profile.jsx
const { data: badges = [] } = useQuery({
  queryKey: ['badges'],
  queryFn: () => api.entities.Badge.filter({ created_by: user?.email }),
  enabled: !!user,
  staleTime: 1000 * 60 * 5,
});
```

### Step 3: Call Check Function After Actions
```javascript
// After completing workout
const handleCompleteWorkout = async (workoutId) => {
  await api.entities.WorkoutCompletion.create({...});
  
  // Check for new badges
  await api.functions.invoke('checkAndUnlockBadges');
  
  // Reload badges
  queryClient.invalidateQueries({ queryKey: ['badges'] });
};
```

### Step 4: Show Badge Unlock Notification
```javascript
// When a new badge is earned, show popup
const handleBadgeUnlock = (badgeId) => {
  const badge = getBadgeById(badgeId);
  toast.success(`🎉 Badge Unlocked: ${badge.name}`, {
    description: badge.description,
    duration: 5000,
  });
};
```

## Badge Categories

- **Discipline** (10 badges): Streak-based rewards
- **Effort** (9 badges): Activity volume (workouts, meals)
- **Leaderboard** (9 badges): Competition rankings
- **Longevity** (6 badges): Long-term commitment
- **Status** (5 badges): Subscription tiers
- **Identity** (6 badges): Psychological milestones
- **Seasonal** (5 badges): Limited time events

## Tier System

- **Common** (grey): Easy, starter rewards
- **Uncommon** (blue): Forming habits
- **Rare** (purple): Strong discipline
- **Elite** (gold): High achievement
- **Legendary** (special): Ultra-rare, animated glow

## Points System

Each badge awards bonus points:
- Common: 10-25pts
- Uncommon: 50-75pts
- Rare: 100-200pts
- Elite: 250-500pts
- Legendary: 800-3000pts

## Mobile-Friendly Display

- Badges render as emoji in circles
- Responsive grid (4-6 cols on desktop, 3-4 on mobile)
- Tooltips show name + description
- Touch-friendly sizes (48px min)

## Advanced: Show Locked Badges

```javascript
import { getAllBadges } from '@/components/badge/badgeDefinitions';

const allBadges = getAllBadges();
const lockedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.badge_id));

// Show progress toward next tier
<BadgeProgress lockedBadges={lockedBadges} progress={calculatedProgress} />
```

## Conditions Checking

Each badge has a condition function in `checkAndUnlockBadges.js`:

```javascript
// Streak badge
streak_7: async (base44, user) => {
  const streaks = await api.entities.Streak.filter({ created_by: user.email });
  return streaks.some(s => s.current_streak >= 7);
},

// Workout badge
hundred_workouts: async (base44, user) => {
  const completions = await api.entities.WorkoutCompletion.filter({ created_by: user.email });
  return completions.length >= 100;
},
```

## Leaderboard Integration

Show badges on leaderboard profiles:

```javascript
// In PublicProfile or leaderboard card
<div className="flex gap-1 flex-wrap">
  {userBadges.slice(0, 3).map(badge => (
    <BadgeCard key={badge.badge_id} badge={badge} size="sm" />
  ))}
  {userBadges.length > 3 && (
    <span className="text-xs text-zinc-500">+{userBadges.length - 3}</span>
  )}
</div>
```

## Retention Strategy

1. **Early wins** (day 1, first workout): Build confidence
2. **Habit formation** (week 1, week 2): Maintain momentum
3. **Identity shift** (month 1, 30-day streak): "I'm disciplined"
4. **Prestige** (leaderboard, elite): Competitive drive
5. **Legendary anchors** (90+ days, top 1): Long-term retention

## Testing Checklist

- [ ] Badges unlock correctly after conditions met
- [ ] Notifications show on unlock
- [ ] Profiles display badges grouped by tier
- [ ] Locked badges show progress toward unlock
- [ ] Tier colors display correctly
- [ ] Legendary badges have glow animation
- [ ] Mobile display responsive
- [ ] Tooltips work on hover/touch
- [ ] Points awarded correctly
- [ ] Leaderboard shows user badges

## Monitoring

Track badge unlock rates in analytics:

```javascript
api.analytics.track({
  eventName: 'badge_unlocked',
  properties: {
    badge_id: 'streak_7',
    tier: 'uncommon',
    points_awarded: 50,
  }
});
``