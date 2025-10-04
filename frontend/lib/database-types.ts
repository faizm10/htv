// Database Types for HTV Chat Application
// Separates concerns: Users, Conversations, and Messages for better orchestration

export interface User {
  id: string;
  profile: {
    name: string;
    alias: string;
    avatar: string;
    bio?: string;
    timezone?: string;
    language?: string;
  };
  preferences: {
    responseTime: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
    communicationStyle: 'formal' | 'casual' | 'playful' | 'professional';
    preferredTopics: string[];
    avoidTopics: string[];
    ghostingTolerance: number; // 0-100, higher = more tolerant
  };
  analytics: {
    averageResponseTime: number; // in hours
    responseRate: number; // 0-1
    messageFrequency: 'high' | 'medium' | 'low';
    engagementScore: number; // 0-100
    lastActiveAt: string;
  };
  relationship: {
    closeness: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
    metIn: 'online' | 'work' | 'school' | 'social' | 'other';
    sharedInterests: string[];
    mutualConnections: string[]; // user IDs
  };
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  metadata: {
    title?: string;
    type: 'direct' | 'group';
    status: 'active' | 'paused' | 'archived';
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
  };
  context: {
    currentTopic?: string;
    mood: 'positive' | 'neutral' | 'negative' | 'mixed';
    urgency: 'low' | 'medium' | 'high';
    requiresResponse: boolean;
    suggestedActions: string[];
  };
  metrics: {
    ghostScore: number; // 0-100, higher = more likely to ghost
    responseRate: number; // 0-1
    averageDryness: number; // 0-1
    daysSinceLastReply: number;
    messageCount: number;
    conversationHealth: 'healthy' | 'at_risk' | 'critical';
  };
  settings: {
    notifications: boolean;
    autoReply: boolean;
    priority: 'low' | 'normal' | 'high';
    tags: string[];
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: {
    text: string;
    type: 'text' | 'image' | 'link' | 'emoji' | 'voice';
    metadata?: {
      url?: string;
      filename?: string;
      duration?: number;
      size?: number;
    };
  };
  timestamp: string;
  analysis: {
    quality: 'dry' | 'neutral' | 'playful' | 'engaging';
    sentiment: 'positive' | 'neutral' | 'negative';
    intent: 'question' | 'statement' | 'request' | 'response' | 'greeting' | 'goodbye';
    requiresResponse: boolean;
    urgency: 'low' | 'medium' | 'high';
    drynessScore: number; // 0-1
  };
  status: {
    delivered: boolean;
    read: boolean;
    readAt?: string;
    edited: boolean;
    editedAt?: string;
  };
  suggestions?: {
    autoReply?: string[];
    followUp?: string[];
    contextAware?: string[];
  };
}

// Database query and filter types
export interface ConversationFilter {
  userId?: string;
  status?: Conversation['metadata']['status'];
  ghostScore?: {
    min?: number;
    max?: number;
  };
  requiresResponse?: boolean;
  tags?: string[];
  search?: string;
}

export interface MessageFilter {
  conversationId?: string;
  senderId?: string;
  quality?: Message['analysis']['quality'];
  requiresResponse?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Database service interface
export interface DatabaseService {
  // User operations
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  
  // Conversation operations
  getConversation(conversationId: string): Promise<Conversation | null>;
  getConversations(filter?: ConversationFilter): Promise<Conversation[]>;
  createConversation(conversation: Omit<Conversation, 'id'>): Promise<Conversation>;
  updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation>;
  
  // Message operations
  getMessages(filter: MessageFilter): Promise<Message[]>;
  addMessage(message: Omit<Message, 'id'>): Promise<Message>;
  updateMessage(messageId: string, updates: Partial<Message>): Promise<Message>;
  
  // Analytics operations
  getConversationMetrics(conversationId: string): Promise<Conversation['metrics']>;
  getUserAnalytics(userId: string): Promise<User['analytics']>;
  generateSuggestions(conversationId: string, context: string): Promise<string[]>;
}
