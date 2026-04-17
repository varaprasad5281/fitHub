import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2, Sparkles, History, X, CheckCircle, Clock, Flame } from "lucide-react";
import WorkoutCard from "@/components/workout/WorkoutCard";
import WorkoutDetailModal from "@/components/workout/WorkoutDetailModal";
import { toast } from "sonner";
import { useAuth } from '@/lib/AuthContext';

const MAX_HISTORY = 7;

const difficultyColors = {
  beginner:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  intermediate: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  advanced:     'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function Workouts() {
  const [generating, setGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyWorkout, setHistoryWorkout] = useState(null); // workout opened from history
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts', user?.email],
    queryFn: () => api.entities.Workout.filter({ created_by: user.email }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.email,
  });

  const { data: points = [] } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    api.analytics.track({ eventName: 'workouts_viewed', properties: { page: 'workouts' } });
  }, []);

  // Split into active and completed
  const activeWorkouts = workouts.filter(w => !w.is_completed);
  const completedWorkouts = workouts
    .filter(w => w.is_completed)
    .sort((a, b) => (b.completed_date || '').localeCompare(a.completed_date || ''));

  const completeWorkout = useMutation({
    mutationFn: async (workoutId) => {
      const workout = workouts.find(w => w.id === workoutId);
      const pts = points[0];
      const today = new Date().toISOString().split('T')[0];

      const difficultyPoints = { beginner: 25, intermediate: 50, advanced: 100 };
      const pointsEarned = difficultyPoints[workout?.difficulty] || 50;

      // Mark workout as completed
      await api.entities.Workout.update(workoutId, {
        is_completed: true,
        completed_date: today,
      });

      // Award points
      if (pts) {
        await api.entities.Points.update(pts.id, {
          total_points: (pts.total_points || 0) + pointsEarned,
          weekly_points: (pts.weekly_points || 0) + pointsEarned,
        });
      }

      // Log completion record
      await api.entities.WorkoutCompletion.create({
        workout_id: workoutId,
        completed_date: today,
      });

      // Enforce max 7 completed — delete oldest beyond the limit
      const allCompleted = workouts
        .filter(w => w.is_completed || w.id === workoutId)
        .sort((a, b) => (b.completed_date || '').localeCompare(a.completed_date || ''));

      if (allCompleted.length >= MAX_HISTORY) {
        const toDelete = allCompleted.slice(MAX_HISTORY);
        await Promise.all(toDelete.map(w => api.entities.Workout.delete(w.id)));
      }

      return pointsEarned;
    },
    onSuccess: (pointsEarned) => {
      api.analytics.track({ eventName: 'workout_completed', properties: { points_earned: pointsEarned } });
      toast.success(`Workout completed! +${pointsEarned} points`);
      queryClient.invalidateQueries({ queryKey: ['points'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.email] });
    },
    onError: () => toast.error('Failed to mark workout as complete'),
  });

  const generateWorkout = async () => {
    setGenerating(true);
    try {
      await api.functions.invoke('generatePersonalizedWorkout', {});
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.email] });
      toast.success('Your personal coach created a new workout!');
    } catch {
      toast.error('Failed to generate workout');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.15em]">Workouts</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Training Plan</h1>
          </div>
          <Button
            onClick={generateWorkout}
            disabled={generating}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-5 sm:px-6"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Workout</>
            )}
          </Button>
        </div>

        {/* Active workouts */}
        {activeWorkouts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center mb-6">
            <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 mb-4">No active workouts. Generate your next session!</p>
            <Button
              onClick={generateWorkout}
              disabled={generating}
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-6"
            >
              {generating ? 'Generating...' : 'Generate Workout'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            {activeWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onComplete={() => completeWorkout.mutate(workout.id)}
                isCompleted={false}
              />
            ))}
          </div>
        )}

        {/* Previously Generated Workouts button */}
        {completedWorkouts.length > 0 && (
          <div className="text-center">
            <Button
              onClick={() => setShowHistory(true)}
              className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-500 rounded-full px-6 gap-2"
            >
              <History className="w-4 h-4" />
              Previously Generated Workouts ({completedWorkouts.length})
            </Button>
          </div>
        )}
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">Previously Generated Workouts</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm">{completedWorkouts.length} workouts</span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Drawer list */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-3">
              {completedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => { setHistoryWorkout(workout); setShowHistory(false); }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-amber-500/30 hover:bg-zinc-900 transition-all group"
                >
                  {/* Completed badge */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors truncate">
                      {workout.workout_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {workout.completed_date && (
                        <span className="text-zinc-500 text-xs">{workout.completed_date}</span>
                      )}
                      {workout.estimated_duration && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3 text-amber-400/50" />
                          {workout.estimated_duration} min
                        </span>
                      )}
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Flame className="w-3 h-3 text-orange-400/50" />
                          ~{workout.calories_burned} cal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}>
                      {workout.difficulty}
                    </span>
                    <span className="text-zinc-600 text-xs">{workout.exercises?.length || 0} exercises</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail modal for a history workout */}
      {historyWorkout && (
        <WorkoutDetailModal
          workout={historyWorkout}
          onClose={() => setHistoryWorkout(null)}
          isCompleted={true}
        />
      )}
    </div>
  );
}
