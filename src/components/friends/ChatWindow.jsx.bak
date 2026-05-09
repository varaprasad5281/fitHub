/**
 * Chat Window Component
 * 1:1 direct message interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChatWindow({ friendEmail, onClose }) {
  const [messageInput, setMessageInput] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Get or create conversation
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.functions.invoke('getConversations', {});
      return response?.data?.conversations || [];
    }
  });

  const conversation = conversations.find(c => c.friend_email === friendEmail);

  // Get messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: async () => {
      if (!conversation) return [];
      const response = await api.functions.invoke('getConversations', {
        conversation_id: conversation.id,
        limit: 50
      });
      return response?.data?.messages || [];
    },
    enabled: !!conversation,
    staleTime: 1000 * 5
  });

  // Mark as read
  useEffect(() => {
    if (conversation) {
      api.functions.invoke('chatMessage', {
        action: 'mark_read',
        conversation_id: conversation.id
      }).catch(err => console.error('Mark read error:', err));
    }
  }, [conversation?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!messageInput.trim() || !conversation) return;

      await api.functions.invoke('chatMessage', {
        action: 'send',
        conversation_id: conversation.id,
        body: messageInput
      });

      setMessageInput('');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation?.id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to send message');
    }
  });

  const reportMutation = useMutation({
    mutationFn: async (messageId) => {
      await api.functions.invoke('chatMessage', {
        action: 'report',
        body: messageId
      });
    },
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it shortly.');
      setReportingMessageId(null);
    }
  });

  if (!conversation && !messagesLoading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-center h-96 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div>
          <p className="text-sm font-bold text-white">{friendEmail.split('@')[0]}</p>
          <p className="text-xs text-zinc-500">{friendEmail}</p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messagesLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-lg w-3/4" />
            ))}
          </div>
        ) : messages.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-sm text-zinc-400 font-semibold mb-1">No messages yet.</p>
             <p className="text-xs text-zinc-600">Start a conversation. Consistency is easier when it's shared.</p>
           </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_email === (api.auth.me?.())?.email;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    isOwn
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isOwn) setReportingMessageId(msg.id);
                  }}
                >
                  <p>{msg.body}</p>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {isOwn && msg.status === 'read' && '(read)'}
                  </p>
                </div>

                {reportingMessageId === msg.id && !isOwn && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 flex gap-1"
                  >
                    <Button
                      onClick={() => reportMutation.mutate(msg.id)}
                      size="icon"
                      className="h-8 w-8 bg-red-600/20 hover:bg-red-600/30 text-red-400"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => setReportingMessageId(null)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-700 p-3 flex gap-2">
        <Input
          type="text"
          placeholder="Write a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMutation.mutate();
            }
          }}
          className="h-9 bg-zinc-800 border-zinc-700 text-white rounded-lg"
        />
        <Button
          onClick={() => sendMutation.mutate()}
          disabled={!messageInput.trim() || sendMutation.isPending}
          className="h-9 px-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}