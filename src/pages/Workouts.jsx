import React, { useState, useEffect, useRef, memo } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dumbbell,
  Loader2,
  Sparkles,
  History,
  X,
  CheckCircle,
  Clock,
  Flame,
  CalendarDays,
  Settings2,
  Play,
  Timer,
  Lock,
  ChevronRight,
  Plus,
  Trash2,
  NotebookPen,
} from "lucide-react";
import WorkoutDetailModal from "@/components/workout/WorkoutDetailModal";
import WorkoutPreview from "@/components/conversion/WorkoutPreview";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { activeSub, hasProAccess } from "@/lib/subscriptionUtils";

const SINGLE_KEY = "wk_single_ids";
const WEEKLY_KEY = "wk_weekly_ids"; // all-time weekly IDs (current + past completed)
const WEEKLY_CURRENT_KEY = "wk_weekly_current_ids"; // current active plan only
const loadIds = (key) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
};
const saveIds = (key, set) =>
  localStorage.setItem(key, JSON.stringify([...set]));

const difficultyColors = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400  bg-amber-400/10  border-amber-400/20",
  advanced: "text-red-400    bg-red-400/10    border-red-400/20",
};

const fmt = (secs) =>
  `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

// ── Defined outside Workouts so component references are stable across re-renders ──

function CustomizePanel({ params, setParams, type }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
      {type === "weekly" ? (
        <div>
          <Label className="text-zinc-400 text-xs mb-2 block">
            Training Days / Week
          </Label>
          <Select
            value={params.days_per_week}
            onValueChange={(v) => setParams({ ...params, days_per_week: v })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day / week</SelectItem>
              <SelectItem value="2">2 days / week</SelectItem>
              <SelectItem value="3">3 days / week</SelectItem>
              <SelectItem value="4">4 days / week</SelectItem>
              <SelectItem value="5">5 days / week</SelectItem>
              <SelectItem value="6">6 days / week</SelectItem>
              <SelectItem value="7">7 days / week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Label className="text-zinc-400 text-xs mb-2 block">
            Workout Focus
          </Label>
          <Select
            value={params.focus}
            onValueChange={(v) => setParams({ ...params, focus: v })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Default (profile)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="gym">Gym Workout</SelectItem>
              <SelectItem value="home">Home Workout</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="yoga">Yoga & Flexibility</SelectItem>
              <SelectItem value="calisthenics">Calisthenics</SelectItem>
              <SelectItem value="hiit">HIIT</SelectItem>
              <SelectItem value="mixed">Mixed Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="text-zinc-400 text-xs mb-2 block">Duration</Label>
        <Select
          value={params.duration}
          onValueChange={(v) => setParams({ ...params, duration: v })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Default (profile)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-zinc-400 text-xs mb-2 block">Difficulty</Label>
        <Select
          value={params.difficulty}
          onValueChange={(v) => setParams({ ...params, difficulty: v })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Default (profile)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-zinc-400 text-xs mb-2 block">
          Target Muscles
        </Label>
        <Select
          value={params.target_muscles}
          onValueChange={(v) => setParams({ ...params, target_muscles: v })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="All muscle groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chest">Chest</SelectItem>
            <SelectItem value="back">Back</SelectItem>
            <SelectItem value="legs">Legs</SelectItem>
            <SelectItem value="shoulders">Shoulders</SelectItem>
            <SelectItem value="arms">Arms</SelectItem>
            <SelectItem value="core">Core & Abs</SelectItem>
            <SelectItem value="upper_body">Upper Body</SelectItem>
            <SelectItem value="lower_body">Lower Body</SelectItem>
            <SelectItem value="full_body">Full Body</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-zinc-400 text-xs mb-2 block">Equipment</Label>
        <Select
          value={params.equipment}
          onValueChange={(v) => setParams({ ...params, equipment: v })}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Default (profile)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Equipment</SelectItem>
            <SelectItem value="basic">Basic (Bands, Dumbbells)</SelectItem>
            <SelectItem value="full_gym">Full Gym Access</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// CustomizePanel never needs to re-render because of the parent's timer tick
const CustomizePanelMemo = memo(CustomizePanel);

const emptyExercise = () => ({
  name: "",
  sets: "",
  reps: "",
  weight_recommendation: "",
  instructions: "",
});

function CreateWorkoutModal({ onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    workout_name: "",
    difficulty: "beginner",
    estimated_duration: "30",
    exercises: [emptyExercise()],
  });

  const updateExercise = (i, field, value) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, idx) =>
        idx === i ? { ...ex, [field]: value } : ex,
      ),
    }));
  };
  const addExercise = () =>
    setForm((f) => ({ ...f, exercises: [...f.exercises, emptyExercise()] }));
  const removeExercise = (i) =>
    setForm((f) => ({
      ...f,
      exercises: f.exercises.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.workout_name.trim()) {
      toast.error("Give your workout a name");
      return;
    }
    const exercises = form.exercises.filter((ex) => ex.name.trim());
    if (exercises.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }

    onSubmit({
      workout_name: form.workout_name.trim(),
      difficulty: form.difficulty,
      estimated_duration: parseInt(form.estimated_duration, 10) || undefined,
      exercises: exercises.map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets ? parseInt(ex.sets, 10) : undefined,
        reps: ex.reps.trim() || undefined,
        weight_recommendation: ex.weight_recommendation.trim() || undefined,
        instructions: ex.instructions.trim() || undefined,
      })),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <NotebookPen className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">
              Add Your Own Workout
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-4"
        >
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">
              Workout Name
            </Label>
            <Input
              value={form.workout_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, workout_name: e.target.value }))
              }
              placeholder="e.g. Push Day"
              maxLength={60}
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-xs mb-2 block">
                Difficulty
              </Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-2 block">
                Duration (minutes)
              </Label>
              <Input
                type="number"
                min="1"
                max="240"
                value={form.estimated_duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estimated_duration: e.target.value }))
                }
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400 text-xs">Exercises</Label>
              <Button
                type="button"
                onClick={addExercise}
                className="h-8 px-3 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-full"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Exercise
              </Button>
            </div>
            {form.exercises.map((ex, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                    placeholder={`Exercise ${i + 1} name`}
                    maxLength={80}
                    className="bg-zinc-950 border-zinc-800 text-white flex-1"
                  />
                  {form.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(i)}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={ex.sets}
                    onChange={(e) => updateExercise(i, "sets", e.target.value)}
                    placeholder="Sets"
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                  <Input
                    value={ex.reps}
                    onChange={(e) => updateExercise(i, "reps", e.target.value)}
                    placeholder="Reps (e.g. 10 or 30 sec)"
                    maxLength={30}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <Input
                  value={ex.weight_recommendation}
                  onChange={(e) =>
                    updateExercise(i, "weight_recommendation", e.target.value)
                  }
                  placeholder="Weight / equipment notes (optional)"
                  maxLength={60}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
                <Textarea
                  value={ex.instructions}
                  onChange={(e) =>
                    updateExercise(i, "instructions", e.target.value)
                  }
                  placeholder="Instructions (optional)"
                  maxLength={300}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-11"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Workout"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// WorkoutTimerCard owns its own timer — parent never ticks, so dropdowns stay open
function WorkoutTimerCard({
  workout,
  onComplete,
  isCompleting,
  onViewDetails,
  onViewExercise,
  locked = false,
  onDelete,
  isDeleting,
}) {
  const STORAGE_KEY = `wk_timer_${workout.id || workout._id}`;
  const totalSecs = (workout.estimated_duration || 30) * 60;
  const [, setTick] = useState(0);
  const tickRef = useRef(null);

  // Restore startTime from localStorage so a page refresh continues the timer
  const [startTime, setStartTime] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const startTimer = () => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {}
    setStartTime(now);
    tickRef.current = setInterval(() => setTick((t) => t + 1), 1000);
  };

  // On mount: if a timer was already running (restored from localStorage), resume ticking
  useEffect(() => {
    if (startTime && !tickRef.current) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed < totalSecs) {
        tickRef.current = setInterval(() => setTick((t) => t + 1), 1000);
      }
    }
  }, []);

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
    },
    [],
  );

  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const remaining = Math.max(0, totalSecs - elapsed);
  const timer = {
    started: !!startTime,
    remaining,
    done: !!startTime && remaining === 0,
    progress: startTime ? Math.min(100, (elapsed / totalSecs) * 100) : 0,
  };

  // Stop interval once done and clear persisted timer
  useEffect(() => {
    if (timer.done && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [timer.done]);

  const handleComplete = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    onComplete();
  };

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${workout.is_completed ? "border-green-500/30 bg-green-500/5" : locked ? "border-zinc-800/50 bg-zinc-900/20 opacity-60" : "border-zinc-800 bg-zinc-900/50"}`}
    >
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <button
            onClick={onViewDetails}
            className="text-white font-semibold text-base truncate mb-2 hover:text-amber-400 transition-colors text-left w-full"
          >
            {workout.workout_name}
          </button>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full border capitalize font-medium ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}
            >
              {workout.difficulty}
            </span>
            {workout.estimated_duration && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                <Clock className="w-3 h-3" />
                {workout.estimated_duration} min
              </span>
            )}
            {workout.calories_burned && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                <Flame className="w-3 h-3" />
                {workout.calories_burned} cal
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {workout.exercises?.length || 0} exercises
            </span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
            title="Delete workout"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {workout.exercises?.length > 0 && (
        <div className="space-y-2 mb-4">
          {workout.exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => onViewExercise?.(i)}
              className="w-full flex items-start gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50 hover:border-amber-500/30 hover:bg-zinc-900/80 transition-all text-left group"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">
                    {ex.name}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {ex.sets} sets × {ex.reps}
                  </span>
                  {ex.weight_recommendation && (
                    <span className="text-amber-400 text-xs">
                      {ex.weight_recommendation}
                    </span>
                  )}
                </div>
                {ex.instructions && (
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed line-clamp-1">
                    {ex.instructions}
                  </p>
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      )}

      {!workout.is_completed && locked && (
        <div className="pt-3 border-t border-zinc-800/50 flex items-center gap-2 text-zinc-600">
          <Lock className="w-4 h-4 shrink-0" />
          <span className="text-xs">
            Complete the previous workout to unlock this one
          </span>
        </div>
      )}

      {!workout.is_completed && !locked && (
        <div className="pt-3 border-t border-zinc-800">
          {!timer.started ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={startTimer}
                className="w-full sm:w-auto bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-full px-4 h-10 text-sm"
              >
                <Play className="w-3.5 h-3.5 mr-2" />
                Start Workout
              </Button>
              <p className="text-zinc-500 text-xs">
                Start the timer to unlock completion
              </p>
            </div>
          ) : timer.done ? (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-10 text-sm"
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Mark as Complete
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Timer className="w-4 h-4 animate-pulse shrink-0" />
                  <span className="font-mono font-bold text-lg">
                    {fmt(timer.remaining)}
                  </span>
                </div>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${timer.progress}%` }}
                  />
                </div>
              </div>
              <Button
                disabled
                className="w-full bg-zinc-800 text-zinc-600 border border-zinc-700 rounded-full px-4 h-10 text-sm cursor-not-allowed opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete when timer finishes
              </Button>
            </div>
          )}
        </div>
      )}

      {workout.is_completed && (
        <div className="flex items-center gap-2 pt-3 border-t border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            Completed
            {workout.completed_date ? ` · ${workout.completed_date}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Workouts() {
  const [generating, setGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWeeklyHistory, setShowWeeklyHistory] = useState(false);
  const [historyWorkout, setHistoryWorkout] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(null);
  const [weeklyCurrentIds, setWeeklyCurrentIds] = useState(() =>
    loadIds(WEEKLY_CURRENT_KEY),
  );

  const openWorkout = (workout, exerciseIndex = null) => {
    setSelectedWorkout(workout);
    setSelectedExerciseIndex(exerciseIndex);
  };

  const closeWorkout = () => {
    setSelectedWorkout(null);
    setSelectedExerciseIndex(null);
  };
  const [showCustomizeSingle, setShowCustomizeSingle] = useState(false);
  const [showCustomizeWeekly, setShowCustomizeWeekly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomHistory, setShowCustomHistory] = useState(false);
  const [singleParams, setSingleParams] = useState({
    focus: "",
    duration: "",
    difficulty: "",
    equipment: "",
    target_muscles: "",
  });
  const [weeklyParams, setWeeklyParams] = useState({
    days_per_week: "1",
    duration: "",
    difficulty: "",
    equipment: "",
    target_muscles: "",
  });
  const [typeIds, setTypeIds] = useState({
    single: loadIds(SINGLE_KEY),
    weekly: loadIds(WEEKLY_KEY),
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts", user?.email],
    queryFn: () => api.entities.Workout.filter({ created_by: user.email }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.email,
  });

  const { data: subscriptions = [], isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    api.analytics.track({
      eventName: "workouts_viewed",
      properties: { page: "workouts" },
    });
  }, []);

  const hasWorkoutAccess = hasProAccess(activeSub(subscriptions));

  // Use stored IDs to strictly separate tabs; fall back to day_of_week only on first load
  const allSingle = workouts.filter(
    (w) =>
      !w.is_custom &&
      (typeIds.single.size > 0 ? typeIds.single.has(w.id) : !w.day_of_week),
  );
  const singleWorkout =
    allSingle
      .filter((w) => !w.is_completed)
      .sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )[0] || null;
  const completedSingle = allSingle
    .filter((w) => w.is_completed)
    .sort((a, b) =>
      (b.completed_date || "").localeCompare(a.completed_date || ""),
    );

  // User-created custom workouts (manually added, never auto-deleted by AI regeneration)
  const customWorkouts = workouts.filter((w) => w.is_custom);
  const activeCustomWorkouts = customWorkouts
    .filter((w) => !w.is_completed)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const completedCustomWorkouts = customWorkouts
    .filter((w) => w.is_completed)
    .sort((a, b) =>
      (b.completed_date || "").localeCompare(a.completed_date || ""),
    );

  // Current active weekly plan (only this plan's workouts — active + completed within it)
  const weeklyWorkouts = workouts.filter((w) => {
    if (weeklyCurrentIds.size > 0) return weeklyCurrentIds.has(w.id);
    if (typeIds.weekly.size > 0) return typeIds.weekly.has(w.id);
    return !!w.day_of_week;
  });

  // Completed workouts from previous weekly plans (not in current plan)
  const completedWeeklyHistory = workouts
    .filter(
      (w) =>
        typeIds.weekly.has(w.id) &&
        w.is_completed &&
        !weeklyCurrentIds.has(w.id),
    )
    .sort((a, b) =>
      (b.completed_date || "").localeCompare(a.completed_date || ""),
    );

  const completeWorkout = useMutation({
    mutationFn: async (workoutId) => {
      const result = await api.functions.invoke("completeWorkout", {
        workout_id: workoutId,
      });
      return result?.points_earned ?? 0;
    },
    onSuccess: (pointsEarned) => {
      toast.success(`Workout completed! +${pointsEarned} points`);
      queryClient.invalidateQueries({ queryKey: ["points"] });
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
      queryClient.invalidateQueries({ queryKey: ["workouts", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      api.functions
        .invoke("updateStreak")
        .then((res) => {
          if (res?.bonus_points > 0)
            toast.success(
              `🔥 ${res.current_count}-day streak! +${res.bonus_points} bonus points`,
            );
          queryClient.invalidateQueries({ queryKey: ["userPoints"] });
          queryClient.invalidateQueries({ queryKey: ["points"] });
        })
        .catch(() => {});
      api.functions.invoke("calculateDailyPoints").catch(() => {});
    },
    onError: () => toast.error("Failed to mark workout as complete"),
  });

  const createCustomWorkout = useMutation({
    mutationFn: (data) =>
      api.entities.Workout.create({ ...data, is_custom: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", user?.email] });
      toast.success("Your workout has been added!");
      setShowCreateModal(false);
    },
    onError: (err) =>
      toast.error(
        err?.message || "Could not save your workout. Please try again.",
      ),
  });

  const deleteCustomWorkout = useMutation({
    mutationFn: (workoutId) => api.entities.Workout.delete(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", user?.email] });
      toast.success("Workout deleted");
    },
    onError: () =>
      toast.error("Could not delete this workout. Please try again."),
  });

  const generate = async (type) => {
    setGenerating(true);
    try {
      const beforeIds = new Set(workouts.map((w) => w.id));

      if (type === "weekly") {
        const toDelete = workouts.filter(
          (w) =>
            !w.is_custom &&
            (typeIds.weekly.has(w.id) || !!w.day_of_week) &&
            !w.is_completed,
        );
        if (toDelete.length > 0)
          await Promise.all(
            toDelete.map((w) => api.entities.Workout.delete(w.id)),
          );
        const params = Object.fromEntries(
          Object.entries(weeklyParams).filter(([, v]) => v !== ""),
        );
        await api.functions.invoke("generateWeeklyWorkout", params);
      } else {
        const toDelete = workouts.filter(
          (w) =>
            !w.is_custom &&
            (typeIds.single.has(w.id) ||
              (!w.day_of_week && !typeIds.weekly.has(w.id))) &&
            !w.is_completed,
        );
        if (toDelete.length > 0)
          await Promise.all(
            toDelete.map((w) => api.entities.Workout.delete(w.id)),
          );
        const params = Object.fromEntries(
          Object.entries(singleParams).filter(([, v]) => v !== ""),
        );
        await api.functions.invoke("generatePersonalizedWorkout", params);
      }

      // Poll until new workouts appear — backend may commit asynchronously
      let fresh = [];
      let newIds = [];
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((r) => setTimeout(r, 700));
        fresh = await api.entities.Workout.filter({ created_by: user.email });
        newIds = fresh.filter((w) => !beforeIds.has(w.id)).map((w) => w.id);
        if (newIds.length > 0) break;
      }

      // Push fresh data straight into the React Query cache so the UI updates immediately
      queryClient.setQueryData(["workouts", user?.email], fresh);

      if (type === "weekly") {
        // Preserve completed IDs from previous plans so history is not lost
        const completedOldIds = new Set(
          [...typeIds.weekly].filter(
            (id) => fresh.find((w) => w.id === id)?.is_completed,
          ),
        );
        const allWeeklyIds = new Set([...completedOldIds, ...newIds]);
        const currentIds = new Set(newIds);
        saveIds(WEEKLY_KEY, allWeeklyIds);
        saveIds(WEEKLY_CURRENT_KEY, currentIds);
        setTypeIds((prev) => ({ ...prev, weekly: allWeeklyIds }));
        setWeeklyCurrentIds(currentIds);
        toast.success(
          `Weekly plan generated! ${newIds.length} workout${newIds.length !== 1 ? "s" : ""} ready.`,
        );
        setShowCustomizeWeekly(false);
      } else {
        const completedIds = new Set(
          [...typeIds.single].filter(
            (id) => fresh.find((w) => w.id === id)?.is_completed,
          ),
        );
        const next = new Set([...completedIds, ...newIds]);
        saveIds(SINGLE_KEY, next);
        setTypeIds((prev) => ({ ...prev, single: next }));
        toast.success("Your personal coach created a new workout!");
        setShowCustomizeSingle(false);
      }
    } catch {
      toast.error(
        "Could not generate your workout. Please try again, or adjust your preferences.",
      );
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading || subLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!hasWorkoutAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.15em]">
                Workouts
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Your Training Plan
            </h1>
          </div>
          <WorkoutPreview />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.15em]">
              Workouts
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Your Training Plan
          </h1>
          <p className="text-zinc-500 mt-1">
            AI-generated workouts tailored to your goals
          </p>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 mb-6 w-full grid grid-cols-3">
            <TabsTrigger
              value="single"
              className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              <Dumbbell className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">Single</span>
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              <CalendarDays className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">Weekly Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              <NotebookPen className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">My Workouts</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── SINGLE WORKOUT TAB ─── */}
          <TabsContent value="single" className="mt-0 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5">
              {/* Generate header */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white mb-1">
                      Generate 7% Workout
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                      Get a personalised single session based on your profile.
                      Regenerate anytime for a fresh variation.
                    </p>
                    {showCustomizeSingle && (
                      <CustomizePanelMemo
                        params={singleParams}
                        setParams={setSingleParams}
                        type="single"
                      />
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => generate("single")}
                        disabled={generating}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-11 shadow-lg shadow-amber-500/20"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {singleWorkout
                              ? "Regenerate Workout"
                              : "Generate Workout"}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowCustomizeSingle((v) => !v)}
                        className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-full h-11 px-5"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        {showCustomizeSingle ? "Hide Options" : "Customize"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated workout — shown directly below inside the same card */}
              {singleWorkout && (
                <div className="border-t border-amber-500/20 p-5 sm:p-6">
                  <WorkoutTimerCard
                    workout={singleWorkout}
                    onComplete={() => completeWorkout.mutate(singleWorkout.id)}
                    isCompleting={completeWorkout.isPending}
                    onViewDetails={() => openWorkout(singleWorkout)}
                    onViewExercise={(i) => openWorkout(singleWorkout, i)}
                  />
                </div>
              )}
            </div>

            {completedSingle.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={() => setShowHistory(true)}
                  className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 rounded-full px-6 gap-2"
                >
                  <History className="w-4 h-4" />
                  Previously Completed ({completedSingle.length})
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ─── WEEKLY PLAN TAB ─── */}
          <TabsContent value="weekly" className="mt-0 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5">
              {/* Generate header */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
                    <CalendarDays className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white mb-1">
                      Generate Weekly Plan
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                      Build a full week of training sessions spread across your
                      chosen days.
                    </p>
                    {showCustomizeWeekly && (
                      <CustomizePanelMemo
                        params={weeklyParams}
                        setParams={setWeeklyParams}
                        type="weekly"
                      />
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => generate("weekly")}
                        disabled={generating}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-11 shadow-lg shadow-amber-500/20"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {weeklyWorkouts.length > 0
                              ? "Regenerate Weekly Plan"
                              : "Generate Weekly Plan"}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowCustomizeWeekly((v) => !v)}
                        className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-full h-11 px-5"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        {showCustomizeWeekly ? "Hide Options" : "Customize"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly workouts — current plan */}
              {weeklyWorkouts.length > 0 && (
                <div className="border-t border-amber-500/20 p-5 sm:p-6 space-y-4">
                  {(() => {
                    const dayOrder = [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ];
                    const sorted = [...weeklyWorkouts].sort((a, b) => {
                      const ai = dayOrder.indexOf(a.day_of_week?.toLowerCase());
                      const bi = dayOrder.indexOf(b.day_of_week?.toLowerCase());
                      if (ai === -1 && bi === -1) return 0;
                      if (ai === -1) return 1;
                      if (bi === -1) return -1;
                      return ai - bi;
                    });
                    return sorted.map((workout, index) => {
                      const locked =
                        index > 0 && !sorted[index - 1].is_completed;
                      const label = workout.day_of_week
                        ? workout.day_of_week.charAt(0).toUpperCase() +
                          workout.day_of_week.slice(1).toLowerCase()
                        : `Day ${index + 1}`;
                      return (
                        <div key={workout.id}>
                          <h3
                            className={`text-xs font-semibold uppercase tracking-wider mb-2 ${locked ? "text-zinc-600" : "text-amber-400"}`}
                          >
                            {label}
                          </h3>
                          <WorkoutTimerCard
                            workout={workout}
                            onComplete={() =>
                              completeWorkout.mutate(workout.id)
                            }
                            isCompleting={completeWorkout.isPending}
                            onViewDetails={() => openWorkout(workout)}
                            onViewExercise={(i) => openWorkout(workout, i)}
                            locked={locked}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {completedWeeklyHistory.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={() => setShowWeeklyHistory(true)}
                  className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 rounded-full px-6 gap-2"
                >
                  <History className="w-4 h-4" />
                  Previously Completed ({completedWeeklyHistory.length})
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ─── MY WORKOUTS (CUSTOM) TAB ─── */}
          <TabsContent value="custom" className="mt-0 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
                    <NotebookPen className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white mb-1">
                      Your Custom Workouts
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                      Build and track your own workouts, alongside your
                      AI-generated plans.
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-11 shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your Own Workout
                    </Button>
                  </div>
                </div>
              </div>

              {activeCustomWorkouts.length > 0 && (
                <div className="border-t border-amber-500/20 p-5 sm:p-6 space-y-4">
                  {activeCustomWorkouts.map((workout) => (
                    <WorkoutTimerCard
                      key={workout.id}
                      workout={workout}
                      onComplete={() => completeWorkout.mutate(workout.id)}
                      isCompleting={completeWorkout.isPending}
                      onViewDetails={() => openWorkout(workout)}
                      onViewExercise={(i) => openWorkout(workout, i)}
                      onDelete={() => deleteCustomWorkout.mutate(workout.id)}
                      isDeleting={
                        deleteCustomWorkout.isPending &&
                        deleteCustomWorkout.variables === workout.id
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {activeCustomWorkouts.length === 0 &&
              completedCustomWorkouts.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  You haven't added any workouts of your own yet.
                </div>
              )}

            {completedCustomWorkouts.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={() => setShowCustomHistory(true)}
                  className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 rounded-full px-6 gap-2"
                >
                  <History className="w-4 h-4" />
                  Previously Completed ({completedCustomWorkouts.length})
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* History drawer */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">
                  Completed Workouts
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm">
                  {completedSingle.length} workouts
                </span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-3">
              {completedSingle.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => {
                    setHistoryWorkout(workout);
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-amber-500/30 hover:bg-zinc-900 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors truncate">
                      {workout.workout_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {workout.completed_date && (
                        <span className="text-zinc-500 text-xs">
                          {workout.completed_date}
                        </span>
                      )}
                      {workout.estimated_duration && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3 text-amber-400/50" />
                          {workout.estimated_duration} min
                        </span>
                      )}
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Flame className="w-3 h-3 text-orange-400/50" />~
                          {workout.calories_burned} cal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}
                    >
                      {workout.difficulty}
                    </span>
                    <span className="text-zinc-600 text-xs">
                      {workout.exercises?.length || 0} exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly history drawer */}
      {showWeeklyHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWeeklyHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">
                  Completed Weekly Workouts
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm">
                  {completedWeeklyHistory.length} workouts
                </span>
                <button
                  onClick={() => setShowWeeklyHistory(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-3">
              {completedWeeklyHistory.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => {
                    setHistoryWorkout(workout);
                    setShowWeeklyHistory(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-amber-500/30 hover:bg-zinc-900 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors truncate">
                      {workout.workout_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {workout.day_of_week && (
                        <span className="text-amber-400/70 text-xs font-medium capitalize">
                          {workout.day_of_week}
                        </span>
                      )}
                      {workout.completed_date && (
                        <span className="text-zinc-500 text-xs">
                          {workout.completed_date}
                        </span>
                      )}
                      {workout.estimated_duration && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3 text-amber-400/50" />
                          {workout.estimated_duration} min
                        </span>
                      )}
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Flame className="w-3 h-3 text-orange-400/50" />~
                          {workout.calories_burned} cal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}
                    >
                      {workout.difficulty}
                    </span>
                    <span className="text-zinc-600 text-xs">
                      {workout.exercises?.length || 0} exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {historyWorkout && (
        <WorkoutDetailModal
          workout={historyWorkout}
          onClose={() => setHistoryWorkout(null)}
          isCompleted={true}
        />
      )}

      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={closeWorkout}
          isCompleted={!!selectedWorkout.is_completed}
          initialExercise={selectedExerciseIndex}
        />
      )}

      {/* Custom workouts history drawer */}
      {showCustomHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCustomHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">
                  Completed Workouts
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm">
                  {completedCustomWorkouts.length} workouts
                </span>
                <button
                  onClick={() => setShowCustomHistory(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-3">
              {completedCustomWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => {
                    setHistoryWorkout(workout);
                    setShowCustomHistory(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-amber-500/30 hover:bg-zinc-900 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors truncate">
                      {workout.workout_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {workout.completed_date && (
                        <span className="text-zinc-500 text-xs">
                          {workout.completed_date}
                        </span>
                      )}
                      {workout.estimated_duration && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="w-3 h-3 text-amber-400/50" />
                          {workout.estimated_duration} min
                        </span>
                      )}
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Flame className="w-3 h-3 text-orange-400/50" />~
                          {workout.calories_burned} cal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}
                    >
                      {workout.difficulty}
                    </span>
                    <span className="text-zinc-600 text-xs">
                      {workout.exercises?.length || 0} exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create custom workout modal */}
      {showCreateModal && (
        <CreateWorkoutModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createCustomWorkout.mutate(data)}
          isSubmitting={createCustomWorkout.isPending}
        />
      )}
    </div>
  );
}
