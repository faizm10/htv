// Hook that provides the new database interface with mock data
// Easy to switch to Supabase later by just changing the import

import { useState, useEffect } from 'react';
import { mockDatabase } from './mock-database-service';
import { User, Conversation, Message, ConversationFilter, MessageFilter } from './database-types';

// Legacy interface for backward compatibility
export interface LegacyConversation {
  id: string;
  name: string;
  alias: string;
  avatar: string;
  ghostScore: number;
  lastMessage: string;
  lastSeen: string;
  isActive: boolean;
  isRisky: boolean;
  messages: LegacyMessage[];
  metrics: {
    daysSinceReply: number;
    responseRate: number;
    averageDryness: number;
    ghostScoreTrend: number;
  };
}

export interface LegacyMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  quality: 'dry' | 'neutral' | 'playful';
}

// Conversion functions
function convertToLegacyConversation(conversation: Conversation, otherUser: User, messages: Message[]): LegacyConversation {
  const lastMessage = messages[messages.length - 1];
  const isActive = otherUser.analytics.lastActiveAt && 
    new Date(otherUser.analytics.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return {
    id: conversation.id,
    name: otherUser.profile.name,
    alias: otherUser.profile.alias,
    avatar: otherUser.profile.avatar,
    ghostScore: conversation.metrics.ghostScore,
    lastMessage: lastMessage?.content.text || '',
    lastSeen: formatLastSeen(otherUser.analytics.lastActiveAt),
    isActive,
    isRisky: conversation.metrics.conversationHealth === 'critical' || conversation.metrics.conversationHealth === 'at_risk',
    messages: messages.map(convertToLegacyMessage),
    metrics: {
      daysSinceReply: conversation.metrics.daysSinceLastReply,
      responseRate: conversation.metrics.responseRate,
      averageDryness: conversation.metrics.averageDryness,
      ghostScoreTrend: 0 // This would need to be calculated from historical data
    }
  };
}

function convertToLegacyMessage(message: Message): LegacyMessage {
  return {
    id: message.id,
    text: message.content.text,
    sender: message.senderId === 'current_user' ? 'me' : 'them',
    timestamp: message.timestamp,
    quality: message.analysis.quality === 'engaging' ? 'playful' : message.analysis.quality
  };
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

// Main hook for legacy compatibility
export function useDemoData(): { conversations: LegacyConversation[], currentConversation: LegacyConversation | null } {
  const [conversations, setConversations] = useState<LegacyConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<LegacyConversation | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Get all conversations for the current user
        const convos = await mockDatabase.getConversations({ userId: 'current_user' });
        const legacyConversations: LegacyConversation[] = [];

        for (const conversation of convos) {
          const otherUserId = conversation.participants.find(id => id !== 'current_user');
          if (otherUserId) {
            const [otherUser, messages] = await Promise.all([
              mockDatabase.getUser(otherUserId),
              mockDatabase.getMessages({ conversationId: conversation.id })
            ]);
            
            if (otherUser) {
              legacyConversations.push(convertToLegacyConversation(conversation, otherUser, messages));
            }
          }
        }

        setConversations(legacyConversations);
        setCurrentConversation(legacyConversations.find(c => c.id === 'conv_jamie') || legacyConversations[0] || null);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
  }, []);

  return { conversations, currentConversation };
}

// Enhanced hook for new database structure
export function useDatabaseData() {
  return {
    // User operations
    getUser: mockDatabase.getUser.bind(mockDatabase),
    updateUser: mockDatabase.updateUser.bind(mockDatabase),
    searchUsers: mockDatabase.searchUsers.bind(mockDatabase),
    
    // Conversation operations
    getConversation: mockDatabase.getConversation.bind(mockDatabase),
    getConversations: mockDatabase.getConversations.bind(mockDatabase),
    createConversation: mockDatabase.createConversation.bind(mockDatabase),
    updateConversation: mockDatabase.updateConversation.bind(mockDatabase),
    
    // Message operations
    getMessages: mockDatabase.getMessages.bind(mockDatabase),
    addMessage: mockDatabase.addMessage.bind(mockDatabase),
    updateMessage: mockDatabase.updateMessage.bind(mockDatabase),
    
    // Analytics operations
    getConversationMetrics: mockDatabase.getConversationMetrics.bind(mockDatabase),
    getUserAnalytics: mockDatabase.getUserAnalytics.bind(mockDatabase),
    generateSuggestions: mockDatabase.generateSuggestions.bind(mockDatabase)
  };
}

// Utility functions for autofill and orchestration
export async function getAutofillSuggestions(conversationId: string, context?: string): Promise<string[]> {
  return mockDatabase.generateSuggestions(conversationId, context || '');
}

export async function getConversationContext(conversationId: string): Promise<{
  conversation: Conversation;
  otherUser: User;
  recentMessages: Message[];
  suggestions: string[];
}> {
  const conversation = await mockDatabase.getConversation(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  const otherUserId = conversation.participants.find(id => id !== 'current_user');
  if (!otherUserId) {
    throw new Error('No other participant found in conversation');
  }

  const otherUser = await mockDatabase.getUser(otherUserId);
  if (!otherUser) {
    throw new Error(`User ${otherUserId} not found`);
  }

  const recentMessages = await mockDatabase.getMessages({ 
    conversationId,
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString()
    }
  });

  const suggestions = await mockDatabase.generateSuggestions(conversationId, context || '');

  return {
    conversation,
    otherUser,
    recentMessages,
    suggestions
  };
}

export async function updateConversationHealth(conversationId: string, newMetrics: Partial<Conversation['metrics']>): Promise<void> {
  const conversation = await mockDatabase.getConversation(conversationId);
  if (!conversation) return;

  const updatedMetrics = {
    ...conversation.metrics,
    ...newMetrics,
    conversationHealth: newMetrics.ghostScore ? 
      (newMetrics.ghostScore > 80 ? 'critical' : 
       newMetrics.ghostScore > 50 ? 'at_risk' : 'healthy') :
      conversation.metrics.conversationHealth
  };

  await mockDatabase.updateConversation(conversationId, { metrics: updatedMetrics });
}
