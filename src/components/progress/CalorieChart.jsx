import React from 'react';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CalorieChart({ calories = {} }) {
  const data = calories.history || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Apple className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-semibold text-lg">Calorie Intake</h3>
      </div>

      {data.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-zinc-500 text-sm mb-2">Today's Intake</p>
            <p className="text-4xl font-bold text-white">{calories.today || 0} kcal</p>
          </div>

          <div className="mt-6">
            <p className="text-zinc-400 text-sm mb-3">Last 30 Days</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => `${value} kcal`}
                />
                <Bar dataKey="calories" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Macro breakdown for today */}
          {calories.today > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                <p className="text-zinc-500 text-xs mb-1">Protein</p>
                <p className="text-white font-semibold">
                  {data[data.length - 1]?.protein?.toFixed(0) || 0}g
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                <p className="text-zinc-500 text-xs mb-1">Carbs</p>
                <p className="text-white font-semibold">
                  {data[data.length - 1]?.carbs?.toFixed(0) || 0}g
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                <p className="text-zinc-500 text-xs mb-1">Fats</p>
                <p className="text-white font-semibold">
                  {data[data.length - 1]?.fats?.toFixed(0) || 0}g
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-zinc-500 text-center py-12">No calorie data logged yet</p>
      )}
    </motion.div>
  );
}