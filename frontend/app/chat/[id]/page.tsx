'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Ghost } from 'lucide-react';
import { GhostBadge } from '@/components/ui/ghost-badge';
import { MessageBubble } from '@/components/ui/message-bubble';
import { DraftCoachBanner } from '@/components/ui/draft-coach-banner';
import { AIBox } from '@/components/ui/ai-box';
import { TopBar } from '@/components/ui/top-bar';
import { useDemoData } from '@/lib/demo-data';
import { useDryness } from '@/lib/use-dryness';
import { generateRewrite } from '@/lib/gemini';
import { triggerConfetti } from '@/lib/confetti';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ChatPageProps {
  params: { id: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { conversations } = useDemoData();
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const conversation = conversations.find(c => c.id === params.id);
  const dryness = useDryness(draft);

  useEffect(() => {
    // Show suggestions when draft is dry
    if (dryness.score >= 0.6 && draft.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [dryness.score, draft]);

  const handleSendMessage = async () => {
    if (!draft.trim()) return;

    // Simulate sending message and getting response
    toast.success('Ghost contained. Nice.');
    
    // Clear draft
    setDraft('');
    setShowSuggestions(false);
    
    // Simulate confetti if ghost score would drop significantly
    if (conversation && conversation.ghostScore > 50) {
      triggerConfetti();
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setDraft(suggestion);
    setShowSuggestions(false);
  };

  const handleGenerateSuggestions = async () => {
    try {
      const lastMessages = conversation?.messages.slice(-3).map(m => m.text) || [];
      const newSuggestions = await generateRewrite({ 
        draft, 
        lastTurns: lastMessages 
      });
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  useEffect(() => {
    if (showSuggestions && suggestions.length === 0) {
      handleGenerateSuggestions();
    }
  }, [showSuggestions]);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Ghost className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <p className="text-muted-foreground mb-4">This conversation doesn't exist or has been deleted.</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Conversations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onSearch={setSearchQuery} />
      
      <div className="flex-1 flex">
        {/* Left Panel - Conversations (Hidden on mobile) */}
        <div className="hidden lg:block w-80 border-r border-border">
          <div className="p-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Conversations
            </Link>
          </div>
        </div>

        {/* Middle Panel - Chat Thread */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  {conversation.avatar}
                </div>
                <div>
                  <h2 className="font-semibold">{conversation.name}</h2>
                  <p className="text-sm text-muted-foreground">{conversation.lastSeen}</p>
                </div>
              </div>
              <GhostBadge 
                score={conversation.ghostScore} 
                showPulse={conversation.ghostScore > 80}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <AnimatePresence>
              {conversation.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  text={message.text}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  quality={message.quality}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Message Composer */}
          <div className="p-4 border-t border-border">
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <DraftCoachBanner
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                />
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                    if (e.key === 'Escape') {
                      setDraft('');
                      setShowSuggestions(false);
                    }
                  }}
                />
                {dryness.score >= 0.6 && draft.trim() && (
                  <div className="absolute -top-8 left-0 text-xs text-amber-400 font-medium">
                    {dryness.label} ({Math.round(dryness.score * 100)}%)
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!draft.trim()}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Sidekick */}
        <div className="hidden xl:block w-96 border-l border-border">
          <div className="h-full overflow-y-auto">
            <AIBox
              currentDraft={draft}
              lastMessages={conversation.messages.slice(-3).map(m => m.text)}
              metrics={conversation.metrics}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
