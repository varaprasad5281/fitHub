import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FriendRequestNotification({ user }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [shownIds, setShownIds] = useState(new Set());
  const ref = useRef(null);

  const { data: friendRequests = [], refetch } = useQuery({
    queryKey: ['friend-requests-notifications', user?.email],
    queryFn: () => api.entities.FriendRequest.filter({
      receiver_email: user?.email,
      status: 'pending',
    }),
    enabled: !!user?.email,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  // Toast for new requests
  useEffect(() => {
    friendRequests.forEach(r => {
      if (!shownIds.has(r.id)) {
        toast.info(`${r.requester_email} sent you a friend request!`, {
          icon: <UserPlus className="w-4 h-4" />,
          duration: 5000,
        });
        setShownIds(prev => new Set([...prev, r.id]));
      }
    });
  }, [friendRequests]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['friend-requests-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    refetch();
  };

  const accept = useMutation({
    mutationFn: (requesterEmail) =>
      api.functions.invoke('friendRequest', { action: 'accept', target_email: requesterEmail }),
    onSuccess: (_, requesterEmail) => {
      toast.success(`You and ${requesterEmail.split('@')[0]} are now friends!`);
      invalidate();
    },
    onError: () => toast.error('Could not accept request. Please try again.'),
  });

  const decline = useMutation({
    mutationFn: (requesterEmail) =>
      api.functions.invoke('friendRequest', { action: 'reject', target_email: requesterEmail }),
    onSuccess: () => {
      toast.success('Request declined.');
      invalidate();
    },
    onError: () => toast.error('Could not decline request. Please try again.'),
  });

  const count = friendRequests.length;
  if (!user || count === 0) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
        aria-label={`${count} friend request${count !== 1 ? 's' : ''}`}
      >
        <UserPlus className="w-5 h-5 text-zinc-400" />
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center pointer-events-none">
          {count > 9 ? '9+' : count}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Friend Requests ({count})
            </p>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {friendRequests.map(request => {
              const name = request.requester_email.split('@')[0];
              const busy = accept.isPending || decline.isPending;
              return (
                <div key={request.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                    {name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{name}</p>
                    <p className="text-zinc-500 text-xs truncate">{request.requester_email}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => accept.mutate(request.requester_email)}
                      disabled={busy}
                      className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/40 border border-green-500/40 flex items-center justify-center text-green-400 transition-colors disabled:opacity-40"
                      title="Accept"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => decline.mutate(request.requester_email)}
                      disabled={busy}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/40 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-40"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
