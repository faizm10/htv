-- Simple test script to verify UUID format works
-- Run this first to test if your Supabase accepts the UUID format

-- Test inserting a single user with proper UUID
INSERT INTO public.users (id, profile, preferences, analytics, relationship) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '{
    "name": "Laura",
    "alias": "Laura",
    "bio": "Love hiking and photography 📸"
  }',
  '{
    "responseTime": "within_hour",
    "communicationStyle": "casual"
  }',
  '{
    "totalMessages": 45,
    "lastActiveAt": "2024-01-21T15:30:00Z"
  }',
  '{
    "closeness": "close_friend",
    "metIn": "school"
  }'
);

-- Verify it worked
SELECT id, profile->>'name' as name FROM public.users WHERE id = '550e8400-e29b-41d4-a716-446655440001';
