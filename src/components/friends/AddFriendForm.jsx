import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddFriendForm({ onSent }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.entities.Profile.list('-created_date', 100),
    initialData: [],
  });

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const user = await api.auth.me();
      
      const profile = profiles.find(p => p.username?.toLowerCase() === username.toLowerCase());
      if (!profile) {
        toast.error('Username not found');
        setLoading(false);
        return;
      }
      
      const targetEmail = profile.created_by;

      if (targetEmail === user.email) {
        toast.error("You can't add yourself as a friend");
        setLoading(false);
        return;
      }

      await api.functions.invoke('manageFriendRequest', {
        action: 'send',
        recipientEmail: targetEmail
      });

      toast.success('Friend request sent!');
      setUsername('');
      onSent();
    } catch (error) {
      if (error.response?.data?.error === 'Already connected') {
        toast.error('Already connected with this user');
      } else if (error.response?.data?.error === 'Request already sent') {
        toast.error('Request already pending');
      } else {
        toast.error('Failed to send request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-amber-400" />
        Add Friend by Username
      </h3>
      
      <form onSubmit={handleSendRequest} className="space-y-3">
        <Input
          type="text"
          placeholder="Search by username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white rounded-lg"
          disabled={loading}
          list="usernames"
        />
        <datalist id="usernames">
          {profiles
            .filter(p => p.username && p.username.toLowerCase().includes(username.toLowerCase()) && username.length > 0)
            .slice(0, 5)
            .map(p => (
              <option key={p.id} value={p.username} />
            ))}
        </datalist>
        <Button
          type="submit"
          disabled={loading || !username}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
      </form>
    </div>
  );
}