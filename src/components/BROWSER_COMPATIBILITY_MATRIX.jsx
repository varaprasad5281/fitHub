# 7% Browser Compatibility Matrix

## Target Devices (Priority Order)

### Tier 1: Critical (Must Work)
| Device | OS Version | Browser | Status | Notes |
|--------|-----------|---------|--------|-------|
| iPhone 6s/7 | iOS 12-14 | Safari | 🟡 In Progress | Oldest supported iOS for many users |
| iPhone 8/X | iOS 13-15 | Safari | 🟡 In Progress | Common older iPhone models |
| Older Android | Android 5-7 | Chrome 51-60 | 🟡 In Progress | Many budget devices still on Android 5/6 |
| Mid-range Android | Android 8-10 | Chrome 60-90 | 🟡 In Progress | Sweet spot for market share |

### Tier 2: Important (Should Work)
| Device | OS Version | Browser | Status | Notes |
|--------|-----------|---------|--------|-------|
| iPad Gen 5 | iOS 12-15 | Safari | 🟡 Testing Needed | Tablet screen sizes |
| Pixel 3a | Android 10-12 | Chrome | 🟡 Testing Needed | Reference device |
| OnePlus 6T | Android 9-12 | Chrome | 🟡 Testing Needed | Mid-range reference |

### Tier 3: Nice to Have
| Device | OS Version | Browser | Status | Notes |
|--------|-----------|---------|--------|-------|
| Firefox (all) | Any | Firefox | 🟡 Testing Needed | Alternative browser |
| Edge | Win/Mac | Edge | 🟡 Testing Needed | Chromium-based |

## Known Issues & Workarounds

### iOS Safari 12-14
| Issue | Cause | Workaround | Status |
|-------|-------|-----------|--------|
| 100vh exceeds visible area | Mobile chrome height change | CSS --vh variable | ✅ Fixed |
| Sticky headers bug | Position: sticky z-index | Use position: fixed | 🟡 Partially Fixed |
| Poor async handling | Limited Promise support | Promise polyfill | ✅ Fixed |
| localStorage unreliable | Private browsing mode | Fallback to sessionStorage | ✅ Fixed |
| Touch events lag | No passive event listeners | Added passive: true | ✅ Fixed |
| Fetch API missing | Very old iOS versions | Fetch polyfill (XHR fallback) | ✅ Fixed |
| Third-party cookie blocking | SameSite=Strict default | Cookie config update needed | 🔴 TODO |
| Viewport zoom on input | Default form behavior | Force 16px font-size | ✅ Fixed |
| Layout shift on load | Scrollbar width | Use scrollbar-gutter: stable | 🟡 Partial |

### Android Chrome 51-60
| Issue | Cause | Workaround | Status |
|-------|-------|-----------|--------|
| URLSearchParams missing | Old API | URLSearchParams polyfill | ✅ Fixed |
| Promise.finally missing | Older Promise impl | Polyfill or transpile | ✅ Fixed |
| AbortController missing | Newer API | AbortController polyfill | ✅ Fixed |
| Flex layout bugs | Old Blink engine | Use -webkit prefixes | ✅ Fixed in globals.css |
| Touch delay (300ms) | Old tap-to-zoom | touch-action: manipulation | ✅ Fixed |
| Memory issues | Low-end devices | Lazy load components | 🔴 TODO: Aggressive splitting |
| Network timeout | Bad connectivity | 10s timeout wrapper | ✅ Fixed |
| Weird hover states | Touch events map wrong | No hover-only interactions | ✅ Fixed |

## JavaScript Feature Support

### Modern Syntax to Transpile
```javascript
// ❌ Avoid (Not in Safari 12)
const value = obj?.property;
const fallback = value ?? 'default';
const [a, ...rest] = array;

// ✅ Use
const value = obj ? obj.property : undefined;
const fallback = value !== null && value !== undefined ? value : 'default';
const a = array[0];
const rest = array.slice(1);
```

