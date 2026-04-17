/**
 * Interactive Element Audit & Routing Debugger
 * Tracks all buttons, links, and actions
 * Verifies routing and pre-conditions
 * Dev-only tool for testing interaction flows
 */

import React, { useEffect, useState } from 'react';
import { ChevronDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const DEBUG_AUDIT = () => {
  try {
    return localStorage.getItem('7pct_audit') === '1';
  } catch {
    return false;
  }
};

export function useInteractionAudit() {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (!DEBUG_AUDIT()) return;

    // Track all button clicks
    const handleButtonClick = (e) => {
      const target = e.target.closest('button, [role="button"], a');
      if (!target) return;

      const interaction = {
        id: Math.random(),
        timestamp: new Date().toISOString(),
        type: 'click',
        element: target.tagName,
        text: (target.textContent || '').substring(0, 50),
        className: target.className.substring(0, 100),
        ariaLabel: target.getAttribute('aria-label'),
        href: target.href,
        status: 'initiated',
      };

      setInteractions(prev => [interaction, ...prev].slice(0, 50));
      
      // Log globally
      if (window.__7pctCompat) {
        window.__7pctCompat.interactions = window.__7pctCompat.interactions || [];
        window.__7pctCompat.interactions.push(interaction);
      }

      console.log('[7%Audit] Button clicked:', interaction);
    };

    document.addEventListener('click', handleButtonClick, true);
    return () => document.removeEventListener('click', handleButtonClick, true);
  }, []);

  const logAction = (actionName, status, details = {}) => {
    const action = {
      id: Math.random(),
      timestamp: new Date().toISOString(),
      action: actionName,
      status, // 'success', 'error', 'pending', 'condition_failed'
      details,
    };

    setInteractions(prev => [action, ...prev].slice(0, 50));
    
    if (window.__7pctCompat) {
      window.__7pctCompat.interactions = window.__7pctCompat.interactions || [];
      window.__7pctCompat.interactions.push(action);
    }

    console.log('[7%Audit]', actionName, status, details);
  };

  return { interactions, logAction };
}

export default function InteractionAudit() {
  const [expanded, setExpanded] = useState(false);
  const { interactions } = useInteractionAudit();

  if (!DEBUG_AUDIT()) return null;

  const recentInteractions = interactions.slice(0, 20);

  return (
    <div className="fixed bottom-20 right-4 z-40 font-mono text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg"
      >
        🔍 Audit ({recentInteractions.length})
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg max-h-96 w-80 overflow-y-auto">
          {recentInteractions.length === 0 ? (
            <div className="p-3 text-zinc-500">No interactions yet...</div>
          ) : (
            recentInteractions.map(interaction => (
              <div
                key={interaction.id}
                className="p-3 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {interaction.type === 'click' ? (
                    <span className="text-yellow-400">👆</span>
                  ) : interaction.status === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : interaction.status === 'error' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : interaction.status === 'condition_failed' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  ) : (
                    <span className="text-blue-400 animate-spin">⏳</span>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">
                      {interaction.type === 'click' ? interaction.text || 'Button' : interaction.action}
                    </div>
                    <div className="text-zinc-500 text-xs mt-0.5">
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </div>
                    {interaction.details && (
                      <div className="text-zinc-400 text-xs mt-1 truncate">
                        {JSON.stringify(interaction.details).substring(0, 60)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}