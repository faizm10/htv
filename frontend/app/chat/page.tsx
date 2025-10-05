'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Filter, Search, Send, BarChart3 } from 'lucide-react';
import { GhostBadge } from '@/components/ui/ghost-badge';
import { MessageBubble } from '@/components/ui/message-bubble';
import { DraftCoachBanner } from '@/components/ui/draft-coach-banner';
import { AIBox } from '@/components/ui/ai-box';
import { TopBar } from '@/components/ui/top-bar';
import { InviteGenerator } from '@/components/invite-generator';
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

type FilterType = 'all' | 'ghosted';

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
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [newMessages, setNewMessages] = useState<any[]>([]);
  const [isNewMessageArriving, setIsNewMessageArriving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Helper function to calculate how long someone has been left on "delivered"
  const calculateDeliveredTime = (messages: any[], currentUserId: string) => {
    if (!messages || messages.length === 0) return null;
    
    // Find the last message that was sent TO the current user (not by them)
    const lastIncomingMessage = messages
      .filter(msg => msg.sender === 'them')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (!lastIncomingMessage) return null;
    
    // Check if there's a response after this message
    const lastOutgoingMessage = messages
      .filter(msg => msg.sender === 'me')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    // If no outgoing message or the incoming message is newer, they're left on delivered
    if (!lastOutgoingMessage || new Date(lastIncomingMessage.timestamp) > new Date(lastOutgoingMessage.timestamp)) {
      const now = new Date();
      const deliveredTime = new Date(lastIncomingMessage.timestamp);
      const diffMs = now.getTime() - deliveredTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      return {
        hours: Math.floor(diffHours),
        days: Math.floor(diffDays),
        totalHours: diffHours,
        totalDays: diffDays
      };
    }
    
    return null;
  };

  // Helper function to get color based on delivered time
  const getDeliveredTimeColor = (deliveredTime: any) => {
    if (!deliveredTime) return 'text-muted-foreground';
    
    if (deliveredTime.totalDays >= 7) return 'text-red-500'; // More than 1 week - red
    if (deliveredTime.totalDays >= 3) return 'text-orange-500'; // 3-7 days - orange
    if (deliveredTime.totalDays >= 1) return 'text-yellow-500'; // 1-3 days - yellow
    if (deliveredTime.totalHours >= 6) return 'text-blue-500'; // 6-24 hours - blue
    return 'text-green-500'; // Less than 6 hours - green
  };

  // Helper function to format delivered time
  const formatDeliveredTime = (deliveredTime: any) => {
    if (!deliveredTime) return null;
    
    if (deliveredTime.days > 0) {
      return `${deliveredTime.days}d ${deliveredTime.hours % 24}h`;
    } else if (deliveredTime.hours > 0) {
      return `${deliveredTime.hours}h`;
    } else {
      const minutes = Math.floor(deliveredTime.totalHours * 60);
      return `${minutes}m`;
    }
  };

  // Function to refresh conversations (for real-time updates)
  const refreshConversations = async (showIndicator = false) => {
    if (!user?.id) return;

    try {
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
            
            // Calculate delivered time for this conversation
            const deliveredTime = calculateDeliveredTime(
              messages.map(msg => ({
                id: msg.id,
                text: msg.content.text,
                sender: msg.senderId === user.id ? 'me' : 'them',
                timestamp: msg.timestamp,
                quality: msg.analysis.quality === 'engaging' ? 'playful' : msg.analysis.quality
              })), 
              user.id
            );
            
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
              deliveredTime, // Add delivered time tracking
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

      // Check if there are new messages and handle smooth appearance
      if (showIndicator && selectedConversationId) {
        const currentConversation = legacyConversations.find(c => c.id === selectedConversationId);
        if (currentConversation && currentConversation.messages.length > lastMessageCount) {
          // Get the new messages that just arrived
          const newMessagesArrived = currentConversation.messages.slice(lastMessageCount);
          
          // Only show animation for messages from "them" (incoming messages)
          const incomingNewMessages = newMessagesArrived.filter((msg: any) => msg.sender === 'them');
          
          if (incomingNewMessages.length > 0) {
            setIsNewMessageArriving(true);
            setNewMessages(incomingNewMessages);
            
            // Show the new message indicator
            setNewMessageIndicator(true);
            
            // Play subtle notification sound (if supported)
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
              audio.volume = 0.3;
              audio.play().catch(() => {}); // Ignore errors if audio is blocked
            } catch (e) {
              // Ignore audio errors
            }
            
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
              scrollToBottom();
            }, 200);
            
            // Clear the new message state after animation
            setTimeout(() => {
              setIsNewMessageArriving(false);
              setNewMessages([]);
            }, 1000);
            
            // Auto-hide indicator after 3 seconds
            setTimeout(() => setNewMessageIndicator(false), 3000);
          }
        }
      }

      setConversations(legacyConversations);
      setLastMessageCount(selectedConversation?.messages?.length || 0);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  // Load conversations from Supabase after user is authenticated
  useEffect(() => {
    if (!user?.id) return; // Don't load conversations until user is authenticated

    const loadConversations = async () => {
      try {
        setLoading(true);
        await refreshConversations();
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Set up real-time polling for new messages (every 3 seconds)
    refreshIntervalRef.current = setInterval(() => {
      refreshConversations(true); // Show indicator for new messages
    }, 3000);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
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
      case 'ghosted':
        // Filter for conversations left on delivered for more than 1 week
        return conversation.deliveredTime && conversation.deliveredTime.totalDays >= 7 && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  // useEffect(() => {
  //   // Show suggestions when draft is dry (only if AI assistance is enabled)
  //   if (aiAssistanceEnabled && dryness.score >= 0.6 && draft.trim()) {
  //     setShowSuggestions(true);
  //   } else {
  //     setShowSuggestions(false);
  //   }
  // }, [dryness.score, draft, aiAssistanceEnabled]);

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
      
      // Refresh conversations to show the new message
      await refreshConversations();
      
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
                { id: 'ghosted', label: 'Ghosted', count: conversations.filter(c => c.deliveredTime && c.deliveredTime.totalDays >= 7).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
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
        <motion.button
          key={conversation.id}
          onClick={() => handleConversationSelect(conversation.id)}
          className={`w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/20 transition-all duration-200 text-left group ${
            selectedConversationId === conversation.id 
              ? 'bg-gradient-to-r from-primary/15 to-primary/10 border-2 border-primary/30 shadow-lg' 
              : 'border border-transparent hover:border-border/50 hover:shadow-md'
          } ${
            conversation.messages && conversation.messages.length > 0 && 
            conversation.messages[conversation.messages.length - 1]?.sender === 'them'
              ? 'ring-2 ring-blue-500/20 bg-gradient-to-r from-blue-500/5 to-primary/5'
              : ''
          }`}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: conversation.messages && conversation.messages.length > 0 && 
                   conversation.messages[conversation.messages.length - 1]?.sender === 'them' 
                   ? [1, 1.01, 1] : 1
          }}
          transition={{ 
            duration: 0.2,
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
                    <div className="flex items-center gap-4">
                      {/* Avatar with fun styling */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          conversation.ghostScore > 70 
                            ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg' 
                            : conversation.ghostScore > 40 
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md'
                            : 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-sm'
                        }`}>
                          {getInitials(conversation.name)}
                        </div>
                        {conversation.isActive && (
                          <motion.div 
                            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Name with fun styling */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                            {conversation.name}
                          </span>
                          {/* New message indicator - subtle blue dot */}
                          {conversation.messages && conversation.messages.length > 0 && 
                           conversation.messages[conversation.messages.length - 1]?.sender === 'them' && (
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                          {conversation.deliveredTime && conversation.deliveredTime.totalDays >= 7 && (
                            <motion.span 
                              className="text-lg"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              👻
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Last message with better styling */}
                        <p className="text-sm text-muted-foreground truncate mb-2 group-hover:text-foreground transition-colors">
                          {conversation.lastMessage || "No messages yet..."}
                        </p>
                        
                        {/* Status indicators with fun styling */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                              {conversation.lastSeen}
                            </span>
                            {conversation.deliveredTime && (
                              <motion.span 
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${getDeliveredTimeColor(conversation.deliveredTime)} bg-current/10`}
                                whileHover={{ scale: 1.1 }}
                              >
                                📱 {formatDeliveredTime(conversation.deliveredTime)}
                              </motion.span>
                            )}
                          </div>
                          
                          {/* Fun status emoji based on delivered time */}
                          <div className="text-lg">
                            {conversation.deliveredTime ? (
                              conversation.deliveredTime.totalDays >= 7 ? (
                                <motion.span
                                  animate={{ rotate: [0, -15, 15, 0] }}
                                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                                >
                                  💀
                                </motion.span>
                              ) : conversation.deliveredTime.totalDays >= 3 ? (
                                <motion.span
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  😰
                                </motion.span>
                              ) : conversation.deliveredTime.totalDays >= 1 ? (
                                <motion.span
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  😟
                                </motion.span>
                              ) : conversation.deliveredTime.totalHours >= 6 ? (
                                <motion.span
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  😐
                                </motion.span>
                              ) : (
                                <motion.span
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 4, repeat: Infinity }}
                                >
                                  😊
                                </motion.span>
                              )
                            ) : (
                              <motion.span
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                😊
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
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
                  </div>
                </div>
              </div>

              {/* New Message Indicator */}
              <AnimatePresence>
                {newMessageIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg mx-4 mb-2 p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-primary text-sm">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-3 h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                      />
                      <span className="font-medium">New message from {selectedConversation?.name}</span>
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-xs"
                      >
                        ✨
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-0 min-h-0" ref={messagesEndRef}>
                <AnimatePresence>
                  {selectedConversation.messages.map((message: any, index: number) => (
                    <MessageBubble
                      key={message.id}
                      text={message.text}
                      sender={message.sender}
                      timestamp={message.timestamp}
                      showTimestamp={shouldShowTimestamp(index, selectedConversation.messages)}
                    />
                  ))}
                  
                  {/* New incoming messages with smooth animation */}
                  {isNewMessageArriving && newMessages.map((message: any, index: number) => (
                    <motion.div
                      key={`new-${message.id}-${index}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className="mb-2"
                    >
                      <MessageBubble
                        text={message.text}
                        sender={message.sender}
                        timestamp={message.timestamp}
                        showTimestamp={true}
                      />
                    </motion.div>
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
                    {/* {aiAssistanceEnabled && dryness.score >= 0.6 && draft.trim() && (
                      <div className="absolute -top-8 left-0 text-xs text-amber-400 font-medium">
                        {dryness.label} ({Math.round(dryness.score * 100)}%)
                      </div>
                    )} */}
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
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                className="text-center max-w-md w-full space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <Ghost className="w-24 h-24 mx-auto mb-6 text-primary/50" />
                  <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose a chat from the sidebar to start managing your ghosting risks
                  </p>
                </div>
                
                <div className="border-t border-border pt-8">
                  <h3 className="text-lg font-medium mb-4">Or invite someone new</h3>
                  <InviteGenerator />
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Panel - Alex */}
        {aiAssistanceEnabled && selectedConversation && (
          <div className="hidden xl:block w-96 border-l border-border overflow-hidden">
            <div className="h-full overflow-y-auto">
              <AIBox
                currentDraft={draft}
                lastMessages={selectedConversation?.messages.slice(-3).map((m: any) => m.text) || []}
                metrics={selectedConversation?.metrics || { daysSinceReply: 0, responseRate: 0, averageDryness: 0, ghostScoreTrend: 0 }}
                conversationId={selectedConversationId || undefined}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to determine if timestamp should be shown
function shouldShowTimestamp(messageIndex: number, messages: any[]): boolean {
  if (messageIndex === 0) return true; // Always show for first message
  
  const currentMessage = new Date(messages[messageIndex].timestamp);
  const previousMessage = new Date(messages[messageIndex - 1].timestamp);
  const diffMs = currentMessage.getTime() - previousMessage.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours >= 1; // Show if more than 1 hour apart
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

function formatLastSeen(lastActiveAt: string | null): string {
  if (!lastActiveAt) return 'never';
  
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