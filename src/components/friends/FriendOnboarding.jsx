import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Search, ChevronRight, Sparkles } from 'lucide-react';
import SuggestedFriendsCard from './SuggestedFriendsCard';
import UserSearch from './UserSearch';
import { api } from '@/api/client';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { toast } from 'sonner';

export default function FriendOnboarding({ onComplete, onSkip }) {
  const [step, setStep] = useState('intro'); // intro, suggested, search
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (step === 'suggested') {
      fetchSuggestedFriends();
    }
  }, [step]);

  const fetchSuggestedFriends = async () => {
    setLoading(true);
    try {
      const { data } = await api.functions.invoke('suggestedFriends');
      setSuggested(data.suggested || []);
    } catch (error) {
      console.log('Error fetching suggestions:', error);
      toast.error('Could not load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (email) => {
    try {
      await api.functions.invoke('friendRequest', { target_email: email });
      toast.success('Friend request sent');
      setSuggested(suggested.filter(s => s.email !== email));
    } catch (error) {
      console.log('Error sending request:', error);
      toast.error('Could not send request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl">Build Your Circle</h2>
          <button
            onClick={onSkip}
            className="text-zinc-400 hover:text-white transition-colors font-medium text-sm"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 flex flex-col h-full justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-2">Consistency is stronger with accountability.</h3>
                    <p className="text-zinc-400">Add people you trust to stay disciplined together.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">You can</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Search className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">Search for friends</p>
                        <p className="text-zinc-500 text-xs">Find people by username</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">Get suggestions</p>
                        <p className="text-zinc-500 text-xs">Based on your goals & activity</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setStep('suggested')}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold h-11 rounded-xl"
                  >
                    See Suggestions
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button
                    onClick={() => setStep('search')}
                    variant="outline"
                    className="w-full border-zinc-700 text-white hover:bg-zinc-800/50"
                  >
                    Search by Username
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'suggested' && (
              <motion.div
                key="suggested"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setStep('intro')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-1"
                >
                  ← Back
                </button>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : suggested.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-zinc-400 text-sm">People aligned with your vision.</p>
                    {suggested.map((suggestion) => (
                      <SuggestedFriendsCard
                        key={suggestion.email}
                        suggestion={suggestion}
                        onAddFriend={handleAddFriend}
                        isLoading={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400 text-sm">No suggestions yet. Try searching by username.</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={() => setStep('intro')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-1 mb-4"
                >
                  ← Back
                </button>
                <UserSearch />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}