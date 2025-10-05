-- Chat Invites Table
-- This table stores temporary invite links for starting new conversations

CREATE TABLE IF NOT EXISTS chat_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    conversation_id UUID REFERENCES public.conversations(id)
);

-- Index for faster lookups
CREATE INDEX idx_chat_invites_token ON chat_invites(id);
CREATE INDEX idx_chat_invites_created_by ON chat_invites(created_by);
CREATE INDEX idx_chat_invites_expires_at ON chat_invites(expires_at);

-- No RLS policies for hackathon - open access
-- Grant permissions
GRANT ALL ON TABLE chat_invites TO authenticated;
