import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle, Calendar, Trash2, Upload, Loader2, TrendingUp, Clock, AlertCircle, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProgressGoalCard({ goal, onDelete }) {
  const queryClient = useQueryClient();
  const progress = Math.min(100, ((goal.current_value || 0) / (goal.target_value || 1)) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)));
  const [uploading, setUploading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Calculate if goal is on track (fall back to createdAt if start_date missing)
  const startDateStr = goal.start_date || goal.createdAt?.split?.('T')[0] || new Date().toISOString().split('T')[0];
  const daysTotal = Math.ceil((new Date(goal.target_date) - new Date(startDateStr)) / (1000 * 60 * 60 * 24));
  const daysPassed = daysTotal - daysLeft;
  const expectedProgress = (daysPassed / daysTotal) * 100;
  const progressDifference = progress - expectedProgress;
  const isOnTrack = progressDifference >= -20; // Within 20% tolerance

  const deleteGoal = useMutation({
    mutationFn: (id) => api.entities.ProgressGoal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-goals'] });
      toast.success('Goal deleted');
      if (onDelete) onDelete();
    },
    onError: () => toast.error('Failed to delete goal')
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });

      const verification = await api.functions.invoke('verifyGoalCompletion', {
        goal_id: goal.id,
        image_url: file_url,
        goal_type: goal.goal_type,
        target_value: goal.target_value
      });

      if (verification.verified) {
        await api.entities.ProgressGoal.update(goal.id, {
          status: 'completed',
          current_value: goal.target_value
        });
        queryClient.invalidateQueries({ queryKey: ['progress-goals'] });
        toast.success('Goal verified as completed! 🎉');
      } else {
        toast.error('Could not verify goal completion. ' + (verification.message || ''));
      }
    } catch (error) {
      toast.error('Could not verify your progress photo. Please try a different image.');
    } finally {
      setUploading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (recommendations) {
      setShowRecommendations(!showRecommendations);
      return;
    }

    setLoadingRecs(true);
    try {
      const res = await api.functions.invoke('generateGoalRecommendations', {
        goalId: goal.id,
        goalType: goal.goal_type
      });
      setRecommendations(res.data.recommendations);
      setShowRecommendations(true);
      toast.success('AI recommendations generated!');
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error(error);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-4 sm:p-6 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold text-lg">{goal.goal_name || goal.name || 'Goal'}</h4>
            {goal.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
              {goal.goal_type.replace(/_/g, ' ')}
            </span>
            {goal.status === 'active' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isOnTrack 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isOnTrack ? '✓ On Track' : '⚠ Behind'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400 text-sm font-medium">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
          <span className="text-amber-400 text-sm font-bold">{Math.round(progress)}%</span>
        </div>
        
        {/* Enhanced Progress Bar with Expected Progress Indicator */}
        <div className="relative">
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Expected Progress Marker */}
          {goal.status === 'active' && expectedProgress > 0 && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/50"
              style={{ left: `${Math.min(expectedProgress, 100)}%` }}
              title={`Expected: ${Math.round(expectedProgress)}%`}
            />
          )}
        </div>
        
        {/* Progress Insights */}
        {goal.status === 'active' && (
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1 text-zinc-500">
              <TrendingUp className="w-3 h-3" />
              <span>Expected: {Math.round(expectedProgress)}%</span>
            </div>
            <div className={`flex items-center gap-1 font-semibold ${
              progressDifference >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {progressDifference >= 0 ? '+' : ''}{Math.round(progressDifference)}%
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-zinc-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>Time Left</span>
          </div>
          <p className="text-white font-semibold">{daysLeft} days</p>
        </div>
        <div className="rounded-lg bg-zinc-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Target className="w-3 h-3" />
            <span>Remaining</span>
          </div>
          <p className="text-white font-semibold">{Math.round(goal.target_value - goal.current_value)} {goal.unit}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          <span>Started {new Date(startDateStr).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
        </div>
        <span>Due {new Date(goal.target_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* AI Verification Upload */}
      {goal.status === 'active' && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <label className="flex items-center justify-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              {uploading ? 'Verifying...' : 'Upload proof to verify completion'}
            </span>
          </label>
        </div>
      )}

      {/* AI Recommendations */}
      {goal.status === 'active' && (
        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20">
          <Button
            onClick={handleGetRecommendations}
            disabled={loadingRecs}
            variant="ghost"
            className="w-full text-amber-400 hover:bg-amber-500/10 rounded-lg text-sm font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{recommendations ? 'View Recommendations' : 'Get AI Recommendations'}</span>
            </div>
            {loadingRecs ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className={`w-4 h-4 transition-transform ${showRecommendations ? 'rotate-180' : ''}`} />
            )}
          </Button>

          {/* Recommendations Content */}
          {showRecommendations && recommendations && (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-zinc-400 font-semibold mb-1">Summary</p>
                <p className="text-zinc-300">{recommendations.summary}</p>
              </div>

              <div>
                <p className="text-zinc-400 font-semibold mb-1">Nutrition Adjustments</p>
                <ul className="space-y-1">
                  {recommendations.nutritionAdjustments?.map((adj, i) => (
                    <li key={i} className="text-zinc-300 flex gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{adj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-zinc-400 font-semibold mb-1">Meal Timing</p>
                <p className="text-zinc-300">{recommendations.mealTiming}</p>
              </div>

              <div>
                <p className="text-zinc-400 font-semibold mb-1">Macro Targets</p>
                <p className="text-zinc-300">{recommendations.macroTargets}</p>
              </div>

              <div>
                <p className="text-zinc-400 font-semibold mb-1">Weekly Milestones</p>
                <ul className="space-y-1">
                  {recommendations.weeklyMilestones?.map((milestone, i) => (
                    <li key={i} className="text-zinc-300 flex gap-2">
                      <span className="text-green-400">✓</span>
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-zinc-400 font-semibold mb-1">Warnings</p>
                <ul className="space-y-1">
                  {recommendations.warnings?.map((warning, i) => (
                    <li key={i} className="text-zinc-300 flex gap-2">
                      <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Button */}
      <div className="flex gap-2">
        <Button
          onClick={() => deleteGoal.mutate(goal.id)}
          disabled={deleteGoal.isPending}
          variant="ghost"
          className="flex-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm"
        >
          {deleteGoal.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}