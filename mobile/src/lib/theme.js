/**
 * Shared design tokens — mirrors the web app's Tailwind zinc/amber palette.
 */

export const COLORS = {
  background:    '#09090b', // zinc-950
  card:          '#18181b', // zinc-900
  cardHover:     '#27272a', // zinc-800
  border:        '#27272a', // zinc-800
  borderLight:   '#3f3f46', // zinc-700
  text:          '#ffffff',
  textMuted:     '#71717a', // zinc-500
  textSubtle:    '#52525b', // zinc-600
  accent:        '#f59e0b', // amber-400
  accentDark:    '#d97706', // amber-500
  accentBg:      'rgba(245,158,11,0.10)',
  accentBorder:  'rgba(245,158,11,0.20)',
  danger:        '#ef4444', // red-400
  dangerBg:      'rgba(239,68,68,0.10)',
  success:       '#22c55e', // green-400
  successBg:     'rgba(34,197,94,0.10)',
  info:          '#60a5fa', // blue-400
  infoBg:        'rgba(96,165,250,0.10)',
};

export const DIFFICULTY_COLORS = {
  beginner:     { text: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.20)'  }, // emerald
  intermediate: { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)'  }, // amber
  advanced:     { text: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.20)' }, // red
};
