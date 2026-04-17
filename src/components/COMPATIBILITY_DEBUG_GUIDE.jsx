# 7% Compatibility Debug Guide

## Enabling Debug Mode

### Option 1: Console
```javascript
localStorage.setItem('7pct_compat_debug', '1');
window.location.reload();
```

### Option 2: Browser DevTools
1. Open DevTools Console
2. Paste the command above
3. Refresh page

## What Gets Logged

- **Action Started/Completed**: Every async action (fetch, checkout, navigation)
- **Errors**: JavaScript errors, rejected promises, timeouts
- **Device Info**: User agent, cookies, online status, memory, cores
- **Timestamps**: Exact time each event occurred

## Reading the Debug Panel

The debug panel appears as a red 🐛 button in the bottom-right.

- **Status Colors**:
  - 🟢 Green: Action completed successfully
  - 🔵 Blue: Action started
  - 🔴 Red: Action failed, errored, or timed out

- **Buttons**:
  - Copy: Copy all logs to clipboard
  - Download: Save logs as `.txt` file
  - Clear: Clear log history
  - Close: Hide panel (click 🐛 to reopen)

## Testing on Old Devices

### iOS Safari (< 12.1)
- Use iPhone with Safari from App Library
- Check: Optional chaining (?.), nullish coalescing (??), AbortController
- Common issues: Fetch API, LocalStorage permissions, third-party cookies

### Android Chrome (< 51)
- Use older Android phone or Chrome DevTools Android simulator
- Check: Promise, fetch, URL, URLSearchParams
- Common issues: Network timeouts, scroll performance, memory pressure

## Key Actions to Test

### 1. Authentication
```
Flow: Signup → Profile creation → Login
Watch for: Fetch errors, routing issues, session storage
```

### 2. Workout Builder
```
Flow: Open builder → Generate workout → Save
Watch for: Form submission, image generation, redirect
```

### 3. Checkout
```
Flow: Click upgrade → Stripe session creation → Redirect to Stripe
Watch for: CORS errors, timeout, blank redirect
```

### 4. Leaderboard
```
Flow: Load leaderboard → Filter/sort → Fetch friends
Watch for: Large data load, rendering lag, fetch failures
```

### 5. Navigation
```
Flow: Click nav links → Page transitions
Watch for: Blank pages, routing state issues, scroll position
```

## Common Issues & Fixes

### Issue: "fetch is not defined"
- **Cause**: Older Android/iOS doesn't have fetch
- **Fix**: Polyfill loads automatically, but check console for errors
- **Debug**: Look for "Fetch: ..." entries in debug panel

### Issue: "Cannot read property 'then' of undefined"
- **Cause**: Promise not available
- **Fix**: Polyfill in index.html loads Promise inline, check it loaded
- **Debug**: Search console for "Promise polyfill"

### Issue: Action starts but never completes
- **Cause**: Silent error or timeout (>10s)
- **Fix**: Check network tab in DevTools, look for failed requests
- **Debug**: Debug panel should show "timeout" status after 10s

### Issue: "Optional chaining (?.) is not supported"
- **Cause**: Old browser doesn't understand modern JS
- **Fix**: Vite build must transpile for older targets
- **Debug**: Check vite.config.js target setting

### Issue: Checkout redirects to blank page
- **Cause**: Stripe session creation failed
- **Fix**: Check backend logs in functions/createCheckout
- **Debug**: Look for "Fetch: createCheckout" error in debug panel

### Issue: LocalStorage not accessible
- **Cause**: iOS Safari in private mode or third-party context
- **Fix**: Fall back to sessionStorage or in-memory cache
- **Debug**: Try accessing localStorage in console

## Testing Checklist

After making a fix, test these on old devices:

- [ ] Can sign up / log in
- [ ] Can navigate between pages (no blank screens)
- [ ] Can generate a workout
- [ ] Can mark workout as complete
- [ ] Can view leaderboard
- [ ] Can open nutrition / coaching
- [ ] Can initiate Stripe checkout
- [ ] Network requests don't hang >10s
- [ ] No uncaught errors in console
- [ ] Debug panel shows mostly "completed" status

## Export & Share Logs

1. Open debug panel
2. Click "Download" to save logs as `.txt`
3. Share with developers for analysis

Log file includes:
- All event history with timestamps
- Device/browser information
- Network request details
- Error messages and stack traces

## Disable Debug Mode

```javascript
localStorage.removeItem('7pct_compat_debug');
window.location.reload();
```

---

**Version**: 1.0  
**Last Updated**: 2026-02-18  
**Status**: Active