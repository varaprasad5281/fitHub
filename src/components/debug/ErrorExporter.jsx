/**
 * Exports debug errors and actions for troubleshooting
 */

export function exportDebugLogs() {
  const data = window.__7pctCompat || { errors: [], actions: [] };
  
  const report = {
    exportedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    onLine: navigator.onLine,
    memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    errors: data.errors.slice(-50), // Last 50
    actions: data.actions.slice(-50), // Last 50
  };

  return JSON.stringify(report, null, 2);
}

export function downloadDebugLogs() {
  const logs = exportDebugLogs();
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `7pct-debug-${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyDebugLogs() {
  const logs = exportDebugLogs();
  navigator.clipboard?.writeText(logs).then(() => {
    console.log('[7%] Debug logs copied to clipboard');
  });
}

export default {
  exportDebugLogs,
  downloadDebugLogs,
  copyDebugLogs,
};