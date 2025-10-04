'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Filter, Search, Send, BarChart3 } from 'lucide-react';
import { GhostBadge } from '@/components/ui/ghost-badge';
import { MessageBubble } from '@/components/ui/message-bubble';
import { DraftCoachBanner } from '@/components/ui/draft-coach-banner';
import { AIBox } from '@/components/ui/ai-box';
import { TopBar } from '@/components/ui/top-bar';
import { useDatabaseData, getAutofillSuggestions } from '@/lib/use-database-data';
import { supabaseDatabase } from '@/lib/supabase-service';
import { useDryness } from '@/lib/use-dryness';
import { generateRewrite } from '@/lib/gemini';
import { triggerConfetti } from '@/lib/confetti';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

type FilterType = 'all' | 'risky' | 'active';

function ChatContent() {
  const db = useDatabaseData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autofillSuggestions, setAutofillSuggestions] = useState<string[]>([]);
  const [showAutofill, setShowAutofill] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [aiAssistanceEnabled, setAiAssistanceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;
  const dryness = useDryness(draft);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(user);
      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

  // Helper function to generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Load conversations from Supabase after user is authenticated
  useEffect(() => {
    if (!user?.id) return; // Don't load conversations until user is authenticated

    const loadConversations = async () => {
      try {
        setLoading(true);
        
        // Fetch all conversations from Supabase (no user filter)
        const supabaseConversations = await supabaseDatabase.getConversations();
        const legacyConversations: any[] = [];

        for (const conversation of supabaseConversations) {
          // Get the first participant as the "other user" for display purposes
          const otherUserId = conversation.participants[0];
          if (otherUserId) {
            const [otherUser, messages] = await Promise.all([
              supabaseDatabase.getUser(otherUserId),
              supabaseDatabase.getMessages({ conversationId: conversation.id })
            ]);
            
            if (otherUser) {
              // Convert to legacy format
              const lastMessage = messages[messages.length - 1];
              const isActive = otherUser.analytics.lastActiveAt && 
                new Date(otherUser.analytics.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
              
              legacyConversations.push({
                id: conversation.id,
                participants: conversation.participants, // Preserve participants field
                name: otherUser.profile.name,
                alias: otherUser.profile.alias,
                avatar: otherUser.profile.avatar,
                ghostScore: conversation.metrics.ghostScore,
                lastMessage: lastMessage?.content.text || '',
                lastSeen: formatLastSeen(otherUser.analytics.lastActiveAt),
                isActive,
                isRisky: conversation.metrics.conversationHealth === 'critical' || conversation.metrics.conversationHealth === 'at_risk',
                messages: messages.map(msg => ({
                  id: msg.id,
                  text: msg.content.text,
                  sender: msg.senderId === user.id ? 'me' : 'them', // Show messages from current user as 'me'
                  timestamp: msg.timestamp,
                  quality: msg.analysis.quality === 'engaging' ? 'playful' : msg.analysis.quality
                })),
                metrics: {
                  daysSinceReply: conversation.metrics.daysSinceLastReply,
                  responseRate: conversation.metrics.responseRate,
                  averageDryness: conversation.metrics.averageDryness,
                  ghostScoreTrend: 0
                }
              });
            }
          }
        }

        setConversations(legacyConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?.id]); // Depend on user.id so it reloads when user changes

  // Handle query parameter for auto-selecting conversation
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.some(c => c.id === conversationParam)) {
      setSelectedConversationId(conversationParam);
    }
  }, [searchParams, conversations]);

  // Load autofill suggestions when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      const loadAutofillSuggestions = async () => {
        try {
          const suggs = await supabaseDatabase.generateSuggestions(selectedConversationId, '');
          setAutofillSuggestions(suggs);
          setShowAutofill(true);
        } catch (error) {
          console.error('Error loading autofill suggestions:', error);
        }
      };
      loadAutofillSuggestions();
    } else {
      setAutofillSuggestions([]);
      setShowAutofill(false);
    }
  }, [selectedConversationId]);

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
    // Show suggestions when draft is dry (only if AI assistance is enabled)
    if (aiAssistanceEnabled && dryness.score >= 0.6 && draft.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [dryness.score, draft, aiAssistanceEnabled]);

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedConversation) {
      console.warn('Cannot send message: no draft or no conversation selected');
      return;
    }

    if (!user?.id) {
      console.error('No authenticated user found');
      toast.error('Please log in to send messages');
      return;
    }

    try {
      // Ensure the current user exists in the users table
      await supabaseDatabase.ensureUserExists(user.id, {
        profile: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          alias: user.user_metadata?.full_name || user.email?.split('@')[0] || 'user',
          avatar: user.user_metadata?.avatar_url || '',
          bio: '',
          timezone: 'UTC',
          language: 'en'
        }
      });
      
      const senderId = user.id; // Use current user as sender
      
      // Analyze message dryness
      const drynessScore = analyzeDryness(draft);
      const quality = determineQuality(draft, drynessScore);
      
      // Add message to Supabase database
      await supabaseDatabase.addMessage({
        conversationId: selectedConversation.id,
        senderId: senderId,
        content: {
          text: draft,
          type: 'text'
        },
        timestamp: new Date().toISOString(),
        analysis: {
          quality,
          sentiment: 'positive', // Simplified for now
          intent: 'statement',
          requiresResponse: false,
          urgency: 'low',
          drynessScore
        },
        status: {
          delivered: false,
          read: false,
          edited: false
        }
      });

      // Clear draft
      setDraft('');
      setShowSuggestions(false);
      
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100);
      
      // Refresh the entire conversation list to get updated data
      const supabaseConversations = await supabaseDatabase.getConversations();
      const legacyConversations: any[] = [];

      for (const conversation of supabaseConversations) {
        // Get the first participant as the "other user" for display purposes
        const otherUserId = conversation.participants[0];
        if (otherUserId) {
          const [otherUser, messages] = await Promise.all([
            supabaseDatabase.getUser(otherUserId),
            supabaseDatabase.getMessages({ conversationId: conversation.id })
          ]);
          
          if (otherUser) {
            // Convert to legacy format
            const lastMessage = messages[messages.length - 1];
            const isActive = otherUser.analytics.lastActiveAt && 
              new Date(otherUser.analytics.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            legacyConversations.push({
              id: conversation.id,
              participants: conversation.participants, // Preserve participants field
              name: otherUser.profile.name,
              alias: otherUser.profile.alias,
              avatar: otherUser.profile.avatar,
              ghostScore: conversation.metrics.ghostScore,
              lastMessage: lastMessage?.content.text || '',
              lastSeen: formatLastSeen(otherUser.analytics.lastActiveAt),
              isActive,
              isRisky: conversation.metrics.conversationHealth === 'critical' || conversation.metrics.conversationHealth === 'at_risk',
              messages: messages.map(msg => ({
                id: msg.id,
                text: msg.content.text,
                sender: msg.senderId === user.id ? 'me' : 'them',
                timestamp: msg.timestamp,
                quality: msg.analysis.quality === 'engaging' ? 'playful' : msg.analysis.quality
              })),
              metrics: {
                daysSinceReply: conversation.metrics.daysSinceLastReply,
                responseRate: conversation.metrics.responseRate,
                averageDryness: conversation.metrics.averageDryness,
                ghostScoreTrend: 0
              }
            });
          }
        }
      }

      setConversations(legacyConversations);
      
      // Refresh autofill suggestions
      const newSuggestions = await supabaseDatabase.generateSuggestions(selectedConversation.id, '');
      setAutofillSuggestions(newSuggestions);
      
      // Simulate confetti if ghost score would drop significantly
      if (selectedConversation.ghostScore > 50) {
        triggerConfetti();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setDraft(suggestion);
    setShowSuggestions(false);
  };

  const handleSelectAutofillSuggestion = (suggestion: string) => {
    setDraft(suggestion);
    // Remove the selected suggestion from the list
    setAutofillSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleGenerateSuggestions = async () => {
    if (!selectedConversation) return;
    
    try {
      const lastMessages = selectedConversation.messages.slice(-3).map((m: any) => m.text) || [];
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

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <TopBar onSearch={setSearchQuery} user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Checking authentication...' : 'Loading conversations...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no user after auth loading, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopBar onSearch={setSearchQuery} user={user} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversations */}
        <div className="w-80 border-r border-border flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-border flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto min-h-0">
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
                        {getInitials(conversation.name)}
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {conversation.lastSeen}
                            </span>
                            {conversation.metrics.responseRate < 0.5 && (
                              <span className="text-xs text-orange-500">⚠️ Low response rate</span>
                            )}
                          </div>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {getInitials(selectedConversation.name)}
                    </div>
                    <div>
                      <h2 className="font-semibold">{selectedConversation.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedConversation.lastSeen}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">AI Help</span>
                      <button
                        onClick={() => setAiAssistanceEnabled(!aiAssistanceEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          aiAssistanceEnabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiAssistanceEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <GhostBadge 
                      score={selectedConversation.ghostScore} 
                      showPulse={selectedConversation.ghostScore > 80}
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0" ref={messagesEndRef}>
                <AnimatePresence>
                  {selectedConversation.messages.map((message: any) => (
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
              <div className="p-4 border-t border-border flex-shrink-0">
                <AnimatePresence>
                  {aiAssistanceEnabled && showSuggestions && suggestions.length > 0 && (
                    <DraftCoachBanner
                      suggestions={suggestions}
                      onSelectSuggestion={handleSelectSuggestion}
                    />
                  )}
                </AnimatePresence>

                {/* Autofill Suggestions */}
                <AnimatePresence>
                  {aiAssistanceEnabled && showAutofill && autofillSuggestions.length > 0 && !showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">Smart Suggestions</span>
                        <span className="text-xs text-blue-600">Based on {selectedConversation?.name}'s preferences</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {autofillSuggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectAutofillSuggestion(suggestion)}
                            className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-800 hover:bg-blue-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </motion.div>
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
                          if (selectedConversation) {
                            handleSendMessage();
                          }
                        }
                        if (e.key === 'Escape') {
                          setDraft('');
                          setShowSuggestions(false);
                        }
                      }}
                    />
                    {aiAssistanceEnabled && dryness.score >= 0.6 && draft.trim() && (
                      <div className="absolute -top-8 left-0 text-xs text-amber-400 font-medium">
                        {dryness.label} ({Math.round(dryness.score * 100)}%)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!draft.trim() || !selectedConversation}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    <Send className="w-4 h-4" />
                    {aiAssistanceEnabled && autofillSuggestions.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
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
        {aiAssistanceEnabled && (
          <div className="hidden xl:block w-96 border-l border-border overflow-hidden">
            <div className="h-full overflow-y-auto">
              <AIBox
                currentDraft={draft}
                lastMessages={selectedConversation?.messages.slice(-3).map((m: any) => m.text) || []}
                metrics={selectedConversation?.metrics || { daysSinceReply: 0, responseRate: 0, averageDryness: 0, ghostScoreTrend: 0 }}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for message analysis
function analyzeDryness(text: string): number {
  const dryWords = ['k', 'ok', 'sure', 'yeah', 'fine', 'whatever'];
  const words = text.toLowerCase().split(' ');
  const dryCount = words.filter(word => dryWords.includes(word)).length;
  return Math.min(dryCount / words.length, 1);
}

function determineQuality(text: string, drynessScore: number): 'dry' | 'neutral' | 'playful' | 'engaging' {
  if (drynessScore > 0.7) return 'dry';
  if (drynessScore > 0.4) return 'neutral';
  if (text.includes('!') || text.includes('?')) return 'playful';
  return 'engaging';
}

function formatLastSeen(lastActiveAt: string): string {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return lastActive.toLocaleDateString();
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-primary/20 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-8 bg-primary/20 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
