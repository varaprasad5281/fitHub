/**
 * Real-time Performance Metrics
 * Displays Core Web Vitals and performance targets
 * Dev mode only
 */

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const PerformanceChecker = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(m => ({ ...m, lcp: lastEntry.renderTime || lastEntry.loadTime }));
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      setMetrics(m => ({ ...m, cls: clsValue }));
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        setMetrics(m => ({ ...m, fcp: entries[0].startTime }));
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // TTFB
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
      setMetrics(m => ({ ...m, ttfb }));
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const getColor = (metric, value) => {
    if (value === null) return 'text-gray-400';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      inp: { good: 200, poor: 500 }
    };
    
    const t = thresholds[metric];
    if (value <= t.good) return 'text-green-400';
    if (value <= t.poor) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-20 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-4 z-50 text-xs font-mono max-w-xs">
      <div className="flex items-center gap-2 mb-3 text-amber-400">
        <Activity className="w-4 h-4" />
        <span className="font-bold">Core Web Vitals</span>
      </div>
      
      <div className="space-y-2">
        <div className={`flex justify-between ${getColor('lcp', metrics.lcp)}`}>
          <span>LCP</span>
          <span>{metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : '-'}</span>
        </div>
        <div className="text-[10px] text-zinc-500">Target: &lt;2.5s</div>
        
        <div className={`flex justify-between ${getColor('cls', metrics.cls)}`}>
          <span>CLS</span>
          <span>{metrics.cls ? metrics.cls.toFixed(3) : '-'}</span>
        </div>
        <div className="text-[10px] text-zinc-500">Target: &lt;0.1</div>
        
        <div className={`flex justify-between ${getColor('fcp', metrics.fcp)}`}>
          <span>FCP</span>
          <span>{metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : '-'}</span>
        </div>
        <div className="text-[10px] text-zinc-500">Target: &lt;1.8s</div>
      </div>
    </div>
  );
};

export default PerformanceChecker;