# Performance Optimization Plan - Production Readiness

## Executive Summary
Current LCP: **25-26 seconds** | Target: **< 2.5 seconds** (90% reduction needed)

---

## Phase 1: COMPLETED ✅
### A) Non-Blocking Auth Check
- **Change**: Removed synchronous auth wait from Layout
- **Impact**: Allows page render immediately (eliminates ~5-10s initial block)
- **Status**: Implemented - `Layout.js` auth moved to background

---

## Phase 2: Route-Based Code Splitting
### B) Lazy Load Page Components
**Strategy**: Split large pages into separate bundles

```javascript
// Instead of direct import:
// import Dashboard from './pages/Dashboard';

// Use lazy loading:
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Progress = lazy(() => import('./pages/Progress'));
// ... wrap with <Suspense fallback={<Loader />}>
```

**Pages to Split** (size impact):
- Dashboard (~15KB) - High interaction
- Nutrition (~20KB) - Complex forms
- Progress (~25KB) - Heavy charts
- WorkoutBuilder (~18KB) - Form-heavy
- Leaderboard (~12KB) - Data-heavy
- Challenges (~16KB) - Interactive

**Expected Improvement**: -40-50% initial bundle, -8-12s LCP

---

## Phase 3: Performance Optimizations  
### C) Additional Improvements (Priority Order)

#### 3.1 Remove Debug Components
- PerformanceMonitor - Only in dev
- ClickDebugger - Only in dev

**Impact**: -0.5s

#### 3.2 Image Optimization
- Lazy load off-screen images
- Compress hero images

**Impact**: -3-5s

#### 3.3 Memoize Expensive Components
- NotificationCenter
- FriendActivityFeed
- CoachingCard

**Impact**: -1-2s

#### 3.4 Bundle Analysis
Identify unused libraries in dependencies

**Impact**: -3-4s

---

## Expected Results After All Changes

| Current | Target |
|---------|--------|
| LCP: 25-26s | LCP: 2-3s |
| FCP: 20-21s | FCP: 1.5-2s |
| Bundle: ~600KB | Bundle: ~150-200KB |

---

## Quick Wins (Recommended Next Steps)
1. Code split Dashboard + Home pages
2. Remove debug components from production
3. Compress hero images
4. Test and deploy incrementally