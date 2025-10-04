// Supabase TypeScript types for HTV Chat Application
// Generated from the database schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
            ghostingTolerance: number;
          };
          analytics: {
            averageResponseTime: number;
            responseRate: number;
            messageFrequency: 'high' | 'medium' | 'low';
            engagementScore: number;
            lastActiveAt: string;
          };
          relationship: {
            closeness: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
            metIn: 'online' | 'work' | 'school' | 'social' | 'other';
            sharedInterests: string[];
            mutualConnections: string[];
          };
        };
        Insert: {
          id?: string;
          profile?: {
            name: string;
            alias: string;
            avatar: string;
            bio?: string;
            timezone?: string;
            language?: string;
          };
          preferences?: {
            responseTime: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
            communicationStyle: 'formal' | 'casual' | 'playful' | 'professional';
            preferredTopics: string[];
            avoidTopics: string[];
            ghostingTolerance: number;
          };
          analytics?: {
            averageResponseTime: number;
            responseRate: number;
            messageFrequency: 'high' | 'medium' | 'low';
            engagementScore: number;
            lastActiveAt: string;
          };
          relationship?: {
            closeness: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
            metIn: 'online' | 'work' | 'school' | 'social' | 'other';
            sharedInterests: string[];
            mutualConnections: string[];
          };
        };
        Update: {
          id?: string;
          profile?: {
            name?: string;
            alias?: string;
            avatar?: string;
            bio?: string;
            timezone?: string;
            language?: string;
          };
          preferences?: {
            responseTime?: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
            communicationStyle?: 'formal' | 'casual' | 'playful' | 'professional';
            preferredTopics?: string[];
            avoidTopics?: string[];
            ghostingTolerance?: number;
          };
          analytics?: {
            averageResponseTime?: number;
            responseRate?: number;
            messageFrequency?: 'high' | 'medium' | 'low';
            engagementScore?: number;
            lastActiveAt?: string;
          };
          relationship?: {
            closeness?: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
            metIn?: 'online' | 'work' | 'school' | 'social' | 'other';
            sharedInterests?: string[];
            mutualConnections?: string[];
          };
        };
      };
      conversations: {
        Row: {
          id: string;
          participants: string[];
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
            ghostScore: number;
            responseRate: number;
            averageDryness: number;
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
        };
        Insert: {
          id?: string;
          participants: string[];
          metadata?: {
            title?: string;
            type?: 'direct' | 'group';
            status?: 'active' | 'paused' | 'archived';
            createdAt?: string;
            updatedAt?: string;
            lastMessageAt?: string;
          };
          context?: {
            currentTopic?: string;
            mood?: 'positive' | 'neutral' | 'negative' | 'mixed';
            urgency?: 'low' | 'medium' | 'high';
            requiresResponse?: boolean;
            suggestedActions?: string[];
          };
          metrics?: {
            ghostScore?: number;
            responseRate?: number;
            averageDryness?: number;
            daysSinceLastReply?: number;
            messageCount?: number;
            conversationHealth?: 'healthy' | 'at_risk' | 'critical';
          };
          settings?: {
            notifications?: boolean;
            autoReply?: boolean;
            priority?: 'low' | 'normal' | 'high';
            tags?: string[];
          };
        };
        Update: {
          id?: string;
          participants?: string[];
          metadata?: {
            title?: string;
            type?: 'direct' | 'group';
            status?: 'active' | 'paused' | 'archived';
            createdAt?: string;
            updatedAt?: string;
            lastMessageAt?: string;
          };
          context?: {
            currentTopic?: string;
            mood?: 'positive' | 'neutral' | 'negative' | 'mixed';
            urgency?: 'low' | 'medium' | 'high';
            requiresResponse?: boolean;
            suggestedActions?: string[];
          };
          metrics?: {
            ghostScore?: number;
            responseRate?: number;
            averageDryness?: number;
            daysSinceLastReply?: number;
            messageCount?: number;
            conversationHealth?: 'healthy' | 'at_risk' | 'critical';
          };
          settings?: {
            notifications?: boolean;
            autoReply?: boolean;
            priority?: 'low' | 'normal' | 'high';
            tags?: string[];
          };
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
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
            drynessScore: number;
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
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: {
            text: string;
            type?: 'text' | 'image' | 'link' | 'emoji' | 'voice';
            metadata?: {
              url?: string;
              filename?: string;
              duration?: number;
              size?: number;
            };
          };
          timestamp?: string;
          analysis: {
            quality: 'dry' | 'neutral' | 'playful' | 'engaging';
            sentiment: 'positive' | 'neutral' | 'negative';
            intent: 'question' | 'statement' | 'request' | 'response' | 'greeting' | 'goodbye';
            requiresResponse: boolean;
            urgency: 'low' | 'medium' | 'high';
            drynessScore: number;
          };
          status?: {
            delivered?: boolean;
            read?: boolean;
            readAt?: string;
            edited?: boolean;
            editedAt?: string;
          };
          suggestions?: {
            autoReply?: string[];
            followUp?: string[];
            contextAware?: string[];
          };
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: {
            text?: string;
            type?: 'text' | 'image' | 'link' | 'emoji' | 'voice';
            metadata?: {
              url?: string;
              filename?: string;
              duration?: number;
              size?: number;
            };
          };
          timestamp?: string;
          analysis?: {
            quality?: 'dry' | 'neutral' | 'playful' | 'engaging';
            sentiment?: 'positive' | 'neutral' | 'negative';
            intent?: 'question' | 'statement' | 'request' | 'response' | 'greeting' | 'goodbye';
            requiresResponse?: boolean;
            urgency?: 'low' | 'medium' | 'high';
            drynessScore?: number;
          };
          status?: {
            delivered?: boolean;
            read?: boolean;
            readAt?: string;
            edited?: boolean;
            editedAt?: string;
          };
          suggestions?: {
            autoReply?: string[];
            followUp?: string[];
            contextAware?: string[];
          };
        };
      };
      conversation_summaries: {
        Row: {
          id: string;
          title: string | null;
          status: string | null;
          health: string | null;
          ghost_score: string | null;
          last_message_at: string | null;
          participants: string[];
          message_count: number | null;
          latest_message_time: string | null;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      conversation_summaries: {
        Row: {
          id: string;
          title: string | null;
          status: string | null;
          health: string | null;
          ghost_score: string | null;
          last_message_at: string | null;
          participants: string[];
          message_count: number | null;
          latest_message_time: string | null;
        };
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      get_conversation_with_participants: {
        Args: {
          conv_id: string;
        };
        Returns: {
          conversation_id: string;
          participants: any;
          metadata: any;
          context: any;
          metrics: any;
          settings: any;
        }[];
      };
      calculate_conversation_metrics: {
        Args: {
          conv_id: string;
        };
        Returns: any;
      };
      update_conversation_health: {
        Args: {
          conv_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      communication_style: 'formal' | 'casual' | 'playful' | 'professional';
      response_time: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
      message_frequency: 'high' | 'medium' | 'low';
      closeness_level: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
      meet_context: 'online' | 'work' | 'school' | 'social' | 'other';
      conversation_status: 'active' | 'paused' | 'archived';
      conversation_type: 'direct' | 'group';
      message_type: 'text' | 'image' | 'link' | 'emoji' | 'voice';
      message_quality: 'dry' | 'neutral' | 'playful' | 'engaging';
      sentiment: 'positive' | 'neutral' | 'negative';
      message_intent: 'question' | 'statement' | 'request' | 'response' | 'greeting' | 'goodbye';
      urgency_level: 'low' | 'medium' | 'high';
      conversation_health: 'healthy' | 'at_risk' | 'critical';
      priority_level: 'low' | 'normal' | 'high';
      mood_type: 'positive' | 'neutral' | 'negative' | 'mixed';
    };
  };
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type ConversationSummary = Database['public']['Views']['conversation_summaries']['Row'];

// Utility types for API responses
export interface ConversationWithParticipants {
  conversation: Conversation;
  participants: User[];
}

export interface MessageWithUser {
  message: Message;
  sender: User;
}

export interface ConversationMetrics {
  messageCount: number;
  averageDryness: number;
  responseRate: number;
  daysSinceLastReply: number;
}

// Filter types for queries
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
