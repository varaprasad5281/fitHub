# Action Reliability Report — 7% App
Date: 2026-02-18

---

## Issues Found & Fixed

### 1. Silent Failures — No Error Shown to User
**Affected:** PricingSection checkout, Subscription upgrade/cancel/billing, WorkoutBuilder generate & complete, Profile recalculate points, Coaching generate, Newsletter subscribe  
**Root cause:** `try/catch` blocks either swallowed errors silently, or `loading=false` was never called in a `finally` block, leaving buttons in an infinite disabled/loading state.  
**Fix:** Wrapped every async handler in `withActionDebug()` which guarantees:
  - `setLoading(false)` always fires in `finally`
  - Errors always produce a user-visible toast
  - Debug logging and toast fired when debug mode is on

---

### 2. Infinite Loading on Timeout
**Affected:** Checkout (PricingSection & Subscription), any slow API call  
**Root cause:** `setTimeout` was used to clear loading state but `clearTimeout` was not always called on success, and the timeout did not abort in-flight fetch requests.  
**Fix:** `withActionDebug` wraps every call with a 10-second timeout. On timeout it:
  - Calls `controller.abort()` (using `AbortController` where available)
  - Calls `setLoading(false)`
  - Shows toast: "Something went wrong. Please try again."

---

### 3. Optional Chaining (`?.`) Used in Event Handlers
**Affected:** `response.data?.url`, `user?.email`, `goals.map(g => ...)`, `subscription?.plan`, `scrollIntoView`, `element?.scrollIntoView()`  
**Root cause:** Optional chaining `?.` is not supported in iOS Safari < 13.4, Chrome < 80, Android WebView < 80. When Babel/Vite doesn't downcompile it (depends on `browserslist` target), the JS throws a SyntaxError silently and the handler never runs — looks like "button pressed, nothing happens".  
**Fix:** Rewrote all handler-internal optional chaining to explicit `&&` guards:
  - `user?.email` → `user ? user.email : null`
  - `response.data?.url` → `response.data && response.data.url`
  - `subscription?.plan` → `subscription ? subscription.plan : null`
  - `element?.scrollIntoView(...)` → `if (el && el.scrollIntoView) el.scrollIntoView(...)`

---

### 4. Nullish Coalescing (`??`) in Handlers
**Affected:** Various fallback values in handler bodies  
**Root cause:** `??` operator not supported in iOS Safari < 13.1, older Android  
**Fix:** Replaced with explicit `|| 'fallback'` where safe, or ternary `value !== null && value !== undefined ? value : fallback`

---

### 5. PerformanceObserver Crashing on Unsupported Entry Types
**Affected:** All pages — if the observer threw, it may have blocked JS execution in the same microtask  
**Root cause:** `PerformanceObserver.observe({ entryTypes: ['layout-shift'] })` throws on Safari < 14 where layout-shift is unsupported  
**Fix:** Each observer is now wrapped individually in `try/catch` so failure of one doesn't break the others

---

### 6. `pointer-events` Blocking Taps on Decorative Elements
**Affected:** Older Android WebView — decorative `::before`/`::after` pseudo-elements on buttons can intercept touch events in Blink < 90  
**Root cause:** CSS `position: relative` on buttons without `z-index: 0` can cause pseudo-elements to create stacking contexts that intercept pointer events  
**Fix:** Added global CSS: `button { position: relative; z-index: 0; }` and `button::before, button::after { pointer-events: none; }`

---

### 7. No Debug Visibility Into Failing Actions
**Fix applied:** Created `components/debug/ActionDebugger.jsx` with `withActionDebug(name, fn, opts)` utility.  
**Usage:** Add `?debug=1` to any URL or run `localStorage.setItem('7pct_debug', '1')` in the browser console. A 🐛 toggle appears in the bottom-left corner. When enabled:
  - Every wrapped action logs: action name, timestamp, started/completed/error
  - Toast appears: "Action started: <name>" and "Action complete: <name>"

---

## Actions Wrapped with Reliability Layer

| Action | File | Timeout | Loading Reset | Error Toast |
|--------|------|---------|--------------|-------------|
| Checkout (Pricing) | PricingSection | ✅ 10s | ✅ | ✅ |
| Checkout (Subscription) | Subscription | ✅ 10s | ✅ | ✅ |
| Cancel Subscription | Subscription | ✅ 10s | ✅ | ✅ |
| Manage Billing | Subscription | ✅ 10s | ✅ | ✅ |
| Generate Workout | WorkoutBuilder | ✅ 10s | ✅ | ✅ |
| Complete Workout | WorkoutBuilder | ✅ 10s | ✅ | ✅ |
| Recalculate Points | Profile | ✅ 10s | ✅ | ✅ |
| Generate Coaching | Coaching | ✅ 10s | ✅ | ✅ |
| Newsletter Subscribe | NewsletterSection | ✅ 10s | ✅ | ✅ |

---

## Routing Note
All navigation buttons use `<Link to={createPageUrl(...)}>` from react-router-dom which uses the History API. This is correctly compiled and works on all target browsers. No SPA routing issues detected. `<a href>` fallbacks are used in the invoice download links which is correct behaviour.