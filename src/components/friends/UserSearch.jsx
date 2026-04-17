/**
 * User Search Component
 * Find and add friends
 */

import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        const response = await api.functions.invoke('searchUsers', {
          q: query,
          limit: 10
        });
        setResults(response?.data?.results || []);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSendRequest = async (receiverEmail) => {
    try {
      setSending(true);
      await api.functions.invoke('friendRequest', {
        action: 'send',
        receiver_email: receiverEmail
      });

      setSentRequests(prev => ({
        ...prev,
        [receiverEmail]: true
      }));

      toast.success('Request sent.');
      setQuery('');
      setResults([]);
    } catch (error) {
      console.error('Send request error:', error);
      toast.error(error?.response?.data?.error || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold mb-2">
          Build Your Circle
        </p>
        <h3 className="text-lg font-bold text-white">Find accountability partners</h3>
        <p className="text-xs text-zinc-600 mt-2">Add people you know to stay accountable.</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
        <Input
          type="text"
          placeholder="Search by username or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-3 text-zinc-600 hover:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {results.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.profile_picture_url && (
                    <img
                      src={user.profile_picture_url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {user.country && `${user.country}`}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleSendRequest(user.email)}
                  disabled={sending || sentRequests[user.email]}
                  className={`ml-2 h-8 text-xs rounded-lg ${
                    sentRequests[user.email]
                      ? 'bg-zinc-700 text-zinc-400 cursor-default'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                  }`}
                >
                  {sentRequests[user.email] ? (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-zinc-500 font-semibold mb-1">No matches found.</p>
          <p className="text-xs text-zinc-600">Try a different username.</p>
        </div>
      )}

      {!loading && !query && (
        <p className="text-xs text-zinc-600 text-center py-4">
          Start typing to search
        </p>
      )}
    </div>
  );
}