# Implementing Async Wrapper in Existing Pages

## Quick Integration Guide

### Step 1: Import the wrapper
```javascript
import { wrapAsyncAction, createMutationWrapper } from '@/components/utils/asyncActionWrapper';
```

### Step 2: Wrap async operations

#### Option A: In useEffect (API calls)
```javascript
useEffect(() => {
  let isMounted = true;

  wrapAsyncAction('Fetch Workouts', async () => {
    const data = await api.entities.Workout.list();
    if (isMounted) setWorkouts(data);
  }, {
    setLoading,
    onError: (err) => console.error('Failed to load workouts:', err)
  }).catch(() => {}); // Suppress throw since we handle in onError

  return () => { isMounted = false; };
}, []);
```

#### Option B: In React Query (useMutation)
```javascript
const generateMutation = useMutation({
  mutationFn: (data) => wrapAsyncAction(
    'Generate Workout',
    () => api.functions.invoke('generatePersonalizedWorkout', data),
    { setLoading: setIsGenerating }
  ),
  onSuccess: (workout) => {
    setWorkout(workout);
    toast.success('Workout generated!');
  },
});
```

#### Option C: In button click handlers
```javascript
const handleSubscribe = async () => {
  try {
    await wrapAsyncAction(
      'Subscribe',
      async () => {
        const session = await api.functions.invoke('createCheckout', { plan: 'pro' });
        window.location.href = session.url;
      },
      { 
        setLoading,
        showToast: true
      }
    );
  } catch (err) {
    // Already handled by wrapper, but can do custom logic here
  }
};
```

#### Option D: Using createMutationWrapper (cleaner)
```javascript
const completeMutation = useMutation({
  mutationFn: createMutationWrapper(
    (workoutId) => api.entities.WorkoutCompletion.create({ workout_id: workoutId }),
    { actionName: 'Complete Workout' }
  ),
});
```

## Files to Update (Priority Order)

### Phase 1: Authentication (Critical)
- [ ] `pages/Onboarding.jsx` - Wrap profile creation
- [ ] `pages/QuickLogin.jsx` - Wrap login call
- [ ] `components/auth/DeleteAccountModal.jsx` - Wrap account deletion

### Phase 2: Core Features
- [ ] `pages/WorkoutBuilder.jsx` - Wrap generateWorkout, completeWorkout
- [ ] `pages/Nutrition.jsx` - Wrap generateMealPlan, logMeal
- [ ] `pages/Challenges.jsx` - Wrap challenge creation/join
- [ ] `pages/Subscription.jsx` - Wrap checkout, cancellation

### Phase 3: Social/Engagement
- [ ] `pages/Leaderboard.jsx` - Wrap getLeaderboard
- [ ] `pages/Socials.jsx` - Wrap friend requests, activity
- [ ] `pages/Coaching.jsx` - Wrap coaching fetches

### Phase 4: Secondary Features
- [ ] `pages/Profile.jsx` - Profile updates
- [ ] `components/profile/ProfileEdit.jsx` - Image upload
- [ ] `pages/Progress.jsx` - Goal updates

## Template for Pages

```javascript
import { wrapAsyncAction } from '@/components/utils/asyncActionWrapper';
import { useQueryClient } from '@tanstack/react-query';

export default function FeaturePage() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAction = async () => {
    try {
      await wrapAsyncAction(
        'Action Name',
        async () => {
          // Your async code here
          const result = await api.functions.invoke('someFunction', {});
          
          // Invalidate cache if needed
          queryClient.invalidateQueries({ queryKey: ['someData'] });
          
          return result;
        },
        { 
          setLoading,
          actionName: 'Doing something', // for debug logs
          showToast: true
        }
      );
    } catch (err) {
      // Error already shown as toast
      console.error('Action failed:', err);
    }
  };

  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? 'Loading...' : 'Do Action'}
    </button>
  );
}
```

## Testing Your Changes

### 1. Enable Debug Mode
```javascript
localStorage.setItem('7pct_debug', '1');
// Reload page
```

### 2. Check Console
Should see:
```
[7%Action] [2026-02-18T...] Action Name — started
[7%Action] [2026-02-18T...] Action Name — executing
[7%Action] [2026-02-18T...] Action Name — completed
```

### 3. Test Timeout
Throttle network to slow 3G in DevTools:
- Should see "TIMEOUT" message in debug
- Should see error toast
- Loading state should reset

### 4. Test Error
Call a non-existent function:
- Should see "ERROR" in debug
- Should show error message in toast
- Loading state should reset

## Common Mistakes to Avoid

❌ **Don't:** Forget `setLoading` - user sees stuck loading button
```javascript
wrapAsyncAction('Action', async () => {
  // Missing setLoading - BAD
});
```

✅ **Do:** Pass setLoading
```javascript
wrapAsyncAction('Action', async () => {
  // Has setLoading - GOOD
}, { setLoading });
```

❌ **Don't:** Ignore errors
```javascript
wrapAsyncAction(...).catch(() => {});
```

✅ **Do:** Handle or let wrapper handle
```javascript
try {
  await wrapAsyncAction(...);
} catch (err) {
  // Custom handling if needed
}
```

❌ **Don't:** Use with React Query without wrapping mutationFn
```javascript
const mutation = useMutation({
  mutationFn: (data) => api.functions.invoke('fn', data),
  // Loading state managed by React Query, not our wrapper
});
```

✅ **Do:** Wrap the mutationFn
```javascript
const mutation = useMutation({
  mutationFn: createMutationWrapper(
    (data) => api.functions.invoke('fn', data)
  ),
});
```

## Debugging

### Check Global Error State
```javascript
window.__7pctCompat.errors // Array of all errors
window.__7pctCompat.actions // Array of all actions
```

### Export Logs for Analysis
```javascript
const { downloadDebugLogs } = await import('@/components/debug/ErrorExporter');
downloadDebugLogs();
```

### Monitor Live
```javascript
// Watch errors in real-time
setInterval(() => {
  console.log('Current error count:', window.__7pctCompat.errors.length);
}, 5000);
``