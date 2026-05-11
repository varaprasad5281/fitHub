/**
 * BadgeTooltip
 *
 * A small badge icon that reveals a rich hover card with the badge's
 * name, rarity, and description. Used anywhere badges appear inline
 * (leaderboard rows, friends list, social tab).
 *
 * Props:
 *   badge  - badge object: { icon, name, rarity_level, description, badge_code }
 *   size   - 'xs' (20px) | 'sm' (26px, default) | 'md' (32px)
 *   align  - 'left' | 'center' | 'right' (tooltip horizontal anchor, default 'center')
 *   above  - bool: open tooltip above (default true) or below the icon
 */

import React, { useState, useRef } from 'react';

const RARITY = {
  common:    { border: 'border-zinc-600', label: 'text-zinc-400',   bg: 'bg-zinc-900'   },
  rare:      { border: 'border-blue-500', label: 'text-blue-400',   bg: 'bg-blue-950/80' },
  epic:      { border: 'border-purple-500', label: 'text-purple-400', bg: 'bg-purple-950/80' },
  legendary: { border: 'border-amber-400', label: 'text-amber-400',  bg: 'bg-amber-950/80' },
};

const SIZE = {
  xs: { outer: 'w-5 h-5',  text: 'text-sm'  },
  sm: { outer: 'w-6 h-6',  text: 'text-base' },
  md: { outer: 'w-8 h-8',  text: 'text-xl'  },
};

export default function BadgeTooltip({ badge, size = 'sm', align = 'center', above = true }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const r = RARITY[badge?.rarity_level] || RARITY.common;
  const s = SIZE[size] || SIZE.sm;

  const show = () => {
    clearTimeout(timerRef.current);
    setVisible(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 80);
  };

  // Tooltip horizontal alignment
  const alignClass =
    align === 'left'  ? 'left-0'            :
    align === 'right' ? 'right-0'           :
    'left-1/2 -translate-x-1/2';

  const vertClass = above ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Badge icon button */}
      <div
        className={`${s.outer} rounded-full bg-zinc-800/80 border ${r.border} flex items-center justify-center cursor-default select-none flex-shrink-0`}
        role="img"
        aria-label={badge?.name || 'Badge'}
      >
        <span className={s.text}>{badge?.icon || '🏅'}</span>
      </div>

      {/* Tooltip card */}
      {visible && (
        <div
          className={`absolute ${vertClass} ${alignClass} z-50 w-52 pointer-events-none`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className={`rounded-xl border ${r.border} ${r.bg} shadow-2xl p-3 flex flex-col gap-1.5 backdrop-blur-sm`}>
            {/* Icon + name row */}
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{badge?.icon || '🏅'}</span>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{badge?.name}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${r.label}`}>
                  {badge?.rarity_level}
                </p>
              </div>
            </div>
            {/* Description */}
            {badge?.description && (
              <p className="text-zinc-400 text-xs leading-snug border-t border-zinc-700/50 pt-1.5 mt-0.5">
                {badge.description}
              </p>
            )}
          </div>
          {/* Arrow pointer */}
          {above && (
            <div className="flex justify-center -mt-px">
              <div className={`w-2.5 h-2.5 rotate-45 border-b border-r ${r.border} ${r.bg}`} />
            </div>
          )}
          {!above && (
            <div className="flex justify-center -mb-px order-first">
              <div className={`w-2.5 h-2.5 rotate-45 border-t border-l ${r.border} ${r.bg}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * BadgeMiniRow
 *
 * Renders up to 3 featured badge icons in a tight horizontal row.
 * Each icon has a hover tooltip via BadgeTooltip.
 *
 * Props:
 *   badges  - array of badge objects (max 3)
 *   size    - passed to BadgeTooltip ('xs' | 'sm' | 'md')
 *   align   - tooltip alignment for the row ('left' | 'center' | 'right')
 *   above   - bool: tooltip opens above (default) or below icons
 */
export function BadgeMiniRow({ badges = [], size = 'xs', align = 'center', above = true }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {badges.slice(0, 3).map((badge, i) => (
        <BadgeTooltip
          key={badge.badge_code || badge._id || i}
          badge={badge}
          size={size}
          align={align}
          above={above}
        />
      ))}
    </div>
  );
}
