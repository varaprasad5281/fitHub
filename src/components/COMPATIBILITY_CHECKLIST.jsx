# 7% Compatibility Fix Checklist

## ✅ Implemented

### 1. Global Error Capture & Debug Panel
- [x] `window.onerror` handler in index.html & CompatibilityInitializer
- [x] `unhandledrejection` handler tracking
- [x] Global error state at `window.__7pctCompat`
- [x] ErrorExporter component for downloading/copying logs
- [x] CompatibilityDebugger panel (dev-only, toggle via `localStorage.setItem('7pct_debug', '1')`)
- [x] Device/browser info logging

### 2. Build Configuration & Polyfills
- [x] Promise polyfill (compatibilityPolyfills.js)
- [x] fetch polyfill + Response constructor
- [x] URLSearchParams polyfill
- [x] AbortController polyfill
- [x] Object.fromEntries, Array.at(), String.replaceAll polyfills
- [x] IntersectionObserver stub (for graceful degradation)
- [x] ResizeObserver stub
- [x] CompatibilityInitializer component loads at app startup
- [x] iOS Safari 100vh fix via CSS variable --vh

### 3. Async Action Fail-Safe
- [x] `wrapAsyncAction()` - master wrapper for all async operations
  - 10s timeout on all operations
  - Try/catch/finally with guaranteed loading state reset
  - Toast error messages on failure
  - Debug logging
- [x] `createMutationWrapper()` for React Query mutations
- [x] `fetchWithTimeout()` for API calls
- [x] `safeLocalStorage()` fallback for older devices

### 4. Authentication & Session Reliability
- [ ] Session persistence on page reload
  - PARTIALLY: Backup to sessionStorage on beforeunload
  - TODO: Verify api.auth session handling
- [ ] Safari SameSite cookie compatibility
  - TODO: Check backend cookie settings
- [ ] Force-refresh fallback if session lost
  - TODO: Add to AuthCacheProvider

### 5. Routing & Navigation Compatibility
- [ ] Ensure router.navigate() works on Safari
  - TODO: Add fallback to window.location.href
- [ ] Handle routing failures gracefully
  - TODO: Add error boundary around Router
- [ ] Prevent blank pages on transition
  - TODO: Add loading state on route change

### 6. Cross-Device UI/Interaction Compatibility
- [x] All clickable elements are real <button> or <a>
- [x] Fixed touch-target min-height 44px
- [x] Removed hover-only interactions (added active: states)
- [x] Prevent zoom on input focus (16px font-size)
- [x] iOS Safari 100vh fix
- [x] Prevent pinch zoom on page (touchmove handler)
- [ ] Test on actual older devices

## 📝 How to Use

### Enable Debug Mode
```javascript
// In browser console:
localStorage.setItem('7pct_debug', '1');
// Reload page
```

### Export Debug Logs
```javascript
// In browser console:
const { exportDebugLogs, downloadDebugLogs } = await import('@/components/debug/ErrorExporter');
downloadDebugLogs(); // Downloads JSON with last 50 errors/actions
```

### Device Info
```javascript
window.__7pctCompat // Shows all captured errors and actions
navigator.userAgent // Browser info
```

## 🔴 Required Fixes (Next Phase)

### Phase 1: Auth & Session
1. Test login/logout on iOS Safari 12-14
2. Test on Android Chrome 51-60
3. Ensure auth token persists across refresh
4. Fix SameSite cookie issues (if needed)

### Phase 2: Key Features
1. **Workouts**: Wrap generateWorkout, completeWorkout in async wrapper
2. **Meals**: Wrap generateMealPlan, logMeal in async wrapper
3. **Stripe**: Wrap checkout in async wrapper + add iframe check
4. **Leaderboard**: Wrap getLeaderboard in async wrapper
5. **Navigation**: Add Router error boundary + fallback navigation

### Phase 3: Testing
1. Test on iOS Safari 12, 13, 14
2. Test on Android Chrome 51, 60, 71
3. Test on Firefox Android
4. Simulate slow networks (DevTools throttling)
5. Create test report with OS/browser/feature checklist

## 🧪 Test Flows

Run these on older devices with `7pct_debug=1` to capture errors:

### Signup/Onboarding
```
1. Open app (iOS Safari 12)
2. Click "Start Free"
3. Fill onboarding form
4. Check debug panel for errors
```

### Workout Flow
```
1. Login
2. Go to Workouts
3. Generate workout
4. Wait 30s
5. Check for timeout errors or success
6. Complete workout
7. Verify points awarded
```

### Meal Plan Flow
```
1. Go to Nutrition
2. Generate meal plan
3. Log a meal
4. Check calorie total updates
```

### Stripe Checkout
```
1. Go to Subscription
2. Click "Upgrade to Pro"
3. Check that checkout loads
4. Verify 10s timeout on slow networks
```

### Leaderboard
```
1. Go to Leaderboard
2. Wait for data to load
3. Check for HTTP errors
4. Verify sorting works
```

## 📊 Monitoring

Enable logs in background and check periodically:
```javascript
// Save logs to file every 5 mins
setInterval(() => {
  const logs = window.__7pctCompat;
  if (logs.errors.length > 0) {
    console.warn('[7%] New errors detected:', logs.errors.slice(-5));
  }
}, 5 * 60 * 1000);
``