### Polyfilled APIs
```javascript
// These are automatically polyfilled:
Promise - ✅ Polyfilled
fetch - ✅ Polyfilled
URLSearchParams - ✅ Polyfilled
AbortController - ✅ Polyfilled
Object.fromEntries - ✅ Polyfilled
Array.prototype.at() - ✅ Polyfilled
String.prototype.replaceAll - ✅ Polyfilled
IntersectionObserver - ✅ Stub (doesn't crash)
ResizeObserver - ✅ Stub (doesn't crash)

// NOT polyfilled (avoid):
Promise.allSettled - ❌ Use Promise.all + catch
async/await - ✅ Transpiled by Vite
Proxy - ❌ Don't use
Symbol - ❌ Avoid destructuring by Symbol
```

## CSS Compatibility

### Cross-browser Utilities in globals.css
```css
/* Already included: */
.backdrop-blur-xl /* with -webkit prefix */
.bg-gradient-to-r /* with -webkit and -moz */
.transform /* with -webkit and -ms */
.flex /* with -webkit-box and -ms-flexbox */
.grid /* with -ms-grid */
.touch-target /* min 44x44px */
.momentum-scroll /* -webkit-overflow-scrolling */
.safe-top / .safe-bottom /* notch support */
```

### What Works
- Flexbox (widespread support)
- CSS Grid (good support)
- CSS Variables (good support)
- Transforms (good support)
- Gradients (good support)
- Backdrop filters (with -webkit)

### What's Risky
- ❌ CSS Scroll Snap (inconsistent)
- ❌ CSS Containment (very limited)
- ❌ Subgrid (not in older Blink)

## Testing Checklist

### Before Release
- [ ] Test iOS Safari 12 (simulator or real device)
- [ ] Test iOS Safari 14 (simulator or real device)
- [ ] Test Android Chrome 51 (AVD emulator)
- [ ] Test Android Chrome 90 (AVD emulator)
- [ ] Throttle to Slow 3G in DevTools
- [ ] Check console for errors (localStorage, API calls)
- [ ] Test all critical flows:
  - [ ] Login/Signup
  - [ ] Workout generation
  - [ ] Meal logging
  - [ ] Stripe checkout
  - [ ] Leaderboard load
  - [ ] Logout/Session
- [ ] Export debug logs from each device
- [ ] Verify loading states always reset

### Automated Testing
```bash
# Test with legacy browser targets
npm run build -- --minify=false

# Check for unsupported syntax in bundle
npm run audit-bundle
```

### Manual Testing Steps

#### On iOS Safari 12 (iPad or iPhone 6s)
```
1. Open https://7percent.info
2. Enable debug: localStorage.setItem('7pct_debug', '1')
3. Reload
4. Check for red debug panel (should be empty initially)
5. Try signup flow
6. Export logs and review
```

#### On Android Chrome 51 (AVD)
```
1. Create Android 5.1 emulator
2. Install Chrome (old version) or use native browser
3. Navigate to app
4. Open DevTools (Remote debugging via adb)
5. Run same flow as iOS
6. Check for network/script errors
```

## Performance Targets for Old Devices

| Metric | Target | Critical |
|--------|--------|----------|
| First Paint | < 2s | < 4s |
| Interactive | < 5s | < 10s |
| API Response | < 3s | < 10s (timeout) |
| Button Response | < 500ms | Loading state visible |
| Page Transition | < 1s | No blank screen |

## Fallbacks for Critical APIs

### If fetch fails → Use XMLHttpRequest
### If localStorage blocked → Use sessionStorage or memory
### If AbortController not available → Use setTimeout for cancellation
### If Promise not available → Use polyfill
### If IntersectionObserver missing → Lazy load all content
### If CSS Grid not supported → Fall back to Flexbox

## References

- [MDN: Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API)
- [iOS Safari Limitations](https://webkit.org/)
- [Android Chrome Release Notes](https://chromereleases.googleblog.com/)
- [Can I Use](https://caniuse.com/)