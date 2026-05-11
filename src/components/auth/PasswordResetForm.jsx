import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/api/client';
import { toast } from 'sonner';

export default function PasswordResetForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.functions.invoke('sendPasswordReset', { email });

      if (response.success) {
        setSent(true);
        toast.success('Password reset email sent');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Forgot Password?</h3>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-zinc-400 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          
          <div className="flex gap-3">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="flex justify-center mb-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-white font-medium mb-2">Check your email</p>
          <p className="text-sm text-zinc-400 mb-4">
            We've sent a password reset link to <span className="text-amber-400">{email}</span>
          </p>
          <p className="text-xs text-zinc-500 mb-4">
            The link will expire in 1 hour.
          </p>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}