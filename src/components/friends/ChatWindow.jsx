/**
 * ChatWindow
 * 1:1 direct message interface between two friends.
 *
 * Flow:
 *  1. On mount, call chatMessage {action:'init', recipient_email} to get/create conversation
 *  2. Once we have a conversation_id, fetch messages with {action:'list'}
 *  3. Poll for new messages every 5 s
 *  4. Send via {action:'send', conversation_id, body}
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, X, Flag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChatWindow({ friendEmail, onClose }) {
  const [messageInput, setMessageInput] = useState('');
  const [reportingId, setReportingId] = useState(null);
  const [myEmail, setMyEmail] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  // Resolve current user's email once — needed for isOwn detection
  useEffect(() => {
    api.auth.me().then(u => setMyEmail(u?.email)).catch(() => {});
  }, []);

  // ── Step 1: init / get conversation ──────────────────────────────────────
  const {
    data: conversationData,
    isLoading: initLoading,
    error: initError,
  } = useQuery({
    queryKey: ['conversation-init', friendEmail],
    queryFn: async () => {
      const res = await api.functions.invoke('chatMessage', {
        action: 'init',
        recipient_email: friendEmail,
      });
      if (!res?.conversation) throw new Error(res?.error || 'Could not open conversation');
      return res.conversation;
    },
    staleTime: Infinity, // conversation ID is stable, never refetch
    retry: false,
    enabled: !!friendEmail,
  });

  const conversationId = conversationData?._id;

  // ── Step 2: fetch messages (poll every 5 s) ───────────────────────────────
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.functions.invoke('chatMessage', {
        action: 'list',
        conversation_id: conversationId,
        limit: 60,
      });
      return res?.messages || [];
    },
    enabled: !!conversationId,
    staleTime: 0,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  // ── Mark as read when conversation first opens ────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    api.functions.invoke('chatMessage', {
      action: 'mark_read',
      conversation_id: conversationId,
    }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [conversationId, queryClient]);

  // ── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Focus input once conversation is ready ────────────────────────────────
  useEffect(() => {
    if (!initLoading && conversationId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initLoading, conversationId]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: async (text) => {
      const res = await api.functions.invoke('chatMessage', {
        action: 'send',
        conversation_id: conversationId,
        body: text,
      });
      if (!res?.success) throw new Error(res?.error || 'Send failed');
      return res;
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to send message'),
  });

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text || !conversationId || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  // ── Report ────────────────────────────────────────────────────────────────
  const reportMutation = useMutation({
    mutationFn: async (messageId) => {
      await api.functions.invoke('chatMessage', { action: 'report', body: messageId });
    },
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it.');
      setReportingId(null);
    },
    onError: () => toast.error('Failed to submit report'),
  });

  // ── Render ────────────────────────────────────────────────────────────────
  const friendDisplayName = friendEmail?.split('@')[0];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col h-[520px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/70 flex-shrink-0">
        <div>
          <p className="text-sm font-bold text-white">{friendDisplayName}</p>
          <p className="text-xs text-zinc-500">{friendEmail}</p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

        {initLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        )}

        {!initLoading && initError && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-zinc-400">
              {initError.message === 'You must be friends to message'
                ? 'You need to be friends before you can chat.'
                : 'Could not open this conversation. Try again.'}
            </p>
          </div>
        )}

        {!initLoading && !initError && messagesLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-8 rounded-xl w-3/4 ${i % 2 !== 0 ? 'ml-auto' : ''}`}
              />
            ))}
          </div>
        )}

        {!initLoading && !initError && !messagesLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-zinc-400 font-semibold mb-1">No messages yet.</p>
            <p className="text-xs text-zinc-600">
              Start the conversation. Consistency is easier when it's shared.
            </p>
          </div>
        )}

        {!initLoading && !initError && messages.map((msg) => {
          const isOwn = msg.sender_email === myEmail;
          const isReporting = reportingId === msg._id;

          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {/* Report controls — appear left of message on right-click */}
              {isReporting && !isOwn && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-1"
                >
                  <Button
                    onClick={() => reportMutation.mutate(msg._id)}
                    size="icon"
                    disabled={reportMutation.isPending}
                    className="h-7 w-7 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => setReportingId(null)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 rounded-lg"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}

              <div
                className={`max-w-[72%] px-3 py-2 rounded-2xl text-sm break-words select-text ${
                  isOwn
                    ? 'bg-amber-500 text-black rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}
                onContextMenu={(e) => {
                  if (!isOwn) { e.preventDefault(); setReportingId(msg._id); }
                }}
              >
                <p>{msg.body}</p>
                <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-black/50' : 'text-zinc-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isOwn && msg.status === 'read' && ' · read'}
                </p>
              </div>
            </motion.div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-700/70 p-3 flex gap-2 flex-shrink-0">
        <Input
          ref={inputRef}
          type="text"
          placeholder={initError ? 'Cannot send message' : 'Write a message…'}
          value={messageInput}
          disabled={!!initError || initLoading}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl"
        />
        <Button
          onClick={handleSend}
          disabled={!messageInput.trim() || !conversationId || sendMutation.isPending || !!initError}
          className="h-9 px-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl flex-shrink-0"
        >
          {sendMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </Button>
      </div>
    </div>
  );
}
