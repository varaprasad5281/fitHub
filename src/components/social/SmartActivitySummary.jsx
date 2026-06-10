import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function SmartActivitySummary({ activities, friends }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayActivities = activities.filter(a => {
    const aDate = new Date(a.created_date);
    aDate.setHours(0, 0, 0, 0);
    return aDate.getTime() === today.getTime();
  });

  const workoutCount = todayActivities.filter(a => a.activity_type === 'workout').length;
  const uniqueUsers = new Set(todayActivities.map(a => a.target_user_email)).size;

  if (workoutCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Flame className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {uniqueUsers} {uniqueUsers === 1 ? 'friend' : 'friends'} worked out today
          </p>
          <p className="text-amber-300 text-xs">{workoutCount} workout{workoutCount !== 1 ? 's' : ''} logged</p>
        </div>
      </div>
    </motion.div>
  );
}