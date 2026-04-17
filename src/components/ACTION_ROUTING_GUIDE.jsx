# Action-to-Routing Implementation Guide

## Quick Pattern

All user-initiated actions should follow this flow:

```
User clicks button
  ↓
Check pre-conditions (auth, profile, subscription)
  ↓
Conditions failed? → Auto-redirect to required page/login
  ↓
Execute async action (with 10s timeout)
  ↓
Success? → Show toast + redirect to completion page
  ↓
Error? → Show error toast + stay on current page
  ↓
Loading state always clears in finally block
```

---

## Integration Examples

### Pattern 1: Simple Navigation (No Async)
```javascript
// Old way (just routes without checking)
<Link to={createPageUrl('Leaderboard')}>
  View Leaderboard
</Link>

// New way (checks auth, redirects if needed)
import { useActionOrchestrator } from '@/components/hooks/useActionOrchestrator';

const { navigateTo } = useActionOrchestrator();

<button onClick={() => navigateTo('Leaderboard', { requireAuth: true })}>
  View Leaderboard
</button>
```

### Pattern 2: Async Action with Conditions
```javascript
// Old way (can hang, no pre-checks)
const handleUpgrade = async () => {
  setLoading(true);
  try {
    const session = await api.functions.invoke('createCheckout', {});
    window.location.href = session.url;
  } catch (err) {
    toast.error('Upgrade failed');
  } finally {
    setLoading(false);
  }
};

// New way (has timeout, pre-checks, routing)
import { useActionOrchestrator } from '@/components/hooks/useActionOrchestrator';

const { executeAction } = useActionOrchestrator();

const handleUpgrade = async () => {
  await executeAction({
    actionName: 'Upgrade to Pro',
    conditions: { requireAuth: true },
    asyncFn: async () => {
      const session = await api.functions.invoke('createCheckout', {
        plan: 'pro_monthly'
      });
      return session;
    },
    onSuccess: (session) => {
      window.location.href = session.url; // Manual routing for Stripe
    },
    setLoading,
  });
};
```

### Pattern 3: Action with Auto-Routing
```javascript
// Generate workout and auto-navigate to builder
const handleGenerateWorkout = async () => {
  await executeAction({
    actionName: 'Generate Workout',
    conditions: { requireAuth: true, requireProfile: true },
    asyncFn: async () => {
      const result = await api.functions.invoke('generatePersonalizedWorkout');
      return result;
    },
    onSuccess: (workout) => {
      toast.success('Workout generated! Navigate to builder...');
    },
    setLoading,
    redirectTo: 'WorkoutBuilder',
    redirectOn: 'success',
  });
};
```

### Pattern 4: Guarded Button (Prevent Double-Click)
```javascript
import { useGuardedClick } from '@/components/InteractionGuardian';

const handleCompleteWorkout = async (e) => {
  await executeAction({
    actionName: 'Complete Workout',
    conditions: { requireAuth: true },
    asyncFn: async () => {
      await api.entities.WorkoutCompletion.create({
        workout_id: workoutId,
        completed_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      toast.success('Workout completed! Points awarded.');
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
    setLoading,
  });
};

const { handleClick, isProcessing } = useGuardedClick(handleCompleteWorkout, {
  actionName: 'Complete Workout',
});

<button onClick={handleClick} disabled={isProcessing}>
  {isProcessing ? 'Completing...' : 'Mark Complete'}
</button>
```

---

## Page-by-Page Integration List

### Priority 1: Critical User Flows

#### Onboarding.jsx
- [ ] "Continue" button → `executeAction({ asyncFn: createProfile, redirectTo: 'Home' })`
- [ ] "Finish Onboarding" → auto-navigate to Home or Profile

#### QuickLogin.jsx
- [ ] "Log In" button → check email/password, redirect to Profile on success
- [ ] "Sign Up" → redirect to Onboarding

#### Subscription.jsx
- [ ] "Upgrade to Pro" → check auth, open Stripe, redirect on success
- [ ] "Upgrade to Elite" → check auth, open Stripe, redirect on success
- [ ] "Downgrade" → confirm, execute, reload subscription
- [ ] "Cancel Subscription" → confirm, execute, reload
- [ ] "Manage Billing" → open Stripe portal

#### WorkoutBuilder.jsx
- [ ] "Generate Workout" → check auth+profile, execute, show result
- [ ] "Complete Workout" → check auth, execute, toast success + reload points
- [ ] "Save Workout" → check auth, execute, toast success

#### Nutrition.jsx
- [ ] "Generate Meal Plan" → check auth+profile, execute, show meals
- [ ] "Log Meal" → check auth, execute, reload totals
- [ ] "Delete Meal" → confirm, execute, reload
- [ ] "Save Preference" → execute with loading state

### Priority 2: Social & Competition

#### Leaderboard.jsx
- [ ] Navigate to Leaderboard → check auth (redirect to login if not)
- [ ] View friend leaderboard → check auth

#### Socials.jsx
- [ ] "Add Friend" → check auth, execute, show success/already added
- [ ] "Accept Friend Request" → check auth, execute, reload friends
- [ ] "Decline Request" → execute, reload
- [ ] "Remove Friend" → confirm, execute, reload

#### Challenges.jsx
- [ ] "Join Challenge" → check auth, execute, reload challenges
- [ ] "Create Challenge" → check auth+subscription(pro), open form
- [ ] "Leave Challenge" → confirm, execute, reload

### Priority 3: User Management

