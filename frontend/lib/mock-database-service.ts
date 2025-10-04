// Mock database service for HTV Chat Application
// Uses the same interface as the real database but with in-memory mock data
// Easy to swap out for Supabase later

import { 
  User, 
  Conversation, 
  Message, 
  DatabaseService, 
  ConversationFilter, 
  MessageFilter 
} from './database-types';

class MockDatabaseService implements DatabaseService {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const existing = this.users.get(userId);
    if (!existing) {
      throw new Error(`User ${userId} not found`);
    }
    const updated = { ...existing, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  async searchUsers(query: string): Promise<User[]> {
    const results: User[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const user of this.users.values()) {
      if (
        user.profile.name.toLowerCase().includes(searchTerm) ||
        user.profile.alias.toLowerCase().includes(searchTerm) ||
        user.relationship.sharedInterests.some(interest => 
          interest.toLowerCase().includes(searchTerm)
        )
      ) {
        results.push(user);
      }
    }
    
    return results;
  }

  // Conversation operations
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async getConversations(filter?: ConversationFilter): Promise<Conversation[]> {
    let results = Array.from(this.conversations.values());

    if (filter) {
      if (filter.userId) {
        results = results.filter(conv => conv.participants.includes(filter.userId!));
      }
      if (filter.status) {
        results = results.filter(conv => conv.metadata.status === filter.status);
      }
      if (filter.ghostScore) {
        results = results.filter(conv => {
          const score = conv.metrics.ghostScore;
          const min = filter.ghostScore!.min ?? 0;
          const max = filter.ghostScore!.max ?? 100;
          return score >= min && score <= max;
        });
      }
      if (filter.requiresResponse !== undefined) {
        results = results.filter(conv => conv.context.requiresResponse === filter.requiresResponse);
      }
      if (filter.tags && filter.tags.length > 0) {
        results = results.filter(conv => 
          filter.tags!.some(tag => conv.settings.tags.includes(tag))
        );
      }
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        results = results.filter(conv => 
          conv.metadata.title?.toLowerCase().includes(searchTerm) ||
          conv.participants.some(p => {
            const user = this.users.get(p);
            return user?.profile.name.toLowerCase().includes(searchTerm);
          })
        );
      }
    }

    // Sort by last message time
    return results.sort((a, b) => 
      new Date(b.metadata.lastMessageAt).getTime() - new Date(a.metadata.lastMessageAt).getTime()
    );
  }

