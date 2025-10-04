import { 
  User, 
  Conversation, 
  Message, 
  DatabaseService, 
  ConversationFilter, 
  MessageFilter 
} from './database-types';

// In-memory database implementation (replace with real database in production)
class InMemoryDatabase implements DatabaseService {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private conversationMessages: Map<string, string[]> = new Map(); // conversationId -> messageIds

  constructor() {
    this.initializeSampleData();
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
    this.conversationMessages.set(id, []);
    
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
      const messageIds = this.conversationMessages.get(filter.conversationId) || [];
      results = messageIds.map(id => this.messages.get(id)!).filter(Boolean);
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
    
    // Add to conversation's message list
    const conversationMessages = this.conversationMessages.get(message.conversationId) || [];
    conversationMessages.push(id);
    this.conversationMessages.set(message.conversationId, conversationMessages);
    
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
    // This would integrate with AI service for context-aware suggestions
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];
    
    const user = this.users.get(conversation.participants[0]);
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

  // Initialize sample data
  private initializeSampleData() {
    // Sample users
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
      }
    ];

    // Sample conversations
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
      }
    ];

    // Sample messages
    const messages: Message[] = [
      // Jamie conversation messages
      {
        id: 'msg_1',
        conversationId: 'conv_jamie',
        senderId: 'current_user',
        content: {
          text: 'Hey Jamie! How was your weekend?',
          type: 'text'
        },
        timestamp: '2024-01-15T10:30:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.1
        },
        status: {
          delivered: true,
          read: true,
          readAt: '2024-01-15T11:00:00Z',
          edited: false
        }
      },
      {
        id: 'msg_2',
        conversationId: 'conv_jamie',
        senderId: 'user_jamie',
        content: {
          text: 'good',
          type: 'text'
        },
        timestamp: '2024-01-15T11:45:00Z',
        analysis: {
          quality: 'dry',
          sentiment: 'neutral',
          intent: 'response',
          requiresResponse: true,
          urgency: 'low',
          drynessScore: 0.9
        },
        status: {
          delivered: true,
          read: true,
          readAt: '2024-01-15T12:00:00Z',
          edited: false
        }
      },
      // Alex conversation messages
      {
        id: 'msg_3',
        conversationId: 'conv_alex',
        senderId: 'current_user',
        content: {
          text: 'Hey Alex! Want to catch up this weekend?',
          type: 'text'
        },
        timestamp: '2024-01-20T09:00:00Z',
        analysis: {
          quality: 'playful',
          sentiment: 'positive',
          intent: 'question',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.2
        },
        status: {
          delivered: true,
          read: true,
          readAt: '2024-01-20T09:10:00Z',
          edited: false
        }
      },
      {
        id: 'msg_4',
        conversationId: 'conv_alex',
        senderId: 'user_alex',
        content: {
          text: 'Absolutely! I\'d love to catch up. What did you have in mind?',
          type: 'text'
        },
        timestamp: '2024-01-20T09:15:00Z',
        analysis: {
          quality: 'engaging',
          sentiment: 'positive',
          intent: 'response',
          requiresResponse: true,
          urgency: 'medium',
          drynessScore: 0.1
        },
        status: {
          delivered: true,
          read: true,
          readAt: '2024-01-20T09:20:00Z',
          edited: false
        }
      }
    ];

    // Populate in-memory storage
    users.forEach(user => this.users.set(user.id, user));
    conversations.forEach(conv => this.conversations.set(conv.id, conv));
    messages.forEach(msg => {
      this.messages.set(msg.id, msg);
      const convMessages = this.conversationMessages.get(msg.conversationId) || [];
      convMessages.push(msg.id);
      this.conversationMessages.set(msg.conversationId, convMessages);
    });
  }
}

// Export singleton instance
export const database = new InMemoryDatabase();

// Export factory function for testing
export function createDatabase(): DatabaseService {
  return new InMemoryDatabase();
}
