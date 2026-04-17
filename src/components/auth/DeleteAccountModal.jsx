import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2 } from 'lucide-react';
import { api } from '@/api/client';
import { toast } from 'sonner';

export default function DeleteAccountModal({ email, onClose, onDeleted }) {
  const [deleteMode, setDeleteMode] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    setConfirming(true);
    try {
      const response = await api.functions.invoke('forgetAccount', {
        email,
        deleteMode
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onDeleted?.();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-md w-full p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Delete Account</h2>
        </div>

        <p className="text-zinc-400 mb-6">
          Choose what you'd like to do with this account:
        </p>

        {!deleteMode ? (
          <div className="space-y-3">
            <button
              onClick={() => setDeleteMode('remove_from_quick_login')}
              className="w-full p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <p className="text-white font-medium mb-1">Remove from Quick Login</p>
              <p className="text-xs text-zinc-500">Account stays active, just removed from this list</p>
            </button>

            <button
              onClick={() => setDeleteMode('delete_account')}
              className="w-full p-4 rounded-lg border border-red-900/30 bg-red-950/20 hover:bg-red-950/40 transition-colors text-left"
            >
              <p className="text-red-400 font-medium mb-1 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Account Permanently
              </p>
              <p className="text-xs text-red-300/70">All data deleted. Cannot be undone.</p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {deleteMode === 'delete_account' && (
              <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30">
                <p className="text-xs text-red-300">
                  <strong>Warning:</strong> This will permanently delete your account and all associated data including workouts, meals, progress, and achievements. This action cannot be undone.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteMode(null)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleDelete}
                disabled={confirming}
                className={deleteMode === 'delete_account' 
                  ? 'flex-1 bg-red-600 hover:bg-red-700' 
                  : 'flex-1 bg-amber-500 hover:bg-amber-600 text-black'
                }
              >
                {confirming ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}

        {!deleteMode && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full mt-3"
          >
            Cancel
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}