-- Step-by-step script to insert mock data into Supabase
-- Run each section separately if you encounter any issues

-- STEP 1: Insert Users
-- Run this first to create the user profiles

INSERT INTO public.users (id, profile, preferences, analytics, relationship) VALUES
-- Laura
(
  'laura_id',
  '{"name": "Laura", "alias": "Laura", "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face", "bio": "Love hiking and photography 📸", "timezone": "PST", "language": "en"}',
  '{"responseTime": "within_hour", "communicationStyle": "casual", "preferredTopics": ["hiking", "photography", "travel"], "avoidTopics": ["politics"], "ghostingTolerance": 75}',
  '{"totalMessages": 45, "averageResponseTime": 2.5, "lastActiveAt": "2024-01-21T15:30:00Z", "activeDays": 7, "messageFrequency": "high"}',
  '{"closeness": "close_friend", "metIn": "school", "relationshipLength": "2_years", "interactionPattern": "regular"}'
),
-- Faiz
(
  'faiz_id',
  '{"name": "Faiz", "alias": "Faiz", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", "bio": "Software engineer and coffee enthusiast ☕", "timezone": "EST", "language": "en"}',
  '{"responseTime": "within_day", "communicationStyle": "professional", "preferredTopics": ["technology", "coffee", "coding"], "avoidTopics": ["gossip"], "ghostingTolerance": 60}',
  '{"totalMessages": 32, "averageResponseTime": 4.2, "lastActiveAt": "2024-01-21T13:30:00Z", "activeDays": 5, "messageFrequency": "medium"}',
  '{"closeness": "close_friend", "metIn": "work", "relationshipLength": "1_year", "interactionPattern": "occasional"}'
),
-- Smith
(
  'smith_id',
  '{"name": "Smith", "alias": "Smith", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", "bio": "Musician and dog lover 🎵🐕", "timezone": "GMT", "language": "en"}',
  '{"responseTime": "flexible", "communicationStyle": "playful", "preferredTopics": ["music", "dogs", "art"], "avoidTopics": ["work_stress"], "ghostingTolerance": 80}',
  '{"totalMessages": 28, "averageResponseTime": 6.8, "lastActiveAt": "2024-01-20T15:30:00Z", "activeDays": 3, "messageFrequency": "low"}',
  '{"closeness": "acquaintance", "metIn": "social", "relationshipLength": "6_months", "interactionPattern": "sporadic"}'
),
-- Wosly
(
  'wosly_id',
  '{"name": "Wosly", "alias": "Wosly", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", "bio": "Artist and yoga instructor 🧘‍♀️", "timezone": "PST", "language": "en"}',
  '{"responseTime": "immediate", "communicationStyle": "casual", "preferredTopics": ["art", "yoga", "wellness"], "avoidTopics": ["negative_news"], "ghostingTolerance": 90}',
  '{"totalMessages": 67, "averageResponseTime": 1.2, "lastActiveAt": "2024-01-21T15:50:00Z", "activeDays": 12, "messageFrequency": "high"}',
  '{"closeness": "close_friend", "metIn": "online", "relationshipLength": "3_years", "interactionPattern": "very_regular"}'
);

-- STEP 2: Insert Conversations
-- Run this after users are created

INSERT INTO public.conversations (id, participants, metadata, context, metrics, settings) VALUES
-- Laura & Faiz
(
  'conv_laura_faiz',
  ARRAY['laura_id', 'faiz_id'],
  '{"title": "Laura & Faiz", "type": "direct", "status": "active", "createdAt": "2024-01-14T15:30:00Z", "updatedAt": "2024-01-21T14:30:00Z", "lastMessageAt": "2024-01-21T14:30:00Z"}',
  '{"currentTopic": "weekend plans", "mood": "positive", "urgency": "low", "requiresResponse": true}',
  '{"ghostScore": 25, "responseRate": 85, "averageDryness": 2.3, "daysSinceLastReply": 0, "conversationHealth": "healthy", "messageCount": 3, "lastActivityAt": "2024-01-21T14:30:00Z"}',
  '{"notifications": true, "tags": ["friends", "weekend-plans", "hiking"], "priority": "normal"}'
),
-- Smith & Wosly
(
  'conv_smith_wosly',
  ARRAY['smith_id', 'wosly_id'],
  '{"title": "Smith & Wosly", "type": "direct", "status": "active", "createdAt": "2024-01-07T15:30:00Z", "updatedAt": "2024-01-21T15:20:00Z", "lastMessageAt": "2024-01-21T15:20:00Z"}',
  '{"currentTopic": "music collaboration", "mood": "positive", "urgency": "medium", "requiresResponse": true}',
  '{"ghostScore": 15, "responseRate": 95, "averageDryness": 1.8, "daysSinceLastReply": 0, "conversationHealth": "healthy", "messageCount": 3, "lastActivityAt": "2024-01-21T15:20:00Z"}',
  '{"notifications": true, "tags": ["music", "collaboration", "creative"], "priority": "high"}'
),
-- Current user & Laura
(
  'conv_current_laura',
  ARRAY['current_user', 'laura_id'],
  '{"title": "Laura", "type": "direct", "status": "active", "createdAt": "2024-01-15T10:30:00Z", "updatedAt": "2024-01-21T16:00:00Z", "lastMessageAt": "2024-01-21T16:00:00Z"}',
  '{"currentTopic": "photography tips", "mood": "positive", "urgency": "low", "requiresResponse": false}',
  '{"ghostScore": 35, "responseRate": 80, "averageDryness": 1.5, "daysSinceLastReply": 0, "conversationHealth": "healthy", "messageCount": 2, "lastActivityAt": "2024-01-21T16:00:00Z"}',
  '{"notifications": true, "tags": ["friend", "photography", "active"], "priority": "normal"}'
);

