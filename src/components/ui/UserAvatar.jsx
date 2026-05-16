import { useState } from 'react';

function textSizeFrom(className = '') {
  if (/w-(5|6)/.test(className))  return 'text-xs';
  if (/w-(7|8|9)/.test(className)) return 'text-sm';
  if (/w-(10|11|12|14)/.test(className)) return 'text-base';
  if (/w-(16|18|20)/.test(className)) return 'text-xl';
  if (/w-(24|28|32)/.test(className)) return 'text-2xl';
  return 'text-sm';
}

/**
 * Shows a profile picture when available; falls back to the first letter of `name`.
 *
 * Props:
 *   src       – image URL (profile_picture_url / avatar_url / etc.)
 *   name      – display name used for the initial fallback
 *   className – tailwind sizing + any extra classes (default: "w-8 h-8")
 *   rounded   – border-radius class (default: "rounded-full")
 */
export default function UserAvatar({
  src,
  name,
  className = 'w-8 h-8',
  rounded = 'rounded-full',
}) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || '?').trim()[0].toUpperCase();
  const textSize = textSizeFrom(className);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        className={`${className} ${rounded} object-cover shrink-0`}
        onError={() => setImgError(true)}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`${className} ${rounded} bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 font-bold text-amber-400 ${textSize}`}
    >
      {initial}
    </div>
  );
}
