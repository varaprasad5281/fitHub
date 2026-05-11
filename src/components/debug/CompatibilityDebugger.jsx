import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IS_DEBUG = () => {
  try {
    return localStorage.getItem('7pct_compat_debug') === '1';
  } catch {
    return false;
  }
};

export function useCompatibilityDebugger() {
  const logsRef = useRef([]);
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((action, status, details = null) => {
    if (!IS_DEBUG()) return;
    
    const log = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      status, // 'started', 'completed', 'failed', 'timeout', 'error'
      details,
      ua: navigator.userAgent,
    };
    
    logsRef.current.push(log);
    setLogs([...logsRef.current]);
    
    console.log(`[7% Compat] ${action} - ${status}`, details || '');
  }, []);

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    const report = `7% COMPATIBILITY DEBUG REPORT
Generated: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
Platform: ${navigator.platform}
Language: ${navigator.language}

LOGS:
${logs.map(l => `[${l.timestamp}] ${l.action} - ${l.status}${l.details ? `\n  Details: ${JSON.stringify(l.details)}` : ''}`).join('\n')}

BROWSER INFO:
- User Agent: ${navigator.userAgent}
- Platform: ${navigator.platform}
- Language: ${navigator.language}
- Cookies Enabled: ${navigator.cookieEnabled}
- Online: ${navigator.onLine}
- Memory: ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'}
- Cores: ${navigator.hardwareConcurrency || 'N/A'}
`;
    
    return report;
  }, [logs]);

  return {
    addLog,
    clearLogs,
    exportLogs,
    logs,
    isOpen,
    setIsOpen,
  };
}

export default function CompatibilityDebugger({ debugger: compatDebugger }) {
  if (!IS_DEBUG() || !compatDebugger) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'started': return 'text-blue-400';
      case 'failed': case 'timeout': case 'error': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'started': return <Clock className="w-3 h-3" />;
      case 'failed': case 'timeout': case 'error': return <AlertCircle className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  return (
    <AnimatePresence>
      {compatDebugger.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-[9999] w-96 max-h-96 rounded-xl border border-red-500/40 bg-zinc-900 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20 bg-red-500/5">
            <div>
              <h3 className="text-red-400 font-bold text-sm">🐛 Compat Debug</h3>
              <p className="text-red-600 text-xs">{compatDebugger.logs.length} events</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const text = compatDebugger.exportLogs();
                  navigator.clipboard.writeText(text).then(() => {
                    alert('Log copied to clipboard');
                  });
                }}
                className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Copy logs"
              >
                <Copy className="w-3 h-3 text-red-400" />
              </button>
              <button
                onClick={() => {
                  const text = compatDebugger.exportLogs();
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `7pct-debug-${new Date().getTime()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Download logs"
              >
                <Download className="w-3 h-3 text-red-400" />
              </button>
              <button
                onClick={() => compatDebugger.clearLogs()}
                className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => compatDebugger.setIsOpen(false)}
                className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto space-y-1 p-3 text-xs font-mono">
            {compatDebugger.logs.length === 0 ? (
              <p className="text-zinc-500">No events yet...</p>
            ) : (
              compatDebugger.logs.map((log) => (
                <div key={log.id} className="flex gap-2 items-start">
                  <span className={`${getStatusColor(log.status)} shrink-0 mt-0.5`}>
                    {getStatusIcon(log.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 justify-between">
                      <span className="text-zinc-400">{log.action}</span>
                      <span className={`${getStatusColor(log.status)} font-semibold`}>{log.status}</span>
                    </div>
                    {log.details && (
                      <div className="text-zinc-500 mt-0.5 max-h-12 overflow-hidden break-words">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Device Info Footer */}
          <div className="border-t border-red-500/20 px-3 py-2 bg-red-500/5 text-[10px] text-zinc-500 space-y-0.5">
            <div>UA: {navigator.userAgent.slice(0, 50)}...</div>
            <div>Online: {navigator.onLine ? '✓' : '✗'} | Cookies: {navigator.cookieEnabled ? '✓' : '✗'}</div>
          </div>
        </motion.div>
      )}

      {/* Toggle button */}
      {!compatDebugger.isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => compatDebugger.setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 flex items-center justify-center text-red-400 transition-all"
          title="Open compat debugger"
        >
          🐛
        </motion.button>
      )}
    </AnimatePresence>
  );
}