-- STEP 3: Insert Messages
-- Run this after conversations are created

-- Laura & Faiz messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, timestamp, analysis, status) VALUES
('msg_laura_faiz_1', 'conv_laura_faiz', 'laura_id', '{"text": "Hey Faiz! How''s your week going?", "type": "text"}', '2024-01-21T12:30:00Z', '{"quality": "engaging", "sentiment": "positive", "intent": "question", "requiresResponse": true, "urgency": "low", "drynessScore": 1.2}', '{"delivered": true, "read": true, "readAt": "2024-01-21T12:30:00Z", "edited": false}'),
('msg_laura_faiz_2', 'conv_laura_faiz', 'faiz_id', '{"text": "Pretty good! Just finished a big project. How about you?", "type": "text"}', '2024-01-21T13:00:00Z', '{"quality": "engaging", "sentiment": "positive", "intent": "statement", "requiresResponse": true, "urgency": "low", "drynessScore": 1.5}', '{"delivered": true, "read": true, "readAt": "2024-01-21T13:00:00Z", "edited": false}'),
('msg_laura_faiz_3', 'conv_laura_faiz', 'laura_id', '{"text": "Nice! I''m thinking of going hiking this weekend. Want to join?", "type": "text"}', '2024-01-21T14:30:00Z', '{"quality": "playful", "sentiment": "positive", "intent": "question", "requiresResponse": true, "urgency": "medium", "drynessScore": 0.8}', '{"delivered": true, "read": false, "edited": false}');

-- Smith & Wosly messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, timestamp, analysis, status) VALUES
('msg_smith_wosly_1', 'conv_smith_wosly', 'wosly_id', '{"text": "Smith! I just had the most amazing idea for our song 🎵", "type": "text"}', '2024-01-21T13:30:00Z', '{"quality": "engaging", "sentiment": "positive", "intent": "statement", "requiresResponse": true, "urgency": "medium", "drynessScore": 0.5}', '{"delivered": true, "read": true, "readAt": "2024-01-21T13:30:00Z", "edited": false}'),
('msg_smith_wosly_2', 'conv_smith_wosly', 'smith_id', '{"text": "Ooh tell me more! I''m all ears 👂", "type": "text"}', '2024-01-21T14:00:00Z', '{"quality": "playful", "sentiment": "positive", "intent": "question", "requiresResponse": true, "urgency": "medium", "drynessScore": 0.3}', '{"delivered": true, "read": true, "readAt": "2024-01-21T14:00:00Z", "edited": false}'),
('msg_smith_wosly_3', 'conv_smith_wosly', 'wosly_id', '{"text": "What if we add some nature sounds to the intro? Like birds chirping and water flowing 🌊", "type": "text"}', '2024-01-21T15:20:00Z', '{"quality": "engaging", "sentiment": "positive", "intent": "statement", "requiresResponse": true, "urgency": "medium", "drynessScore": 0.7}', '{"delivered": true, "read": false, "edited": false}');

-- Current user & Laura messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, timestamp, analysis, status) VALUES
('msg_current_laura_1', 'conv_current_laura', 'current_user', '{"text": "Hey Laura! I saw your hiking photos, they''re amazing! 📸", "type": "text"}', '2024-01-21T15:30:00Z', '{"quality": "engaging", "sentiment": "positive", "intent": "statement", "requiresResponse": true, "urgency": "low", "drynessScore": 0.2}', '{"delivered": true, "read": true, "readAt": "2024-01-21T15:35:00Z", "edited": false}'),
('msg_current_laura_2', 'conv_current_laura', 'laura_id', '{"text": "Thank you! I''ve been exploring some new trails lately. Want to join me sometime?", "type": "text"}', '2024-01-21T16:00:00Z', '{"quality": "playful", "sentiment": "positive", "intent": "question", "requiresResponse": true, "urgency": "low", "drynessScore": 0.3}', '{"delivered": true, "read": false, "edited": false}');

-- STEP 4: Verify the data
-- Run this to check if everything was inserted correctly

SELECT 'Users' as table_name, COUNT(*) as count FROM public.users WHERE id IN ('laura_id', 'faiz_id', 'smith_id', 'wosly_id')
UNION ALL
SELECT 'Conversations' as table_name, COUNT(*) as count FROM public.conversations WHERE id IN ('conv_laura_faiz', 'conv_smith_wosly', 'conv_current_laura')
UNION ALL
SELECT 'Messages' as table_name, COUNT(*) as count FROM public.messages WHERE conversation_id IN ('conv_laura_faiz', 'conv_smith_wosly', 'conv_current_laura');
