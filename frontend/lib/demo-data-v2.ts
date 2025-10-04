// Updated demo data using the new database structure
// This provides a bridge between the old interface and new database structure

import { database } from './database-service';
import { Conversation, User, Message } from './database-types';

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
  const isActive = Boolean(otherUser.analytics.lastActiveAt && 
    new Date(otherUser.analytics.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000));
  
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

// Main hook for demo data
export function useDemoData(): { conversations: LegacyConversation[], currentConversation: LegacyConversation | null } {
  // This would normally fetch from the database
  // For now, we'll return the converted legacy format
  
  const conversations: LegacyConversation[] = [];
  
  // Get all conversations for the current user
  database.getConversations({ userId: 'current_user' }).then(convos => {
    convos.forEach(async (conversation) => {
      const otherUserId = conversation.participants.find(id => id !== 'current_user');
      if (otherUserId) {
        const otherUser = await database.getUser(otherUserId);
        const messages = await database.getMessages({ conversationId: conversation.id });
        
        if (otherUser) {
          conversations.push(convertToLegacyConversation(conversation, otherUser, messages));
        }
      }
    });
  });

  return {
    conversations,
    currentConversation: conversations.find(c => c.id === 'conv_jamie') || conversations[0] || null
  };
}

// Enhanced hook for new database structure
export function useDatabaseData() {
  return {
    // User operations
    getUser: database.getUser.bind(database),
    updateUser: database.updateUser.bind(database),
    searchUsers: database.searchUsers.bind(database),
    
    // Conversation operations
    getConversation: database.getConversation.bind(database),
    getConversations: database.getConversations.bind(database),
    createConversation: database.createConversation.bind(database),
    updateConversation: database.updateConversation.bind(database),
    
    // Message operations
    getMessages: database.getMessages.bind(database),
    addMessage: database.addMessage.bind(database),
    updateMessage: database.updateMessage.bind(database),
    
    // Analytics operations
    getConversationMetrics: database.getConversationMetrics.bind(database),
    getUserAnalytics: database.getUserAnalytics.bind(database),
    generateSuggestions: database.generateSuggestions.bind(database)
  };
}

// Utility functions for autofill and orchestration
export async function getAutofillSuggestions(conversationId: string, context?: string): Promise<string[]> {
  return database.generateSuggestions(conversationId, context || '');
}

export async function getConversationContext(conversationId: string, context?: string): Promise<{
  conversation: Conversation;
  otherUser: User;
  recentMessages: Message[];
  suggestions: string[];
}> {
  const conversation = await database.getConversation(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  const otherUserId = conversation.participants.find(id => id !== 'current_user');
  if (!otherUserId) {
    throw new Error('No other participant found in conversation');
  }

  const otherUser = await database.getUser(otherUserId);
  if (!otherUser) {
    throw new Error(`User ${otherUserId} not found`);
  }

  const recentMessages = await database.getMessages({ 
    conversationId,
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString()
    }
  });

  const suggestions = await database.generateSuggestions(conversationId, context || '');

  return {
    conversation,
    otherUser,
    recentMessages,
    suggestions
  };
}

export async function updateConversationHealth(conversationId: string, newMetrics: Partial<Conversation['metrics']>): Promise<void> {
  const conversation = await database.getConversation(conversationId);
  if (!conversation) return;

  const updatedMetrics = {
    ...conversation.metrics,
    ...newMetrics,
    conversationHealth: newMetrics.ghostScore ? 
      (newMetrics.ghostScore > 80 ? 'critical' : 
       newMetrics.ghostScore > 50 ? 'at_risk' : 'healthy') :
      conversation.metrics.conversationHealth
  };

  await database.updateConversation(conversationId, { metrics: updatedMetrics });
}
