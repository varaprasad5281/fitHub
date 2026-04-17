import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from '@/api/client';
import { withActionDebug } from '@/components/debug/ActionDebugger';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    
    await withActionDebug('Newsletter Subscribe', async () => {
      await api.integrations.Core.SendEmail({
        to: email,
        from_name: '7%',
        subject: 'Welcome to the 7% Community 🎉',
        body: `Welcome to 7%!\n\nYou're now part of our community of disciplined individuals.\n\nWe'll be sending you:\n✓ Weekly fitness insights\n✓ Community challenges\n✓ Motivation to keep you on track\n✓ Tips from top performers\n\nNo spam. Just discipline.\n\nBest,\nThe 7% Team`
      });
      toast.success('Subscribed! Check your inbox for 7% insights.');
      setEmail('');
    }, {
      setLoading,
      onError: (error) => {
        console.error('Newsletter signup failed:', error);
        toast.error('Something went wrong. Please try again.');
      }
    })();
  };

  return (
    <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the 7% Community
          </h2>
          <p className="text-zinc-500 text-lg mb-8">
            Get weekly insights, challenges, and motivation delivered to your inbox. 
            <br className="hidden md:block" />
            No spam. Just discipline.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-full px-5"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-8"
            >
              {loading ? 'Subscribing...' : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> Subscribe
                </>
              )}
            </Button>
          </form>

          <p className="text-zinc-600 text-xs mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}