import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import GenderAvatar from "@/components/profile/GenderAvatar";
import { toast } from "sonner";
import { sanitizeHtml } from "@/components/utils/sanitize";
import { withActionDebug } from "@/components/debug/ActionDebugger";
import BadgeManager from "@/components/profile/BadgeManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "New Zealand",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Belgium", "Sweden",
  "Norway", "Denmark", "Finland", "Poland", "Czech Republic", "Ireland",
  "Japan", "South Korea", "China", "India", "Brazil", "Mexico", "Argentina",
  "Russia", "Ukraine", "South Africa", "Singapore", "Malaysia", "Thailand",
  "Vietnam", "Philippines", "Indonesia", "Pakistan", "Bangladesh", "Turkey",
];

export default function ProfileEdit({ profile, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    profile_picture_url: profile?.profile_picture_url || '',
    weight_kg: profile?.weight_kg || '',
    country: profile?.country || '',
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await api.entities.Profile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast.success('Profile updated');
      onClose();
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width > 2000 || img.height > 2000) {
          reject(new Error('Image dimensions must be 2000x2000px or less'));
        }
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Invalid image file'));
      };
      img.src = objectUrl;
    }).catch(error => {
      toast.error(error.message);
      throw error;
    });

    setUploading(true);
    try {
      const result = await api.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture_url: result.file_url }));
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    return withActionDebug('Save Profile Changes', async () => {
      if (formData.username && formData.username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      if (formData.username && formData.username.length > 20) {
        throw new Error('Username must be 20 characters or less');
      }

      const weight = formData.weight_kg ? parseFloat(formData.weight_kg) : null;
      if (weight !== null && (isNaN(weight) || weight < 20 || weight > 500)) {
        throw new Error('Please enter a valid weight (20–500 kg)');
      }

      const sanitizedData = {
        username: sanitizeHtml(formData.username && formData.username.trim() ? formData.username.trim() : ''),
        bio: sanitizeHtml(formData.bio && formData.bio.trim() ? formData.bio.trim() : ''),
        profile_picture_url: formData.profile_picture_url,
        ...(weight !== null && { weight_kg: weight }),
        country: formData.country || '',
      };

      if (sanitizedData.username && !/^[a-zA-Z0-9_-]+$/.test(sanitizedData.username)) {
        throw new Error('Username can only contain letters, numbers, underscores and hyphens');
      }

      api.analytics.track({
        eventName: 'profile_updated',
        properties: { has_photo: !!formData.profile_picture_url }
      });

      return new Promise(function(resolve, reject) {
        updateMutation.mutate(sanitizedData, {
          onSuccess: resolve,
          onError: reject
        });
      });
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div>
        <Label className="text-zinc-400 text-sm mb-3 block">Profile Picture</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center relative">
            {formData.profile_picture_url ? (
              <img src={formData.profile_picture_url} alt="Profile preview" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <>
                <GenderAvatar gender={profile?.gender} className="w-10 h-10 text-zinc-500" />
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <Camera className="w-4 h-4 text-zinc-400" />
                </div>
              </>
            )}
          </div>
          <label
            className="cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <div className="px-4 py-3 min-h-[44px] rounded-xl border border-zinc-700 text-zinc-300 text-sm active:bg-zinc-700 transition-colors flex items-center">
              {uploading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
              ) : (
                'Upload Photo'
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Username */}
      <div>
        <Label className="text-zinc-400 text-sm mb-2 block">Username</Label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Your display name"
          maxLength={20}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12"
        />
        <p className="text-zinc-600 text-xs mt-1">{formData.username?.length || 0}/20</p>
      </div>

      {/* Bio */}
      <div>
        <Label className="text-zinc-400 text-sm mb-2 block">Bio</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us about your fitness journey..."
          maxLength={200}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl min-h-[100px] resize-none"
        />
        <p className="text-zinc-600 text-xs mt-2">{formData.bio?.length || 0}/200</p>
      </div>

      {/* Weight */}
      <div>
        <Label className="text-zinc-400 text-sm mb-2 block">Weight (kg)</Label>
        <Input
          type="number"
          value={formData.weight_kg}
          onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
          placeholder={profile?.weight_kg ? `Current: ${profile.weight_kg} kg` : "Enter your weight"}
          min={20}
          max={500}
          step={0.1}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12"
        />
      </div>

      {/* Country */}
      <div>
        <Label className="text-zinc-400 text-sm mb-2 block">Country</Label>
        <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Badges */}
      <div>
        <Label className="text-zinc-400 text-sm mb-3 block">Manage Badges</Label>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <BadgeManager />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-xl h-11"
        >
          {updateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}