  async createConversation(conversation: Omit<Conversation, 'id'>): Promise<Conversation> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      ...conversation,
      id,
      metadata: {
        ...conversation.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
    
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const existing = this.conversations.get(conversationId);
    if (!existing) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const updated = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
      }
    };
    
    this.conversations.set(conversationId, updated);
    return updated;
  }

  // Message operations
  async getMessages(filter: MessageFilter): Promise<Message[]> {
    let results: Message[] = [];

    if (filter.conversationId) {
      results = Array.from(this.messages.values())
        .filter(msg => msg.conversationId === filter.conversationId);
    } else {
      results = Array.from(this.messages.values());
    }

    if (filter.senderId) {
      results = results.filter(msg => msg.senderId === filter.senderId);
    }
    if (filter.quality) {
      results = results.filter(msg => msg.analysis.quality === filter.quality);
    }
    if (filter.requiresResponse !== undefined) {
      results = results.filter(msg => msg.analysis.requiresResponse === filter.requiresResponse);
    }
    if (filter.dateRange) {
      const from = new Date(filter.dateRange.from);
      const to = new Date(filter.dateRange.to);
      results = results.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= from && msgDate <= to;
      });
    }

    return results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date().toISOString(),
    };
    
    this.messages.set(id, newMessage);
    
    // Update conversation metadata
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      await this.updateConversation(message.conversationId, {
        metadata: {
          ...conversation.metadata,
          lastMessageAt: newMessage.timestamp,
        },
        metrics: {
          ...conversation.metrics,
          messageCount: conversation.metrics.messageCount + 1,
        }
      });
    }
    
    return newMessage;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    const existing = this.messages.get(messageId);
    if (!existing) {
      throw new Error(`Message ${messageId} not found`);
    }
    
    const updated = {
      ...existing,
      ...updates,
      status: {
        ...existing.status,
        ...updates.status,
        edited: updates.content ? true : existing.status.edited,
        editedAt: updates.content ? new Date().toISOString() : existing.status.editedAt,
      }
    };
    
    this.messages.set(messageId, updated);
    return updated;
  }

  // Analytics operations
  async getConversationMetrics(conversationId: string): Promise<Conversation['metrics']> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return conversation.metrics;
  }

  async getUserAnalytics(userId: string): Promise<User['analytics']> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    return user.analytics;
  }

  async generateSuggestions(conversationId: string, context: string): Promise<string[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];
    
    const otherUserId = conversation.participants.find(id => id !== 'current_user');
    const user = otherUserId ? this.users.get(otherUserId) : null;
    if (!user) return [];
    
    // Simple suggestion logic based on conversation context
    const suggestions = [
      "How's your day going?",
      "What are you up to?",
      "Want to grab coffee sometime?",
      "Hope you're doing well!",
    ];
    
    // Filter based on user preferences
    return suggestions.filter(suggestion => {
      const isPlayful = suggestion.includes('!') || suggestion.includes('?');
      return user.preferences.communicationStyle === 'playful' || !isPlayful;
    });
  }

  // Initialize mock data
  private initializeMockData() {
    // Mock users
    const users: User[] = [
      {
        id: 'user_jamie',
        profile: {
          name: 'Jamie Chen',
          alias: 'jamie_chen',
          avatar: 'JC',
          bio: 'Software engineer, loves hiking and coffee',
          timezone: 'PST',
          language: 'en'
        },
        preferences: {
          responseTime: 'within_day',
          communicationStyle: 'casual',
          preferredTopics: ['technology', 'hiking', 'coffee'],
          avoidTopics: ['politics'],
          ghostingTolerance: 85
        },
        analytics: {
          averageResponseTime: 24,
          responseRate: 0.12,
          messageFrequency: 'low',
          engagementScore: 25,
          lastActiveAt: '2024-01-15T16:20:00Z'
        },
        relationship: {
          closeness: 'friend',
          metIn: 'work',
          sharedInterests: ['technology', 'hiking'],
          mutualConnections: ['user_alex']
        }
      },
      {
        id: 'user_alex',
        profile: {
          name: 'Alex Rodriguez',
          alias: 'alex_r',
          avatar: 'AR',
          bio: 'Marketing manager, foodie and travel enthusiast',
          timezone: 'EST',
          language: 'en'
        },
        preferences: {
          responseTime: 'immediate',
          communicationStyle: 'playful',
          preferredTopics: ['food', 'travel', 'movies'],
          avoidTopics: [],
          ghostingTolerance: 20
        },
        analytics: {
          averageResponseTime: 2,
          responseRate: 0.78,
          messageFrequency: 'high',
          engagementScore: 85,
          lastActiveAt: new Date().toISOString()
        },
        relationship: {
          closeness: 'close_friend',
          metIn: 'school',
          sharedInterests: ['food', 'travel', 'movies'],
          mutualConnections: ['user_jamie']
        }
      },
      {
        id: 'user_taylor',
        profile: {
          name: 'Taylor Swift',
          alias: 'taylor_s',
          avatar: 'TS',
          bio: 'Music producer and concert enthusiast',
          timezone: 'EST',
          language: 'en'
        },
        preferences: {
          responseTime: 'immediate',
          communicationStyle: 'playful',
          preferredTopics: ['music', 'concerts', 'entertainment'],
          avoidTopics: [],
          ghostingTolerance: 15
        },
        analytics: {
          averageResponseTime: 0.5,
          responseRate: 0.89,
          messageFrequency: 'high',
          engagementScore: 90,
          lastActiveAt: '2024-01-20T16:02:00Z'
        },
        relationship: {
          closeness: 'close_friend',
          metIn: 'online',
          sharedInterests: ['music', 'concerts'],
          mutualConnections: []
        }
      },
      // Laura - Hiking and photography enthusiast
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        profile: {
          name: 'Laura',
          alias: 'Laura',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Love hiking and photography 📸',
          timezone: 'PST',
          language: 'en'
        },
        preferences: {
          responseTime: 'within_hour',
          communicationStyle: 'casual',
          preferredTopics: ['hiking', 'photography', 'travel'],
          avoidTopics: ['politics'],
          ghostingTolerance: 75
        },
        analytics: {
          averageResponseTime: 2.5,
          responseRate: 0.85,
          messageFrequency: 'high',
          engagementScore: 80,
          lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'close_friend',
          metIn: 'school',
          sharedInterests: ['hiking', 'photography', 'nature'],
          mutualConnections: ['550e8400-e29b-41d4-a716-446655440002']
        }
      },
      // Faiz - Software engineer and coffee enthusiast
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        profile: {
          name: 'Faiz',
          alias: 'Faiz',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Software engineer and coffee enthusiast ☕',
          timezone: 'EST',
          language: 'en'
        },
        preferences: {
          responseTime: 'within_day',
          communicationStyle: 'professional',
          preferredTopics: ['technology', 'coffee', 'coding'],
          avoidTopics: ['gossip'],
          ghostingTolerance: 60
        },
        analytics: {
          averageResponseTime: 4.2,
          responseRate: 0.70,
          messageFrequency: 'medium',
          engagementScore: 65,
          lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'close_friend',
          metIn: 'work',
          sharedInterests: ['technology', 'coffee', 'coding'],
          mutualConnections: ['550e8400-e29b-41d4-a716-446655440001']
        }
      },
      // Smith - Musician and dog lover
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        profile: {
          name: 'Smith',
          alias: 'Smith',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Musician and dog lover 🎵🐕',
          timezone: 'GMT',
          language: 'en'
        },
        preferences: {
          responseTime: 'flexible',
          communicationStyle: 'playful',
          preferredTopics: ['music', 'dogs', 'art'],
          avoidTopics: ['work_stress'],
          ghostingTolerance: 80
        },
        analytics: {
          averageResponseTime: 6.8,
          responseRate: 0.45,
          messageFrequency: 'low',
          engagementScore: 55,
          lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'acquaintance',
          metIn: 'social',
          sharedInterests: ['music', 'art', 'creativity'],
          mutualConnections: ['550e8400-e29b-41d4-a716-446655440004']
        }
      },
      // Wosly - Artist and yoga instructor
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        profile: {
          name: 'Wosly',
          alias: 'Wosly',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          bio: 'Artist and yoga instructor 🧘‍♀️',
          timezone: 'PST',
          language: 'en'
        },
        preferences: {
          responseTime: 'immediate',
          communicationStyle: 'casual',
          preferredTopics: ['art', 'yoga', 'wellness'],
          avoidTopics: ['negative_news'],
          ghostingTolerance: 90
        },
        analytics: {
          averageResponseTime: 1.2,
          responseRate: 0.95,
          messageFrequency: 'high',
          engagementScore: 95,
          lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        relationship: {
          closeness: 'close_friend',
          metIn: 'online',
          sharedInterests: ['art', 'yoga', 'wellness', 'music'],
          mutualConnections: ['550e8400-e29b-41d4-a716-446655440003']
        }
      },
      // Add current_user for testing
      {
        id: 'current_user',
        profile: {
          name: 'Current User',
          alias: 'current_user',
          avatar: 'CU',
          bio: 'Chat app user',
          timezone: 'PST',
          language: 'en'
        },
        preferences: {
          responseTime: 'within_hour',
          communicationStyle: 'casual',
          preferredTopics: ['general'],
          avoidTopics: [],
          ghostingTolerance: 70
        },
        analytics: {
          totalMessages: 10,
          averageResponseTime: 2.0,
          lastActiveAt: '2024-01-21T16:00:00Z',
          activeDays: 5,
          messageFrequency: 'medium'
        },
        relationship: {
          closeness: 'friend',
          metIn: 'online',
          relationshipLength: '1_year',
          interactionPattern: 'regular'
        }
      }
    ];

    // Mock conversations
    const conversations: Conversation[] = [
      {
        id: 'conv_jamie',
        participants: ['current_user', 'user_jamie'],
        metadata: {
          title: 'Jamie Chen',
          type: 'direct',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T16:20:00Z',
          lastMessageAt: '2024-01-15T16:20:00Z'
        },
        context: {
          currentTopic: 'weekend plans',
          mood: 'neutral',
          urgency: 'low',
          requiresResponse: false,
          suggestedActions: ['follow_up', 'change_topic', 'schedule_meeting']
        },
        metrics: {
          ghostScore: 92,
          responseRate: 0.12,
          averageDryness: 0.85,
          daysSinceLastReply: 63,
          messageCount: 6,
          conversationHealth: 'critical'
        },
        settings: {
          notifications: true,
          autoReply: false,
          priority: 'high',
          tags: ['work', 'risky', 'needs_attention']
        }
      },
      {
        id: 'conv_alex',
        participants: ['current_user', 'user_alex'],
        metadata: {
          title: 'Alex Rodriguez',
          type: 'direct',
          status: 'active',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString()
        },
        context: {
          currentTopic: 'weekend plans',
          mood: 'positive',
          urgency: 'medium',
          requiresResponse: true,
          suggestedActions: ['confirm_time', 'suggest_location']
        },
        metrics: {
          ghostScore: 23,
          responseRate: 0.78,
          averageDryness: 0.25,
          daysSinceLastReply: 0,
          messageCount: 4,
          conversationHealth: 'healthy'
        },
        settings: {
          notifications: true,
          autoReply: false,
          priority: 'normal',
          tags: ['friend', 'active', 'weekend_plans']
        }
      },
      {
        id: 'conv_taylor',
        participants: ['current_user', 'user_taylor'],
        metadata: {
          title: 'Taylor Swift',
          type: 'direct',
          status: 'active',
          createdAt: '2024-01-20T14:00:00Z',
          updatedAt: '2024-01-20T16:02:00Z',
          lastMessageAt: '2024-01-20T16:02:00Z'
        },
        context: {
          currentTopic: 'concert tickets',
          mood: 'positive',
          urgency: 'low',
          requiresResponse: false,
          suggestedActions: ['plan_details', 'share_excitement']
        },
        metrics: {
          ghostScore: 15,
          responseRate: 0.89,
          averageDryness: 0.18,
          daysSinceLastReply: 0,
          messageCount: 2,
          conversationHealth: 'healthy'
        },
        settings: {
          notifications: true,
          autoReply: false,
          priority: 'normal',
          tags: ['friend', 'music', 'excited']
        }
      },
      // Laura & Faiz conversation - Hiking plans
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        participants: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
        metadata: {
          title: 'Laura & Faiz',
          type: 'direct',
          status: 'active',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        context: {
          currentTopic: 'weekend plans',
          mood: 'positive',
          urgency: 'low',
          requiresResponse: true,
          suggestedActions: ['confirm_time', 'suggest_location']
        },
        metrics: {
          ghostScore: 25,
          responseRate: 0.85,
          averageDryness: 2.3,
          daysSinceLastReply: 0,
          messageCount: 3,
          conversationHealth: 'healthy'
        },
        settings: {
          notifications: true,
          autoReply: false,
          priority: 'normal',
          tags: ['friends', 'weekend-plans', 'hiking']
        }
      },
      // Smith & Wosly conversation - Music collaboration
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        participants: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'],
        metadata: {
          title: 'Smith & Wosly',
          type: 'direct',
          status: 'active',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        context: {
          currentTopic: 'music collaboration',
          mood: 'positive',
          urgency: 'medium',
          requiresResponse: true,
          suggestedActions: ['plan_details', 'share_excitement']
        },
        metrics: {
          ghostScore: 15,
          responseRate: 0.95,
          averageDryness: 1.8,
          daysSinceLastReply: 0,
          messageCount: 3,
          conversationHealth: 'healthy'
        },
        settings: {
          notifications: true,
          autoReply: false,
          priority: 'high',
          tags: ['music', 'collaboration', 'creative']
        }
      }
    ];

    // Mock messages
    const messages: Message[] = [
      // Jamie conversation
      {
        id: 'msg_jamie_1',
        conversationId: 'conv_jamie',
        senderId: 'current_user',
        content: { text: 'Hey Jamie! How was your weekend?', type: 'text' },
        timestamp: '2024-01-15T10:30:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.1
        },
        status: { delivered: true, read: true, readAt: '2024-01-15T11:00:00Z', edited: false }
      },
      {
        id: 'msg_jamie_2',
        conversationId: 'conv_jamie',
        senderId: 'user_jamie',
        content: { text: 'good', type: 'text' },
        timestamp: '2024-01-15T11:45:00Z',
        analysis: {
          quality: 'dry',
          sentiment: 'neutral',
          intent: 'response',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.9
        },
        status: { delivered: true, read: true, readAt: '2024-01-15T12:00:00Z', edited: false }
      },
      {
        id: 'msg_jamie_3',
        conversationId: 'conv_jamie',
        senderId: 'current_user',
        content: { text: 'That sounds nice! Did you do anything fun?', type: 'text' },
        timestamp: '2024-01-15T12:00:00Z',
        analysis: {
          quality: 'neutral',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.2
        },
        status: { delivered: true, read: true, readAt: '2024-01-15T12:15:00Z', edited: false }
      },
      {
        id: 'msg_jamie_4',
        conversationId: 'conv_jamie',
        senderId: 'user_jamie',
        content: { text: 'not really', type: 'text' },
        timestamp: '2024-01-15T12:15:00Z',
        analysis: {
          quality: 'dry',
          sentiment: 'neutral',
          intent: 'response',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.8
        },
        status: { delivered: true, read: true, readAt: '2024-01-15T12:30:00Z', edited: false }
      },
      {
        id: 'msg_jamie_5',
        conversationId: 'conv_jamie',
        senderId: 'current_user',
        content: { text: 'Want to grab coffee this week? I know a great place downtown', type: 'text' },
        timestamp: '2024-01-15T14:30:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.1
        },
        status: { delivered: true, read: true, readAt: '2024-01-15T15:00:00Z', edited: false }
      },
      {
        id: 'msg_jamie_6',
        conversationId: 'conv_jamie',
        senderId: 'user_jamie',
        content: { text: 'k', type: 'text' },
        timestamp: '2024-01-15T16:20:00Z',
        analysis: {
          quality: 'dry',
          sentiment: 'neutral',
          intent: 'response',
          requiresResponse: false,
          urgency: 'low',
          drynessScore: 1.0
        },
        status: { delivered: true, read: false, edited: false }
      },
      // Alex conversation
      {
        id: 'msg_alex_1',
        conversationId: 'conv_alex',
        senderId: 'current_user',
        content: { text: 'Hey Alex! Want to catch up this weekend?', type: 'text' },
        timestamp: '2024-01-20T09:00:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.2
        },
        status: { delivered: true, read: true, readAt: '2024-01-20T09:10:00Z', edited: false }
      },
      {
        id: 'msg_alex_2',
        conversationId: 'conv_alex',
        senderId: 'user_alex',
        content: { text: 'Absolutely! I\'d love to catch up. What did you have in mind?', type: 'text' },
        timestamp: '2024-01-20T09:15:00Z',
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'response',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.1
        },
        status: { delivered: true, read: true, readAt: '2024-01-20T09:20:00Z', edited: false }
      },
      {
        id: 'msg_alex_3',
        conversationId: 'conv_alex',
        senderId: 'current_user',
        content: { text: 'Maybe that new ramen place downtown? Or we could do something outdoors if the weather is nice', type: 'text' },
        timestamp: '2024-01-20T09:30:00Z',
        analysis: {
          quality: 'neutral',
          sentiment: 'positive',
          intent: 'statement',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.3
        },
        status: { delivered: true, read: true, readAt: '2024-01-20T09:45:00Z', edited: false }
      },
      {
        id: 'msg_alex_4',
        conversationId: 'conv_alex',
        senderId: 'user_alex',
        content: { text: 'Sounds great! What time works for you?', type: 'text' },
        timestamp: new Date().toISOString(),
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.2
        },
        status: { delivered: true, read: false, edited: false }
      },
      // Taylor conversation
      {
        id: 'msg_taylor_1',
        conversationId: 'conv_taylor',
        senderId: 'current_user',
        content: { text: 'Taylor! I got tickets to that concert you wanted to see!', type: 'text' },
        timestamp: '2024-01-20T14:00:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'statement',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.1
        },
        status: { delivered: true, read: true, readAt: '2024-01-20T14:01:00Z', edited: false }
      },
      {
        id: 'msg_taylor_2',
        conversationId: 'conv_taylor',
        senderId: 'user_taylor',
        content: { text: 'That sounds amazing! I\'m so excited! 🎉', type: 'text' },
        timestamp: '2024-01-20T16:02:00Z',
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'response',
          requiresResponse: false,
          urgency: 'low',
          drynessScore: 0.0
        },
        status: { delivered: true, read: false, edited: false }
      },
      // Laura & Faiz conversation messages
      {
        id: 'msg_laura_faiz_1',
        conversationId: '650e8400-e29b-41d4-a716-446655440001',
        senderId: '550e8400-e29b-41d4-a716-446655440001',
        content: { text: "Hey Faiz! How's your week going?", type: 'text' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 1.2
        },
        status: { delivered: true, read: true, readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), edited: false }
      },
      {
        id: 'msg_laura_faiz_2',
        conversationId: '650e8400-e29b-41d4-a716-446655440001',
        senderId: '550e8400-e29b-41d4-a716-446655440002',
        content: { text: "Pretty good! Just finished a big project. How about you?", type: 'text' },
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'statement',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 1.5
        },
        status: { delivered: true, read: true, readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), edited: false }
      },
      {
        id: 'msg_laura_faiz_3',
        conversationId: '650e8400-e29b-41d4-a716-446655440001',
        senderId: 'laura_id',
        content: { text: "Nice! I'm thinking of going hiking this weekend. Want to join?", type: 'text' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.8
        },
        status: { delivered: true, read: false, edited: false }
      },
      // Smith & Wosly conversation messages
      {
        id: 'msg_smith_wosly_1',
        conversationId: '650e8400-e29b-41d4-a716-446655440002',
        senderId: '550e8400-e29b-41d4-a716-446655440004',
        content: { text: "Smith! I just had the most amazing idea for our song 🎵", type: 'text' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'statement',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.5
        },
        status: { delivered: true, read: true, readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), edited: false }
      },
      {
        id: 'msg_smith_wosly_2',
        conversationId: '650e8400-e29b-41d4-a716-446655440002',
        senderId: '550e8400-e29b-41d4-a716-446655440003',
        content: { text: "Ooh tell me more! I'm all ears 👂", type: 'text' },
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.3
        },
        status: { delivered: true, read: true, readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), edited: false }
      },
      {
        id: 'msg_smith_wosly_3',
        conversationId: '650e8400-e29b-41d4-a716-446655440002',
        senderId: '550e8400-e29b-41d4-a716-446655440004',
        content: { text: "What if we add some nature sounds to the intro? Like birds chirping and water flowing 🌊", type: 'text' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'statement',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.7
        },
        status: { delivered: true, read: false, edited: false }
      }
    ];

    // Populate maps
    users.forEach(user => this.users.set(user.id, user));
    conversations.forEach(conv => this.conversations.set(conv.id, conv));
    messages.forEach(msg => this.messages.set(msg.id, msg));
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabaseService();
