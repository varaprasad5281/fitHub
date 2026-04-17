import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChatWindow({ chatId, friendName, friendEmail }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: () => api.entities.ChatMessage.filter({ chat_id: chatId }, '-sent_date', 50),
    initialData: [],
    refetchInterval: 2000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [currentUser, setCurrentUser] = React.useState(null);

  useEffect(() => {
    api.auth.me().then(setCurrentUser).catch(console.error);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      // ✅ SECURITY: Use validated endpoint
      await api.functions.invoke('sanitizeChat', {
        chat_id: chatId,
        message: message.trim()
      });

      setMessage('');
      refetch();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-96 space-y-2 p-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 momentum-scroll">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_email === currentUser?.email ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender_email === currentUser?.email
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-white'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.sent_date).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-zinc-800 p-4 flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-lg flex-1"
        />
        <Button
          type="submit"
          disabled={sending || !message.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg px-3"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}