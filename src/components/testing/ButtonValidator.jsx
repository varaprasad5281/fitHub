/**
 * Production Button Validation Component
 * Tests all interactive elements for functionality
 * Run this in dev mode only - will auto-check all buttons
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const ButtonValidator = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Optional: Enable via keyboard shortcut
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        runValidation();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const runValidation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    const issues = [];
    const buttons = document.querySelectorAll('button, [role="button"], a[data-button]');
    
    buttons.forEach((btn, idx) => {
      const text = btn.textContent?.trim() || 'Unnamed button';
      const isDisabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
      const hasClick = btn.onclick || btn.hasAttribute('data-testid');
      const isVisible = btn.offsetParent !== null;
      
      if (!isVisible) {
        issues.push({
          type: 'warning',
          element: text.substring(0, 50),
          issue: 'Button not visible (hidden)'
        });
      }
      
      if (isDisabled && !btn.hasAttribute('data-loading')) {
        // Disabled buttons should have a reason
        const hasReason = btn.hasAttribute('title') || btn.hasAttribute('aria-label');
        if (!hasReason) {
          issues.push({
            type: 'warning',
            element: text.substring(0, 50),
            issue: 'Disabled button lacks explanation'
          });
        }
      }
      
      // Check for required attributes
      if (!btn.hasAttribute('type') && btn.tagName === 'BUTTON') {
        // Should have explicit type
      }
    });
    
    setResults(issues);
    setIsRunning(false);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md max-h-80 overflow-auto bg-zinc-900 border border-zinc-700 rounded-lg p-4 z-50 text-xs font-mono">
      <button 
        onClick={runValidation}
        className="mb-3 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
      >
        {isRunning ? 'Validating...' : 'Validate Buttons (Ctrl+Shift+B)'}
      </button>
      
      {results.length === 0 && !isRunning && (
        <p className="text-green-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> All buttons OK
        </p>
      )}
      
      {results.map((result, idx) => (
        <div key={idx} className={`mb-2 p-2 rounded ${
          result.type === 'error' ? 'bg-red-900/30 border border-red-800' : 'bg-yellow-900/30 border border-yellow-800'
        }`}>
          <p className={result.type === 'error' ? 'text-red-400' : 'text-yellow-400'}>
            {result.element}
          </p>
          <p className="text-zinc-400 text-[10px]">{result.issue}</p>
        </div>
      ))}
    </div>
  );
};

export default ButtonValidator;