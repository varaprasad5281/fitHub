# Badge Progression System Implementation Guide

## Overview
The badge progression system increases user motivation and retention by:
1. Always showing the next badge closest to unlocking
2. Providing clear progress and actionable CTAs
3. Offering contextual hints during relevant activities
4. Celebrating milestones with premium unlock animations

---

## Backend Architecture

### `getBadgeProgress.js` Function

**Purpose**: Calculates progress toward all locked badges for the current user and identifies the next badge to prioritize.

**Input**: User authentication via request

**Output**:
```javascript
{
  next_badge: {
    code: "STREAK_7",
    badge: "7 Day Streak",
    icon: "🔥",
    current: 5,
    target: 7,
    progress_percent: 71,
    action: "Close today to build streak",
    rarity: "uncommon"
  },
  close_badges: [
    { code: "WORKOUT_10", progress_percent: 65, ... },
    { code: "MEAL_7", progress_percent: 58, ... }
  ],
  all_progress: { /* full progress for all locked badges */ },
  user_data: { is_pro: true, subscription: "pro_monthly" }
}
```

### Progress Calculation Logic

**Priority System** (highest wins as "next badge"):
1. **Streaks** (priority: 1000+) — core habit
2. **Workouts** (priority: 800+) — key activity
3. **Meals** (priority: 600+) — secondary activity
4. **Leaderboard** (priority: 400+) — pro/elite only
5. **Subscription** (priority: 200+) — not primary goal

Within each category: **progress percentage** as tiebreaker.

**Real-time Updates**:
- Call `getBadgeProgress()` after:
  - Workout completion
  - Meal log
  - Day close (streak calculation)
  - Leaderboard update
  - Subscription change

### Data Sources

| Badge Category | Source Data | Current Value | Target |
|---|---|---|---|
| Streak (7, 14, 30, 90) | Streak entity | current_streak | 7, 14, 30, 90 |
| Workout (1, 10, 25, 50) | WorkoutCompletion count | total_workouts | 1, 10, 25, 50 |
| Meals (1, 7, 30) | MealLog count | total_meals | 1, 7, 30 |
| Leaderboard (Top 50, 10, Podium) | WeeklyLeaderboard rank | user_rank | 50, 10, 3 |
| Subscription | Subscription entity | plan | pro/elite |

---

## Frontend Components

### 1. **NextBadgeWidget** (Dashboard/Home)

Shows the single "next badge" user should focus on.

**Props**: None (fetches own progress)

**Features**:
- Auto-refreshes every 5 minutes
- Color changes when >75% complete
- CTA button routes to relevant action
- Shows progress bar + current/target count

**Usage**:
```jsx
import NextBadgeWidget from '@/components/badge/NextBadgeWidget';

// On Home page, Profile, Dashboard
<NextBadgeWidget />
```

### 2. **BadgeProgressHint** (Contextual Pages)

Subtle inline hint on action pages (WorkoutBuilder, Nutrition, Profile).

**Props**:
```javascript
{
  badgeProgress: { badge, current, target, progress_percent },
  context: 'workout' | 'meal' | 'streak' | 'leaderboard'
}
```

**Features**:
- Only shows when <100% complete
- Color highlight when ≥75% complete
- Does not distract from primary action
- Shows contextual message

**Usage**:
```jsx
import BadgeProgressHint from '@/components/badge/BadgeProgressHint';

// On WorkoutBuilder page
const { data: badgeProgress } = useQuery(['badgeProgress'], () =>
  api.functions.invoke('getBadgeProgress')
);

<BadgeProgressHint 
  badgeProgress={badgeProgress?.next_badge} 
  context="workout" 
/>
```

### 3. **BadgeDetailModal** (Locked Badge Details)

Full details modal when user taps a locked badge on Badges page.

**Props**:
```javascript
{
  badge: { name, icon, description, rarity },
  progress: { current, target, action, progress_percent },
  onClose: () => {},
  onAction: () => {}  // Navigate to action
}
```

**Features**:
- Shows full badge details
- Progress bar + requirement
- "Work Toward This Badge" CTA
- Premium styling matching rarity

**Usage**:
```jsx
import BadgeDetailModal from '@/components/badge/BadgeDetailModal';

const [selectedBadge, setSelectedBadge] = useState(null);

<BadgeDetailModal
  badge={selectedBadge}
  progress={badgeProgress?.all_progress[selectedBadge?.code]}
  onClose={() => setSelectedBadge(null)}
  onAction={() => navigate(getActionRoute(selectedBadge))}
/>
```

