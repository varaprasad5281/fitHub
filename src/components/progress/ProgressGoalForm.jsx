import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function ProgressGoalForm({ onClose }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState({
    goal_type: 'weight',
    goal_name: '',
    target_value: '',
    unit: 'kg',
    target_date: ''
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData) => api.entities.ProgressGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-goals'] });
      toast.success('Goal created!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create goal');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!data.goal_name || !data.target_value || !data.target_date) {
      toast.error('Please fill in all fields');
      return;
    }

    const targetDate = new Date(data.target_date);
    if (targetDate < new Date()) {
      toast.error('Target date must be in the future');
      return;
    }

    createGoalMutation.mutate({
      ...data,
      target_value: Number(data.target_value),
      start_date: new Date().toISOString().split('T')[0],
      current_value: 0,
      status: 'active'
    });
  };

  const unitsByType = {
    weight: ['kg', 'lbs'],
    points: ['pts'],
    workout_streak: ['weeks'],
    workouts_completed: ['count'],
    custom: ['count']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Goal</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Goal Type</Label>
            <Select value={data.goal_type} onValueChange={(v) => setData({ ...data, goal_type: v, unit: unitsByType[v][0] })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="weight" className="text-white">Weight Loss/Gain</SelectItem>
                <SelectItem value="points" className="text-white">Points Target</SelectItem>
                <SelectItem value="workout_streak" className="text-white">Streak Duration</SelectItem>
                <SelectItem value="workouts_completed" className="text-white">Workouts Count</SelectItem>
                <SelectItem value="custom" className="text-white">Custom Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Goal Name</Label>
            <Input
              placeholder="e.g., Build muscle, improve endurance"
              value={data.goal_name}
              onChange={(e) => setData({ ...data, goal_name: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Target Value</Label>
              <Input
                type="number"
                placeholder="5"
                value={data.target_value}
                onChange={(e) => setData({ ...data, target_value: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Unit</Label>
              <Select value={data.unit} onValueChange={(v) => setData({ ...data, unit: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {unitsByType[data.goal_type].map(u => (
                    <SelectItem key={u} value={u} className="text-white">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Target Date</Label>
            <Input
              type="date"
              value={data.target_date}
              onChange={(e) => setData({ ...data, target_date: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
            />
          </div>

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
              disabled={createGoalMutation.isPending}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-xl h-11"
            >
              Create Goal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}