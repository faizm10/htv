-- HTV Chat Application Database Schema
-- This migration creates the initial tables for users, conversations, and messages

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE communication_style AS ENUM ('formal', 'casual', 'playful', 'professional');
CREATE TYPE response_time AS ENUM ('immediate', 'within_hour', 'within_day', 'flexible');
CREATE TYPE message_frequency AS ENUM ('high', 'medium', 'low');
CREATE TYPE closeness_level AS ENUM ('stranger', 'acquaintance', 'friend', 'close_friend', 'family');
CREATE TYPE meet_context AS ENUM ('online', 'work', 'school', 'social', 'other');
CREATE TYPE conversation_status AS ENUM ('active', 'paused', 'archived');
CREATE TYPE conversation_type AS ENUM ('direct', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'link', 'emoji', 'voice');
CREATE TYPE message_quality AS ENUM ('dry', 'neutral', 'playful', 'engaging');
CREATE TYPE sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE message_intent AS ENUM ('question', 'statement', 'request', 'response', 'greeting', 'goodbye');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE conversation_health AS ENUM ('healthy', 'at_risk', 'critical');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high');
CREATE TYPE mood_type AS ENUM ('positive', 'neutral', 'negative', 'mixed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    analytics JSONB NOT NULL DEFAULT '{}',
    relationship JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    context JSONB NOT NULL DEFAULT '{}',
    metrics JSONB NOT NULL DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis JSONB NOT NULL DEFAULT '{}',
    status JSONB NOT NULL DEFAULT '{}',
    suggestions JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_profile_name ON users USING BTREE ((profile->>'name'));
CREATE INDEX idx_users_profile_alias ON users USING BTREE ((profile->>'alias'));
CREATE INDEX idx_users_analytics_last_active ON users USING BTREE ((analytics->>'lastActiveAt'));
CREATE INDEX idx_users_relationship_closeness ON users USING BTREE ((relationship->>'closeness'));

CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX idx_conversations_status ON conversations USING BTREE ((metadata->>'status'));
CREATE INDEX idx_conversations_health ON conversations USING BTREE ((metrics->>'conversationHealth'));
CREATE INDEX idx_conversations_last_message ON conversations USING BTREE ((metadata->>'lastMessageAt'));

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_quality ON messages USING BTREE ((analysis->>'quality'));
CREATE INDEX idx_messages_requires_response ON messages USING BTREE ((analysis->>'requiresResponse'));

-- Create full-text search indexes
CREATE INDEX idx_users_search ON users USING GIN (
    to_tsvector('english', 
        COALESCE(profile->>'name', '') || ' ' ||
        COALESCE(profile->>'alias', '') || ' ' ||
        COALESCE(profile->>'bio', '')
    )
);

CREATE INDEX idx_conversations_search ON conversations USING GIN (
    to_tsvector('english', COALESCE(metadata->>'title', ''))
);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can access conversations they participate in
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Users can access messages in conversations they participate in
CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = messages.conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can insert messages in own conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
