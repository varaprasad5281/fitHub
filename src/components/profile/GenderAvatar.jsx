import { User } from 'lucide-react';

function MaleAvatar({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="11" r="7" />
      <path d="M2 32C2 21 8 18 16 18C24 18 30 21 30 32Z" />
    </svg>
  );
}

function FemaleAvatar({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* hair top arch */}
      <path d="M9 11 Q9 2 16 2 Q23 2 23 11Z" />
      {/* hair left side */}
      <rect x="8" y="11" width="3" height="13" rx="1.5" />
      {/* hair right side */}
      <rect x="21" y="11" width="3" height="13" rx="1.5" />
      {/* head */}
      <circle cx="16" cy="11" r="7" />
      {/* body */}
      <path d="M5 32C5 22 10 19 16 19C22 19 27 22 27 32Z" />
    </svg>
  );
}

export default function GenderAvatar({ gender, className = 'w-8 h-8' }) {
  if (gender === 'male') return <MaleAvatar className={className} />;
  if (gender === 'female') return <FemaleAvatar className={className} />;
  return <User className={className} />;
}
