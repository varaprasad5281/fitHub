import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TrainingMotivationEdit({ profile, onClose }) {
  const [motivation, setMotivation] = useState(profile.training_motivation || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.entities.Profile.update(profile.id, {
        training_motivation: motivation.trim()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Training motivation updated!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update motivation');
    }
  });

  const handleSave = () => {
    if (!motivation.trim()) {
      toast.error('Please enter your training motivation');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What drives you? What are you training for? (e.g., 'I want to be strong for my family', 'Building confidence and discipline')"
        value={motivation}
        onChange={(e) => setMotivation(e.target.value)}
        className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl min-h-[120px] focus:border-amber-500/50 focus:ring-amber-500/20"
        maxLength={500}
      />
      <div className="text-xs text-zinc-600">{motivation.length}/500 characters</div>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={onClose}
          className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}