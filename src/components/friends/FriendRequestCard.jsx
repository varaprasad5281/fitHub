import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FriendRequestCard({ request, onRespond }) {
  const [loading, setLoading] = useState(false);

  const handleRespond = async (action) => {
    setLoading(true);
    try {
      await api.functions.invoke('manageFriendRequest', {
        action,
        requestId: request.id
      });
      toast.success(action === 'accept' ? 'Friend added!' : 'Request declined');
      onRespond();
    } catch (error) {
      toast.error('Could not respond to this friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{request.sender_username}</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => handleRespond('accept')}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full"
          size="icon"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => handleRespond('decline')}
          disabled={loading}
          className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-full"
          size="icon"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}