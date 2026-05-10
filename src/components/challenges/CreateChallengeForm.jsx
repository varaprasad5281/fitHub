import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

function calcEndDate(startDateStr, duration) {
  const start = new Date(startDateStr);
  const end = new Date(start);
  if (duration === 'monthly') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setDate(end.getDate() + 7); // default weekly
  }
  return end.toISOString().split('T')[0];
}

export default function CreateChallengeForm({ onClose }) {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [data, setData] = useState({
    name: '',
    description: '',
    challenge_type: 'community',
    metric: 'active_days',
    duration: 'weekly',
    start_date: todayStr,
    end_date: calcEndDate(todayStr, 'weekly'),
    prize_description: ''
  });

  const [errors, setErrors] = useState({});

  const createChallengeMutation = useMutation({
    mutationFn: (challengeData) => api.functions.invoke('createChallenge', challengeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge created!');
      onClose();
    },
    onError: (error) => {
      setErrors(prev => ({ ...prev, server: error.message || 'Failed to create challenge' }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.name.trim()) newErrors.name = 'Challenge name is required';
    if (!data.start_date || !data.end_date) newErrors.dates = 'Start and end dates are required';
    else if (data.end_date <= data.start_date) newErrors.dates = 'End date must be after start date';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    createChallengeMutation.mutate(data);
  };

  // Recalculate end date when duration or start date changes
  const updateDuration = (duration) => {
    setData(prev => ({
      ...prev,
      duration,
      end_date: calcEndDate(prev.start_date, duration),
    }));
  };

  const updateStartDate = (startDate) => {
    setData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: calcEndDate(startDate, prev.duration),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Challenge</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Challenge Name</Label>
            <Input
              placeholder="e.g., February Warrior"
              value={data.name}
              onChange={(e) => { setData({ ...data, name: e.target.value }); setErrors(p => ({ ...p, name: '' })); }}
              className={`bg-zinc-800 text-white rounded-xl h-11 ${errors.name ? 'border-red-500' : 'border-zinc-700'}`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Description</Label>
            <Input
              placeholder="What's the challenge about?"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
            />
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Challenge Type</Label>
            <Select value={data.challenge_type} onValueChange={(v) => setData({ ...data, challenge_type: v })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="community" className="text-white">Community</SelectItem>
                <SelectItem value="friends_only" className="text-white">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Metric</Label>
            <Select value={data.metric} onValueChange={(v) => setData({ ...data, metric: v })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="active_days" className="text-white">Active Days</SelectItem>
                <SelectItem value="total_points" className="text-white">Total Points</SelectItem>
                <SelectItem value="workouts_completed" className="text-white">Workouts</SelectItem>
                <SelectItem value="calories_logged" className="text-white">Calories Logged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Duration</Label>
            <Select value={data.duration} onValueChange={updateDuration}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400 text-sm mb-2 block">Start Date</Label>
                <Input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => { updateStartDate(e.target.value); setErrors(p => ({ ...p, dates: '' })); }}
                  className={`bg-zinc-800 text-white rounded-xl h-11 ${errors.dates ? 'border-red-500' : 'border-zinc-700'}`}
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-sm mb-2 block">End Date</Label>
                <Input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => { setData({ ...data, end_date: e.target.value }); setErrors(p => ({ ...p, dates: '' })); }}
                  className={`bg-zinc-800 text-white rounded-xl h-11 ${errors.dates ? 'border-red-500' : 'border-zinc-700'}`}
                />
              </div>
            </div>
            {errors.dates && <p className="text-red-400 text-xs mt-1">{errors.dates}</p>}
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Prize (Optional)</Label>
            <Input
              placeholder="e.g., Featured on leaderboard"
              value={data.prize_description}
              onChange={(e) => setData({ ...data, prize_description: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
            />
          </div>

          {errors.server && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{errors.server}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createChallengeMutation.isPending}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-xl h-11"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}