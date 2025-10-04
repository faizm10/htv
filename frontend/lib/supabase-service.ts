// Supabase service implementation for HTV Chat Application
// Replaces the in-memory database with real Supabase integration

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Conversation, Message, ConversationFilter, MessageFilter, DatabaseService } from './database-types';
import { mockDatabase } from './mock-database-service';

export class SupabaseDatabaseService implements DatabaseService {
  private supabase: SupabaseClient;
  private useMockData: boolean = false;

  constructor(url: string, anonKey: string) {
    this.useMockData = url === 'https://placeholder.supabase.co' || anonKey === 'placeholder-key';
    this.supabase = createClient(url, anonKey);
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    if (this.useMockData) {
      return mockDatabase.getUser(userId);
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .textSearch('users_search', query);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  // Conversation operations
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  }

  async getConversations(filter?: ConversationFilter): Promise<Conversation[]> {
    if (this.useMockData) {
      return mockDatabase.getConversations(filter);
    }

    let query = this.supabase
      .from('conversations')
      .select('*');

    if (filter?.userId) {
      query = query.contains('participants', [filter.userId]);
    }

    if (filter?.status) {
      query = query.eq('metadata->status', filter.status);
    }

    if (filter?.ghostScore) {
      if (filter.ghostScore.min !== undefined) {
        query = query.gte('metrics->ghostScore', filter.ghostScore.min);
      }
      if (filter.ghostScore.max !== undefined) {
        query = query.lte('metrics->ghostScore', filter.ghostScore.max);
      }
    }

    if (filter?.requiresResponse !== undefined) {
      query = query.eq('context->requiresResponse', filter.requiresResponse);
    }

    if (filter?.tags && filter.tags.length > 0) {
      query = query.overlaps('settings->tags', filter.tags);
    }

    if (filter?.search) {
      query = query.textSearch('conversations_search', filter.search);
    }

    // Order by last message time
    query = query.order('metadata->lastMessageAt', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  async createConversation(conversation: Omit<Conversation, 'id'>): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    return data;
  }

  // Message operations
  async getMessages(filter: MessageFilter): Promise<Message[]> {
    if (this.useMockData) {
      return mockDatabase.getMessages(filter);
    }

    let query = this.supabase
      .from('messages')
      .select('*');

    if (filter.conversationId) {
      query = query.eq('conversation_id', filter.conversationId);
    }

    if (filter.senderId) {
      query = query.eq('sender_id', filter.senderId);
    }

    if (filter.quality) {
      query = query.eq('analysis->quality', filter.quality);
    }

    if (filter.requiresResponse !== undefined) {
      query = query.eq('analysis->requiresResponse', filter.requiresResponse);
    }

    if (filter.dateRange) {
      if (filter.dateRange.from) {
        query = query.gte('timestamp', filter.dateRange.from);
      }
      if (filter.dateRange.to) {
        query = query.lte('timestamp', filter.dateRange.to);
      }
    }

    query = query.order('timestamp', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Map snake_case to camelCase for consistency
    return (data || []).map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      timestamp: msg.timestamp,
      analysis: msg.analysis,
      status: msg.status,
      suggestions: msg.suggestions
    }));
  }

  async addMessage(message: Omit<Message, 'id'>): Promise<Message> {
    if (this.useMockData) {
      return mockDatabase.addMessage(message);
    }

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        analysis: message.analysis,
        status: message.status,
        suggestions: message.suggestions
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }

    // Update conversation health based on new message
    await this.updateConversationHealth(message.conversationId);

    // Map snake_case to camelCase for consistency
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      content: data.content,
      timestamp: data.timestamp,
      analysis: data.analysis,
      status: data.status,
      suggestions: data.suggestions
    };
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data;
  }

  // Analytics operations
  async getConversationMetrics(conversationId: string): Promise<Conversation['metrics']> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return conversation.metrics;
  }

  async getUserAnalytics(userId: string): Promise<User['analytics']> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    return user.analytics;
  }

  async generateSuggestions(conversationId: string, context: string): Promise<string[]> {
    if (this.useMockData) {
      return mockDatabase.generateSuggestions(conversationId, context);
    }

    // This would integrate with your AI service
    // For now, return basic suggestions
    return [
      "How's your day going?",
      "What are you up to?",
      "Want to grab coffee sometime?",
      "Hope you're doing well!",
    ];
  }

  // Additional Supabase-specific methods
  async getConversationWithParticipants(conversationId: string) {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return conversation;
  }

  async updateConversationHealth(conversationId: string): Promise<void> {
    // For now, just log that we would update conversation health
    console.log(`Would update conversation health for ${conversationId}`);
  }

  async getConversationSummaries(userId?: string) {
    // For now, return conversations as summaries
    return this.getConversations({ userId });
  }

  // Real-time subscriptions
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  subscribeToConversations(userId: string, callback: (conversation: Conversation) => void) {
    return this.supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participants=cs.{${userId}}`,
        },
        (payload) => {
          callback(payload.new as Conversation);
        }
      )
      .subscribe();
  }

  // Authentication helpers
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  }
}

// Create and export singleton instance
// You'll need to set these environment variables in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real Supabase credentials
const hasRealCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

if (!hasRealCredentials) {
  console.warn('⚠️  Supabase credentials not found. Using mock data mode.');
  console.warn('   Create frontend/.env.local with your Supabase URL and anon key');
}

export const supabaseDatabase = new SupabaseDatabaseService(supabaseUrl, supabaseAnonKey);

// Export the Supabase client for direct use if needed
export const supabase = supabaseDatabase['supabase'];
