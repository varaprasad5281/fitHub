/**
 * Interaction Guardian
 * - Wraps all interactive elements with safety checks
 * - Prevents double-clicks
 * - Ensures loading states clear
 * - Validates element structure
 * - Dev-only audit mode
 */

import React, { useCallback } from 'react';

const IS_AUDIT = () => {
  try {
    return localStorage.getItem('7pct_audit') === '1';
  } catch {
    return false;
  }
};

const validateButton = (element) => {
  if (!element) return { valid: false, issues: ['Element is null'] };

  const issues = [];

  // Check if it's actually clickable
  if (element.disabled) {
    issues.push('Button is disabled');
  }

  // Check for click handler
  const hasOnClick = element.onclick || element.getAttribute('onclick');
  const isLink = element.tagName === 'A' && element.href;
  const hasRole = element.getAttribute('role') === 'button';

  if (!hasOnClick && !isLink && !hasRole && element.tagName !== 'BUTTON') {
    issues.push('No click handler or link found');
  }

  // Check for visible text or aria-label
  const hasText = element.textContent?.trim().length > 0;
  const hasAriaLabel = element.getAttribute('aria-label');

  if (!hasText && !hasAriaLabel) {
    issues.push('No visible text or aria-label');
  }

  // Check for pointer-events
  const styles = window.getComputedStyle(element);
  if (styles.pointerEvents === 'none') {
    issues.push('pointer-events: none (element blocked)');
  }

  // Check z-index issues (basic)
  if (styles.position === 'absolute' && !element.style.zIndex && element.style.zIndex !== 'auto') {
    // Might be covered by overlay
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

export function useGuardedClick(callback, options = {}) {
  const {
    actionName = 'Action',
    preventDoubleClick = true,
    disableDuringAction = true,
  } = options;

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleClick = useCallback(async (e) => {
    const element = e.currentTarget;
    const validation = validateButton(element);

    if (!validation.valid && IS_AUDIT()) {
      console.warn(`[7%Guardian] Issues with button "${actionName}":`, validation.issues);
    }

    if (preventDoubleClick && isProcessing) {
      if (IS_AUDIT()) {
        console.warn(`[7%Guardian] Double-click prevented on "${actionName}"`);
      }
      return;
    }

    if (disableDuringAction) {
      setIsProcessing(true);
    }

    try {
      if (IS_AUDIT()) {
        console.log(`[7%Guardian] Executing: ${actionName}`);
      }
      await callback(e);
    } catch (err) {
      if (IS_AUDIT()) {
        console.error(`[7%Guardian] Action failed: ${actionName}`, err);
      }
    } finally {
      if (disableDuringAction) {
        setIsProcessing(false);
      }
    }
  }, [callback, actionName, preventDoubleClick, isProcessing, disableDuringAction]);

  return { handleClick, isProcessing };
}

/**
 * Component wrapper for buttons to auto-validate
 */
export const GuardedButton = React.forwardRef(
  ({ onClick, actionName = 'Button', children, disabled, ...props }, ref) => {
    const { handleClick, isProcessing } = useGuardedClick(onClick, {
      actionName,
      preventDoubleClick: true,
      disableDuringAction: true,
    });

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GuardedButton.displayName = 'GuardedButton';

/**
 * Audit panel for interaction issues
 */
export function InteractionAuditPanel() {
  const [issues, setIssues] = React.useState([]);
  const [isScanning, setIsScanning] = React.useState(false);

  const scanButtons = React.useCallback(() => {
    if (!IS_AUDIT()) return;

    setIsScanning(true);
    const buttons = document.querySelectorAll('button, [role="button"], a[href]');
    const foundIssues = [];

    buttons.forEach((btn) => {
      const validation = validateButton(btn);
      if (!validation.valid) {
        foundIssues.push({
          element: btn.textContent?.substring(0, 40) || 'Unlabeled',
          issues: validation.issues,
          selector: btn.className,
        });
      }
    });

    setIssues(foundIssues);
    setIsScanning(false);

    console.log(`[7%Guardian] Found ${foundIssues.length} button issues out of ${buttons.length} buttons`);
  }, []);

  if (!IS_AUDIT()) return null;

  return (
    <div className="fixed bottom-32 right-4 z-40 bg-zinc-900 border border-red-600 rounded-lg shadow-lg max-w-sm max-h-96 overflow-y-auto p-3 font-mono text-xs">
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-zinc-900 pb-2 border-b border-zinc-800">
        <span className="text-red-400 font-bold">🛡️ Button Audit ({issues.length})</span>
        <button
          onClick={scanButtons}
          disabled={isScanning}
          className="text-xs px-2 py-1 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 disabled:opacity-50"
        >
          {isScanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="text-zinc-500">
          Click "Scan" to check for button issues
        </div>
      ) : (
        issues.map((issue, i) => (
          <div key={i} className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
            <div className="text-red-300 font-semibold mb-1">{issue.element}</div>
            {issue.issues.map((msg, j) => (
              <div key={j} className="text-red-400 text-xs mb-0.5">
                • {msg}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}