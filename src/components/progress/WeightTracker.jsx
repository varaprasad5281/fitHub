import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Scale, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTracker({ weight = {}, onLogWeight, isLoading = false }) {
  const [showForm, setShowForm] = useState(false);
  const [weightKg, setWeightKg] = useState('');

  const handleSubmit = async () => {
    if (!weightKg) return;
    await onLogWeight(parseFloat(weightKg), new Date().toISOString().split('T')[0]);
    setWeightKg('');
    setShowForm(false);
  };

  const trendEmoji = (weight?.trend ?? 0) < 0 ? '📉' : (weight?.trend ?? 0) > 0 ? '📈' : '➡️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold text-lg">Weight Tracking</h3>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
          variant="outline"
          size="sm"
        >
          Log Weight
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3"
        >
          <Input
            type="number"
            placeholder="Weight (kg)"
            step="0.1"
            min="20"
            max="300"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="bg-zinc-900 border-zinc-700"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!weightKg || isLoading}
              className="flex-1 bg-blue-500/30 border border-blue-500/50"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {weight?.current != null ? (
        <>
          <div className="mb-6">
            <p className="text-zinc-500 text-sm mb-2">Current Weight</p>
            <p className="text-4xl font-bold text-white">{parseFloat(weight.current).toFixed(1)} kg</p>
            <p className="text-zinc-500 text-sm mt-1">{(parseFloat(weight.current) * 2.20462).toFixed(1)} lbs</p>
          </div>

          {weight?.trend != null && (
            <div className="mb-6 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Weight Change</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{trendEmoji}</span>
                  <p className={`font-semibold ${(weight?.trend ?? 0) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(weight?.trend ?? 0) < 0 ? '-' : '+'}{Math.abs(weight?.trend ?? 0).toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {weight?.history && weight.history.length > 1 && (
            <div className="mt-6">
              <p className="text-zinc-400 text-sm mb-3">Weight History</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weight.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} domain="dataMin - 1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => value != null ? `${parseFloat(value).toFixed(1)} kg` : '-'}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <p className="text-zinc-500 text-center py-8">No weight data logged yet. Start tracking your weight!</p>
      )}
    </motion.div>
  );
}