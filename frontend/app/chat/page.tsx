'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Filter, Search, Send } from 'lucide-react';
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
import { useSearchParams } from 'next/navigation';

type FilterType = 'all' | 'risky' | 'active';

export default function ChatPage() {
  const { conversations } = useDemoData();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;
  const dryness = useDryness(draft);

  // Handle query parameter for auto-selecting conversation
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.some(c => c.id === conversationParam)) {
      setSelectedConversationId(conversationParam);
    }
  }, [searchParams, conversations]);

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'risky':
        return conversation.isRisky && matchesSearch;
      case 'active':
        return conversation.isActive && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  useEffect(() => {
    // Show suggestions when draft is dry
    if (dryness.score >= 0.6 && draft.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [dryness.score, draft]);

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedConversation) return;

    // Simulate sending message and getting response
    toast.success('Ghost contained. Nice.');
    
    // Clear draft
    setDraft('');
    setShowSuggestions(false);
    
    // Simulate confetti if ghost score would drop significantly
    if (selectedConversation.ghostScore > 50) {
      triggerConfetti();
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setDraft(suggestion);
    setShowSuggestions(false);
  };

  const handleGenerateSuggestions = async () => {
    if (!selectedConversation) return;
    
    try {
      const lastMessages = selectedConversation.messages.slice(-3).map(m => m.text) || [];
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

  const handleConversationSelect = (conversationId: string) => {
    // If clicking the same conversation, unselect it
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    } else {
      setSelectedConversationId(conversationId);
    }
    setDraft('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onSearch={setSearchQuery} />
      
      <div className="flex-1 flex">
        {/* Left Panel - Conversations */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-2 mb-4">
              {[
                { id: 'all', label: 'All', count: conversations.length },
                { id: 'risky', label: 'Risky', count: conversations.filter(c => c.isRisky).length },
                { id: 'active', label: 'Active', count: conversations.filter(c => c.isActive).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Ghost className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations found</p>
                <p className="text-sm">It's quiet... too quiet.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                      selectedConversationId === conversation.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {conversation.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{conversation.name}</span>
                          {conversation.isActive && (
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastSeen}
                          </span>
                          <GhostBadge score={conversation.ghostScore} size="sm" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel - Chat Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <h2 className="font-semibold">{selectedConversation.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedConversation.lastSeen}</p>
                    </div>
                  </div>
                  <GhostBadge 
                    score={selectedConversation.ghostScore} 
                    showPulse={selectedConversation.ghostScore > 80}
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <AnimatePresence>
                  {selectedConversation.messages.map((message) => (
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
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Ghost className="w-24 h-24 mx-auto mb-6 text-primary/50" />
                <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-muted-foreground mb-6">
                  Choose a chat from the sidebar to start managing your ghosting risks
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleConversationSelect('jamie')}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Fix Jamie's Chat (92% Risk)
                  </button>
                  <button
                    onClick={() => handleConversationSelect('alex')}
                    className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    Healthy Chat (Alex)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Panel - AI Sidekick */}
        <div className="hidden xl:block w-96 border-l border-border">
          <div className="h-full overflow-y-auto">
            <AIBox
              currentDraft={draft}
              lastMessages={selectedConversation?.messages.slice(-3).map(m => m.text) || []}
              metrics={selectedConversation?.metrics || { daysSinceReply: 0, responseRate: 0, avgResponseTime: 0 }}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
