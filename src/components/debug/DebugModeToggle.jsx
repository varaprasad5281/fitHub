/**
 * Debug Mode Toggle — renders a tiny toggle in the bottom-left corner.
 * Visible only in development or when ?debug=1 is in the URL.
 * Users can also manually activate via: localStorage.setItem('7pct_debug', '1')
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

function isDevOrDebugUrl() {
  try {
    const url = window.location.href;
    return url.indexOf('debug=1') !== -1 || url.indexOf('localhost') !== -1;
  } catch {
    return false;
  }
}

export default function DebugModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem('7pct_debug') === '1');
      setVisible(isDevOrDebugUrl());
    } catch {
      // localStorage not available
    }
  }, []);

  if (!visible) return null;

  const toggle = function() {
    var next = !enabled;
    try {
      if (next) {
        localStorage.setItem('7pct_debug', '1');
      } else {
        localStorage.removeItem('7pct_debug');
      }
    } catch (_e) {}
    setEnabled(next);
    toast.info(next ? 'Debug mode ON — button actions will be logged' : 'Debug mode OFF', {
      position: 'bottom-right',
      duration: 2000
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle debug mode"
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '12px',
        zIndex: 9999,
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontFamily: 'monospace',
        fontWeight: 700,
        border: '1px solid',
        cursor: 'pointer',
        backgroundColor: enabled ? '#fbbf24' : '#27272a',
        color: enabled ? '#000' : '#a1a1aa',
        borderColor: enabled ? '#f59e0b' : '#3f3f46',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        lineHeight: '1.5',
      }}
    >
      {enabled ? '🐛 DEBUG ON' : '🐛 debug'}
    </button>
  );
}