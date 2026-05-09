import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AddFriendForm({ onSent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(null); // email being sent to
  const [sentRequests, setSentRequests] = useState({});
  const debounceRef = useRef(null);

  // Debounced search — calls searchUsers on the server (searches Profile + User collections)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await api.functions.invoke('searchUsers', {
          query: query.trim(),
          limit: 10,
        });
        setResults(response?.data || []);
      } catch (err) {
        console.error('Search error:', err);
        toast.error('Search failed — please try again');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSendRequest = async (targetEmail) => {
    try {
      setSending(targetEmail);
      await api.functions.invoke('friendRequest', {
        action: 'send',
        target_email: targetEmail,   // server reads target_email
      });
      setSentRequests(prev => ({ ...prev, [targetEmail]: true }));
      toast.success('Friend request sent!');
      if (onSent) onSent();
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('already')) {
        toast.error('Already connected or request already sent');
      } else {
        toast.error('Failed to send request');
      }
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-amber-400" />
        Add Friend by Username or Email
      </h3>

      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {searching && (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!searching && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => {
            const displayName = user.username || user.full_name || user.created_by;
            const email = user.created_by || user.email;
            const alreadySent = sentRequests[email];

            return (
              <div
                key={email}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                      {(displayName || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{email}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleSendRequest(email)}
                  disabled={!!sending || alreadySent}
                  size="sm"
                  className={`ml-2 h-8 text-xs rounded-lg shrink-0 ${
                    alreadySent
                      ? 'bg-zinc-700 text-zinc-400 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-600 text-black font-semibold'
                  }`}
                >
                  {sending === email ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : alreadySent ? (
                    'Sent ✓'
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-center text-sm text-zinc-500 py-4">
          No users found for "{query}"
        </p>
      )}

      {!query && (
        <p className="text-center text-xs text-zinc-600 py-4">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
