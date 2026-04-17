import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bug, X } from 'lucide-react';

export default function ClickDebugger() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Only enable in development
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    
    if (!isDev) return;

    // Global click logger
    const handleGlobalClick = (e) => {
      if (!isEnabled) return;

      const target = e.target;
      const tagName = target.tagName.toLowerCase();
      const isButton = tagName === 'button' || tagName === 'a' || target.role === 'button';
      const isClickable = target.onclick || target.closest('button') || target.closest('a') || target.closest('[role="button"]');
      
      if (isButton || isClickable) {
        const text = target.textContent?.trim().substring(0, 30) || 'unnamed';
        const info = {
          element: tagName,
          text: text || '(no text)',
          classes: target.className.substring(0, 50),
          disabled: target.disabled || false,
          cursor: window.getComputedStyle(target).cursor,
          pointerEvents: window.getComputedStyle(target).pointerEvents,
          zIndex: window.getComputedStyle(target).zIndex
        };

        setClickCount(prev => prev + 1);
        
        // Log to console for detailed inspection
        console.log(`[CLICK #${clickCount + 1}]`, {
          ...info,
          target,
          parentZIndex: target.parentElement ? window.getComputedStyle(target.parentElement).zIndex : 'auto'
        });

        // Show toast notification
        toast.success(`✓ ${tagName} "${info.text}" (cursor: ${info.cursor})`, {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    };

    if (isEnabled) {
      document.addEventListener('click', handleGlobalClick, true);
      console.log('%c[DEBUG MODE ON] Click logger activated', 'background: #fbbf24; color: black; padding: 8px; border-radius: 4px;');
    }

    return () => {
      if (isEnabled) {
        document.removeEventListener('click', handleGlobalClick, true);
      }
    };
  }, [isEnabled, clickCount]);

  // Keyboard shortcut: Ctrl+Shift+D to toggle debug mode
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    if (!isDev) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        setIsEnabled(prev => !prev);
        setClickCount(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2">
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
          isEnabled 
            ? 'bg-amber-500 text-black shadow-lg' 
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
        title="Ctrl+Shift+D to toggle"
      >
        <Bug className="w-4 h-4" />
        <span className="hidden sm:inline">Debug</span>
        {isEnabled && <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />}
      </button>
      {isEnabled && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300">
          Clicks: {clickCount}
        </div>
      )}
    </div>
  );
}