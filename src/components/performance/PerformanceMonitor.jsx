import { useEffect } from 'react';

/**
 * Performance monitoring component
 * Tracks Web Vitals and reports to analytics
 */
function isDebug() {
  try {
    return localStorage.getItem('7pct_debug') === '1';
  } catch {
    return false;
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Track Web Vitals (debug mode only)
    if (isDebug() && typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Guard each observer individually - older browsers/Safari
        // may support PerformanceObserver but not every entry type
        const observers = [];

        const safeObserve = (type, handler) => {
          try {
            const obs = new PerformanceObserver(handler);
            obs.observe({ entryTypes: [type] });
            observers.push(obs);
          } catch (_) {
            // Entry type not supported in this browser - skip silently
          }
        };

        safeObserve('largest-contentful-paint', (list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) console.log('LCP:', last.renderTime || last.loadTime);
        });

        safeObserve('first-input', (list) => {
          list.getEntries().forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        });

        let clsScore = 0;
        safeObserve('layout-shift', (list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) clsScore += entry.value;
          }
          console.log('CLS:', clsScore);
        });

        return () => observers.forEach(o => o.disconnect());
      } catch (e) {
        console.error('Performance monitoring error:', e);
      }
    }
  }, []);

  return null;
}