#### Profile.jsx
- [ ] "Edit Profile" → open modal (no async)
- [ ] "Save Profile Changes" → execute, toast success, reload
- [ ] "Manage Plan" → navigate to Subscription (check auth)
- [ ] "Sign Out" → confirm, call logout, redirect to Home
- [ ] "Change Language" → execute, toast success
- [ ] "Recalculate Points" → execute with loading, reload points

#### Coaching.jsx
- [ ] "View Coaching" → check auth
- [ ] "Mark as Read" → execute silently
- [ ] "Favorite Coaching" → execute silently

### Priority 4: Secondary Features

#### Contact.jsx
- [ ] "Send Message" → validate form, execute, show success, clear form

#### Progress.jsx
- [ ] "Create Goal" → execute, reload goals
- [ ] "Update Goal" → execute, reload
- [ ] "Delete Goal" → confirm, execute, reload

---

## Testing Each Action

### 1. Button Clicks During Load
```javascript
// Test: click button, immediately click again
// Expected: loading state prevents second click
// Verify in audit panel: only one "initiated" event
```

### 2. Condition Failures
```javascript
// Test: log out, try to access auth-required page
// Expected: auto-redirect to login
// Verify in audit panel: "condition_failed" status
```

### 3. Timeout Simulation
```javascript
// Test: throttle network to "Offline", click action
// Expected: error toast after 10s, loading state clears
// Verify in audit panel: "timeout" message
```

### 4. Success Flow
```javascript
// Test: normal action completion
// Expected: success toast, redirect if configured
// Verify in audit panel: "success" status
```

### 5. Error Flow
```javascript
// Test: API returns 500 error
// Expected: error toast with message, stay on page
// Verify in audit panel: "error" status with details
```

---

## Orchestrator API Reference

### executeAction(config)

```javascript
{
  // Required
  actionName: 'Action Name',                     // For logging
  asyncFn: async () => { ... },                  // Function to execute
  
  // Optional
  conditions: {
    requireAuth: false,                          // Check authenticated
    requireProfile: false,                        // Check profile complete
    requireSubscription: false,                   // Check has active sub
  },
  
  onSuccess: (result) => { ... },               // Called on success
  onError: (error) => { ... },                  // Called on error
  setLoading: setState,                          // Loading state setter
  
  // Routing
  redirectOn: 'success',                         // 'success' | 'always' | 'never'
  redirectTo: 'PageName',                        // Page to navigate to
}
```

### navigateTo(page, conditions)

```javascript
// Simple navigation with pre-condition checks
await navigateTo('Leaderboard', {
  requireAuth: true
});
// Auto-redirects to login if not auth
```

### checkConditions(conditions)

```javascript
const result = await checkConditions({
  requireAuth: true,
  requireProfile: true,
});
// Returns: { passed: bool, redirectTo: string, reason: string }
```

---

## State Management Pattern

For actions that need loading state:

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  await executeAction({
    asyncFn,
    setLoading,  // Automatically set to true on start, false on end
  });
};

return (
  <button disabled={loading}>
    {loading ? 'Loading...' : 'Click Me'}
  </button>
);
```

---

## Error Handling Strategy

By default, `executeAction` shows toast errors. Override:

```javascript
await executeAction({
  asyncFn,
  onError: (err) => {
    // Custom error handling
    if (err.message.includes('not found')) {
      toast.error('Item no longer exists');
    } else {
      toast.error('Please try again');
    }
  },
  // Don't show default toast
  showToast: false,
});
```

---

## Debugging Actions

Enable audit mode:
```javascript
localStorage.setItem('7pct_audit', '1');
```

Then:
1. Click button
2. Watch audit panel (bottom-right)
3. See action flow: initiated → executing → success/error
4. Check browser console for [7%Action] logs
5. Check `window.__7pctCompat.interactions` for full history

---

## Common Mistakes

❌ **Don't:** Create action without setLoading
```javascript
// BAD: Button will stay disabled forever if error
await executeAction({ asyncFn }); // Missing setLoading
```

✅ **Do:** Always pass setLoading for UI feedback
```javascript
const [loading, setLoading] = useState(false);
await executeAction({ asyncFn, setLoading });
```

---

❌ **Don't:** Forget conditions for protected actions
```javascript
// BAD: Unauthenticated user can execute if button somehow clickable
<button onClick={handleDelete}>Delete</button>
```

✅ **Do:** Check conditions before action
```javascript
await executeAction({
  conditions: { requireAuth: true },
  asyncFn: handleDelete,
});
```

---

❌ **Don't:** Ignore routing after action
```javascript
// BAD: User generates workout but stays on home
const handleGenerate = async () => {
  await executeAction({ asyncFn: generateWorkout });
  // No routing!
};
```

✅ **Do:** Auto-route after completion
```javascript
await executeAction({
  asyncFn: generateWorkout,
  redirectOn: 'success',
  redirectTo: 'WorkoutBuilder',
});
```

---

## Rollout Plan

### Week 1: Core Actions
- Implement in: Onboarding, QuickLogin, Subscription, WorkoutBuilder, Nutrition

### Week 2: Social & Leaderboard
- Implement in: Leaderboard, Socials, Challenges

### Week 3: Polish & Edge Cases
- Test on older devices
- Handle timeout edge cases
- Optimize routing delays
- Monitor error rates

### Week 4: Full Rollout
- All actions integrated
- Audit mode monitoring for issues
- Performance baseline established