---

## Integration Checklist

### Home Page
- [ ] Add NextBadgeWidget to dashboard section
- [ ] Place above or beside featured content
- [ ] Refresh when user returns to home

### Workout Page (WorkoutBuilder)
- [ ] Fetch badgeProgress
- [ ] Add BadgeProgressHint above exercise list
- [ ] Show "X/Y workouts for Workout Warrior"

### Nutrition Page
- [ ] Add BadgeProgressHint above meal log
- [ ] Show "X/Y meals logged for Nutrition Expert"

### Profile Page
- [ ] Show NextBadgeWidget in side panel or top card
- [ ] Link to "View All Badges" page

### Badges Page
- [ ] Reorganize locked badges section
- [ ] Add "Closest to Unlock" section at top
- [ ] Make locked badges clickable → BadgeDetailModal
- [ ] Show progress bar on each locked card

### After Actions
- [ ] After workout completion: `await api.functions.invoke('getBadgeProgress')`
- [ ] After meal log: refresh badge progress
- [ ] After streak update: refresh badge progress
- [ ] After leaderboard reset: refresh badge progress
- [ ] On subscription change: refresh badge progress

---

## CTA Routing Logic

Based on badge action, NextBadgeWidget routes to:

```javascript
if (action.includes('workout')) → /WorkoutBuilder
if (action.includes('meal') || 'log') → /Nutrition
if (action.includes('leaderboard')) → /Leaderboard
if (action.includes('upgrade') || 'pro') → /Subscription
if (action.includes('close') || 'streak') → /Profile
```

---

## Example Badge Selection (Next Badge Priority)

**Scenario**: User with multiple close badges

```
STREAK_7: 6/7 days (86%) → Priority: 1000 + 86 = 1086 ✅ SELECTED
WORKOUT_10: 8/10 (80%) → Priority: 800 + 80 = 880
MEAL_7: 6/7 (86%) → Priority: 600 + 86 = 686
```

**Result**: System picks STREAK_7 (highest priority).

**If streaks are equal**:
```
STREAK_7: 6/7 days (86%) → Priority: 1086 ✅ SELECTED
STREAK_14: 6/7 days (86%) → Priority: 1000 + 86 = 1086 (tied, but easier)
```

System picks STREAK_7 (lower target).

---

## Real-time Updates

Add to relevant completion functions:

```javascript
// After workout completion
await api.functions.invoke('badgeUnlockEngine');
queryClient.invalidateQueries({ queryKey: ['badgeProgress'] });

// After meal logged
queryClient.invalidateQueries({ queryKey: ['badgeProgress'] });

// After day closed
await api.functions.invoke('badgeUnlockEngine');
queryClient.invalidateQueries({ queryKey: ['badgeProgress'] });
```

---

## Performance Notes

- **Caching**: Badge progress cached for 5 minutes (staleTime)
- **Refetch**: On window focus + explicit invalidation
- **Data fetching**: Parallel queries for badges, user data, metrics
- **UI updates**: Minimal re-renders with motion animations

---

## Testing Checklist

- [ ] Create user with 6/7 streak → NextBadge shows "STREAK_7"
- [ ] Create 8/10 workouts + 6/7 streak → STREAK_7 prioritized
- [ ] Click locked badge → BadgeDetailModal shows correctly
- [ ] "Work Toward Badge" routes to correct page
- [ ] BadgeProgressHint shows on workout page
- [ ] Progress updates after completing action
- [ ] Mobile responsive (hint doesn't clutter)

---

## Files Changed

- **New**: `functions/getBadgeProgress.js`
- **New**: `components/badge/NextBadgeWidget.jsx`
- **New**: `components/badge/BadgeProgressHint.jsx`
- **New**: `components/badge/BadgeDetailModal.jsx`
- **Updated**: `pages/Badges.jsx` (locked badge details)
- **Updated**: `pages/Home.jsx` (add NextBadgeWidget)
- **Updated**: `pages/WorkoutBuilder.jsx` (add hint)
- **Updated**: `pages/Nutrition.jsx` (add hint)
- **Updated**: `pages/Profile.jsx` (add widget)