import React from 'react';

export default function OptionGrid({ options, selected, onSelect, columns = 2 }) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`p-4 rounded-xl border text-left transition-all duration-300 ${
            selected === opt.value
              ? 'border-amber-400/60 bg-amber-500/10 shadow-lg shadow-amber-500/5'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
          }`}
        >
          {opt.icon && <div className="text-2xl mb-2">{opt.icon}</div>}
          <div className={`font-medium text-sm ${selected === opt.value ? 'text-amber-300' : 'text-white'}`}>
            {opt.label}
          </div>
          {opt.description && (
            <div className="text-xs text-zinc-500 mt-1">{opt.description}</div>
          )}
        </button>
      ))}
    </div>
  );
}