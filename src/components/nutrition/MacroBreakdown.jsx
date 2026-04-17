import React from 'react';
import { motion } from "framer-motion";

export default function MacroBreakdown({ protein, carbs, fats }) {
  const total = protein + carbs + fats;
  const proteinPct = total > 0 ? (protein / total) * 100 : 0;
  const carbsPct = total > 0 ? (carbs / total) * 100 : 0;
  const fatsPct = total > 0 ? (fats / total) * 100 : 0;

  const macros = [
    { name: 'Protein', value: protein, pct: proteinPct, color: 'bg-blue-500' },
    { name: 'Carbs', value: carbs, pct: carbsPct, color: 'bg-green-500' },
    { name: 'Fats', value: fats, pct: fatsPct, color: 'bg-amber-500' },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-white font-semibold mb-4">Macros</h3>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4">
        {macros.map((macro) => (
          <motion.div
            key={macro.name}
            initial={{ width: 0 }}
            animate={{ width: `${macro.pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={macro.color}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {macros.map((macro) => (
          <div key={macro.name}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-2 h-2 rounded-full ${macro.color}`} />
              <span className="text-zinc-500 text-xs uppercase tracking-wider">{macro.name}</span>
            </div>
            <p className="text-xl font-bold text-white">{macro.value}g</p>
          </div>
        ))}
      </div>
    </div>
  );
}