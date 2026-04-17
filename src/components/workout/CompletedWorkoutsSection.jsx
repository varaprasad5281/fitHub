import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CompletedWorkoutsSection({ completions, workouts, profile }) {
  const [generatingCoaching, setGeneratingCoaching] = useState(false);
  const queryClient = useQueryClient();

  if (completions.length === 0) {
    return null;
  }

  // Get completed workout details
  const completedWorkoutDetails = completions
    .map(completion => workouts.find(w => w.id === completion.workout_id))
    .filter(Boolean);

  const handleGenerateCoaching = async () => {
    if (!profile || !profile[0]) {
      toast.error('Profile not found');
      return;
    }

    setGeneratingCoaching(true);
    try {
      const completedExercises = completedWorkoutDetails.flatMap(w => w.exercises || []);
      const exerciseSummary = completedExercises
        .map(e => `${e.name} (${e.sets}x${e.reps})`)
        .join(', ');

      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate personalized coaching feedback for a user who just completed these workouts:

Fitness Goal: ${profile[0].fitness_goal}
Activity Level: ${profile[0].activity_level}
Workout Preference: ${profile[0].workout_preference}

Completed Exercises: ${exerciseSummary}

Provide:
1. Encouraging feedback on their workout completion
2. 2-3 specific actionable tips to improve based on their fitness goal
3. Recovery recommendations

Keep it concise and motivating.`,
        response_json_schema: {
          type: "object",
          properties: {
            feedback: { type: "string" },
            tips: {
              type: "array",
              items: { type: "string" }
            },
            recovery: { type: "string" }
          }
        }
      });

      // Create coaching session
      await api.entities.CoachingSession.create({
        session_date: new Date().toISOString().split('T')[0],
        coaching_type: 'plan_adjustment',
        category: 'workout',
        advice: response.feedback,
        actionable_items: response.tips,
        metrics_used: {
          completed_workouts: completedWorkoutDetails.length,
          exercises_completed: completedExercises.length
        },
        read: false
      });

      queryClient.invalidateQueries(['coaching']);
      toast.success('Coaching generated based on your workouts!');
    } catch (error) {
      console.error('Error generating coaching:', error);
      toast.error('Failed to generate coaching');
    } finally {
      setGeneratingCoaching(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-zinc-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          Today's Completed Workouts
        </h2>
        <p className="text-zinc-500 text-sm">{completions.length} workout{completions.length > 1 ? 's' : ''} completed</p>
      </div>

      <div className="space-y-3 mb-6">
        {completedWorkoutDetails.map((workout) => (
          <div key={workout.id} className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
            <h3 className="text-white font-semibold mb-2">{workout.workout_name}</h3>
            <p className="text-zinc-500 text-sm">
              {workout.exercises?.length || 0} exercises • {workout.estimated_duration || 0} min
            </p>
          </div>
        ))}
      </div>

      <Button
        onClick={handleGenerateCoaching}
        disabled={generatingCoaching}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl h-12"
      >
        {generatingCoaching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Coaching...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" /> Generate Coaching Based on Performance
          </>
        )}
      </Button>
    </div>
  );
}