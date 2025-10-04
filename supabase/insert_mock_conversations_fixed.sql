-- Insert Mock Conversations Script for Supabase (Fixed UUIDs)
-- This script adds Laura & Faiz and Smith & Wosly conversations with realistic data

-- Create variables for user IDs (using proper UUIDs)
DO $$
DECLARE
    laura_uuid UUID := '550e8400-e29b-41d4-a716-446655440001';
    faiz_uuid UUID := '550e8400-e29b-41d4-a716-446655440002';
    smith_uuid UUID := '550e8400-e29b-41d4-a716-446655440003';
    wosly_uuid UUID := '550e8400-e29b-41d4-a716-446655440004';
    current_user_uuid UUID := '550e8400-e29b-41d4-a716-446655440000';
    
    conv_laura_faiz_uuid UUID := '650e8400-e29b-41d4-a716-446655440001';
    conv_smith_wosly_uuid UUID := '650e8400-e29b-41d4-a716-446655440002';
    conv_current_laura_uuid UUID := '650e8400-e29b-41d4-a716-446655440003';
BEGIN
    -- Insert users
    INSERT INTO public.users (id, profile, preferences, analytics, relationship) VALUES
    -- Laura - Hiking and photography enthusiast
    (
        laura_uuid,
        '{
            "name": "Laura",
            "alias": "Laura", 
            "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            "bio": "Love hiking and photography 📸",
            "timezone": "PST",
            "language": "en"
        }',
        '{
            "responseTime": "within_hour",
            "communicationStyle": "casual",
            "preferredTopics": ["hiking", "photography", "travel"],
            "avoidTopics": ["politics"],
            "ghostingTolerance": 75
        }',
        '{
            "totalMessages": 45,
            "averageResponseTime": 2.5,
            "lastActiveAt": "2024-01-21T15:30:00Z",
            "activeDays": 7,
            "messageFrequency": "high"
        }',
        '{
            "closeness": "close_friend",
            "metIn": "school",
            "relationshipLength": "2_years",
            "interactionPattern": "regular"
        }'
    ),
    -- Faiz - Software engineer and coffee enthusiast
    (
        faiz_uuid,
        '{
            "name": "Faiz",
            "alias": "Faiz",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "bio": "Software engineer and coffee enthusiast ☕",
            "timezone": "EST", 
            "language": "en"
        }',
        '{
            "responseTime": "within_day",
            "communicationStyle": "professional",
            "preferredTopics": ["technology", "coffee", "coding"],
            "avoidTopics": ["gossip"],
            "ghostingTolerance": 60
        }',
        '{
            "totalMessages": 32,
            "averageResponseTime": 4.2,
            "lastActiveAt": "2024-01-21T13:30:00Z",
            "activeDays": 5,
            "messageFrequency": "medium"
        }',
        '{
            "closeness": "close_friend",
            "metIn": "work",
            "relationshipLength": "1_year", 
            "interactionPattern": "occasional"
        }'
    ),
    -- Smith - Musician and dog lover
    (
        smith_uuid,
        '{
            "name": "Smith",
            "alias": "Smith",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            "bio": "Musician and dog lover 🎵🐕",
            "timezone": "GMT",
            "language": "en"
        }',
        '{
            "responseTime": "flexible",
            "communicationStyle": "playful",
            "preferredTopics": ["music", "dogs", "art"],
            "avoidTopics": ["work_stress"],
            "ghostingTolerance": 80
        }',
        '{
            "totalMessages": 28,
            "averageResponseTime": 6.8,
            "lastActiveAt": "2024-01-20T15:30:00Z",
            "activeDays": 3,
            "messageFrequency": "low"
        }',
        '{
            "closeness": "acquaintance",
            "metIn": "social",
            "relationshipLength": "6_months",
            "interactionPattern": "sporadic"
        }'
    ),
    -- Wosly - Artist and yoga instructor
    (
        wosly_uuid,
        '{
            "name": "Wosly",
            "alias": "Wosly",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "bio": "Artist and yoga instructor 🧘‍♀️",
            "timezone": "PST",
            "language": "en"
        }',
        '{
            "responseTime": "immediate",
            "communicationStyle": "casual",
            "preferredTopics": ["art", "yoga", "wellness"],
            "avoidTopics": ["negative_news"],
            "ghostingTolerance": 90
        }',
        '{
            "totalMessages": 67,
            "averageResponseTime": 1.2,
            "lastActiveAt": "2024-01-21T15:50:00Z",
            "activeDays": 12,
            "messageFrequency": "high"
        }',
        '{
            "closeness": "close_friend",
            "metIn": "online",
            "relationshipLength": "3_years",
            "interactionPattern": "very_regular"
        }'
    ),
    -- Current User (for testing)
    (
        current_user_uuid,
        '{
            "name": "Current User",
            "alias": "current_user",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            "bio": "Chat app user",
            "timezone": "PST",
            "language": "en"
        }',
        '{
            "responseTime": "within_hour",
            "communicationStyle": "casual",
            "preferredTopics": ["general"],
            "avoidTopics": [],
            "ghostingTolerance": 70
        }',
        '{
            "totalMessages": 10,
            "averageResponseTime": 2.0,
            "lastActiveAt": "2024-01-21T16:00:00Z",
            "activeDays": 5,
            "messageFrequency": "medium"
        }',
        '{
            "closeness": "friend",
            "metIn": "online",
            "relationshipLength": "1_year",
            "interactionPattern": "regular"
        }'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert conversations
    INSERT INTO public.conversations (id, participants, metadata, context, metrics, settings) VALUES
    -- Laura & Faiz conversation - Hiking plans
    (
        conv_laura_faiz_uuid,
        ARRAY[laura_uuid, faiz_uuid],
        '{
            "title": "Laura & Faiz",
            "type": "direct",
            "status": "active",
            "createdAt": "2024-01-14T15:30:00Z",
            "updatedAt": "2024-01-21T14:30:00Z",
            "lastMessageAt": "2024-01-21T14:30:00Z"
        }',
        '{
            "currentTopic": "weekend plans",
            "mood": "positive",
            "urgency": "low",
            "requiresResponse": true
        }',
        '{
            "ghostScore": 25,
            "responseRate": 85,
            "averageDryness": 2.3,
            "daysSinceLastReply": 0,
            "conversationHealth": "healthy",
            "messageCount": 3,
            "lastActivityAt": "2024-01-21T14:30:00Z"
        }',
        '{
            "notifications": true,
            "tags": ["friends", "weekend-plans", "hiking"],
            "priority": "normal"
        }'
    ),
    -- Smith & Wosly conversation - Music collaboration
    (
        conv_smith_wosly_uuid,
        ARRAY[smith_uuid, wosly_uuid],
        '{
            "title": "Smith & Wosly",
            "type": "direct", 
            "status": "active",
            "createdAt": "2024-01-07T15:30:00Z",
            "updatedAt": "2024-01-21T15:20:00Z",
            "lastMessageAt": "2024-01-21T15:20:00Z"
        }',
        '{
            "currentTopic": "music collaboration",
            "mood": "positive",
            "urgency": "medium",
            "requiresResponse": true
        }',
        '{
            "ghostScore": 15,
            "responseRate": 95,
            "averageDryness": 1.8,
            "daysSinceLastReply": 0,
            "conversationHealth": "healthy",
            "messageCount": 3,
            "lastActivityAt": "2024-01-21T15:20:00Z"
        }',
        '{
            "notifications": true,
            "tags": ["music", "collaboration", "creative"],
            "priority": "high"
        }'
    ),
    -- Current user & Laura conversation
    (
        conv_current_laura_uuid,
        ARRAY[current_user_uuid, laura_uuid],
        '{
            "title": "Laura",
            "type": "direct",
            "status": "active",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-21T16:00:00Z",
            "lastMessageAt": "2024-01-21T16:00:00Z"
        }',
        '{
            "currentTopic": "photography tips",
            "mood": "positive",
            "urgency": "low",
            "requiresResponse": false
        }',
        '{
            "ghostScore": 35,
            "responseRate": 80,
            "averageDryness": 1.5,
            "daysSinceLastReply": 0,
            "conversationHealth": "healthy",
            "messageCount": 2,
            "lastActivityAt": "2024-01-21T16:00:00Z"
        }',
        '{
            "notifications": true,
            "tags": ["friend", "photography", "active"],
            "priority": "normal"
        }'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert messages for Laura & Faiz conversation
    INSERT INTO public.messages (id, conversation_id, sender_id, content, timestamp, analysis, status) VALUES
    -- Laura & Faiz messages
    (
        gen_random_uuid(),
        conv_laura_faiz_uuid,
        laura_uuid,
        '{
            "text": "Hey Faiz! How''s your week going?",
            "type": "text"
        }',
        '2024-01-21T12:30:00Z',
        '{
            "quality": "engaging",
            "sentiment": "positive",
            "intent": "question",
            "requiresResponse": true,
            "urgency": "low",
            "drynessScore": 1.2
        }',
        '{
            "delivered": true,
            "read": true,
            "readAt": "2024-01-21T12:30:00Z",
            "edited": false
        }'
    ),
    (
        gen_random_uuid(),
        conv_laura_faiz_uuid,
        faiz_uuid,
        '{
            "text": "Pretty good! Just finished a big project. How about you?",
            "type": "text"
        }',
        '2024-01-21T13:00:00Z',
        '{
            "quality": "engaging",
            "sentiment": "positive",
            "intent": "statement",
            "requiresResponse": true,
            "urgency": "low",
            "drynessScore": 1.5
        }',
        '{
            "delivered": true,
            "read": true,
            "readAt": "2024-01-21T13:00:00Z",
            "edited": false
        }'
    ),
    (
        gen_random_uuid(),
        conv_laura_faiz_uuid,
        laura_uuid,
        '{
            "text": "Nice! I''m thinking of going hiking this weekend. Want to join?",
            "type": "text"
        }',
        '2024-01-21T14:30:00Z',
        '{
            "quality": "playful",
            "sentiment": "positive",
            "intent": "question",
            "requiresResponse": true,
            "urgency": "medium",
            "drynessScore": 0.8
        }',
        '{
            "delivered": true,
            "read": false,
            "edited": false
        }'
    ),
    -- Smith & Wosly messages
    (
        gen_random_uuid(),
        conv_smith_wosly_uuid,
        wosly_uuid,
        '{
            "text": "Smith! I just had the most amazing idea for our song 🎵",
            "type": "text"
        }',
        '2024-01-21T13:30:00Z',
        '{
            "quality": "engaging",
            "sentiment": "positive",
            "intent": "statement",
            "requiresResponse": true,
            "urgency": "medium",
            "drynessScore": 0.5
        }',
        '{
            "delivered": true,
            "read": true,
            "readAt": "2024-01-21T13:30:00Z",
            "edited": false
        }'
    ),
    (
        gen_random_uuid(),
        conv_smith_wosly_uuid,
        smith_uuid,
        '{
            "text": "Ooh tell me more! I''m all ears 👂",
            "type": "text"
        }',
        '2024-01-21T14:00:00Z',
        '{
            "quality": "playful",
            "sentiment": "positive",
            "intent": "question",
            "requiresResponse": true,
            "urgency": "medium",
            "drynessScore": 0.3
        }',
        '{
            "delivered": true,
            "read": true,
            "readAt": "2024-01-21T14:00:00Z",
            "edited": false
        }'
    ),
    (
        gen_random_uuid(),
        conv_smith_wosly_uuid,
        wosly_uuid,
        '{
            "text": "What if we add some nature sounds to the intro? Like birds chirping and water flowing 🌊",
            "type": "text"
        }',
        '2024-01-21T15:20:00Z',
        '{
            "quality": "engaging",
            "sentiment": "positive",
            "intent": "statement",
            "requiresResponse": true,
            "urgency": "medium",
            "drynessScore": 0.7
        }',
        '{
            "delivered": true,
            "read": false,
            "edited": false
        }'
    ),
    -- Current user & Laura messages
    (
        gen_random_uuid(),
        conv_current_laura_uuid,
        current_user_uuid,
        '{
            "text": "Hey Laura! I saw your hiking photos, they''re amazing! 📸",
            "type": "text"
        }',
        '2024-01-21T15:30:00Z',
        '{
            "quality": "engaging",
            "sentiment": "positive",
            "intent": "statement",
            "requiresResponse": true,
            "urgency": "low",
            "drynessScore": 0.2
        }',
        '{
            "delivered": true,
            "read": true,
            "readAt": "2024-01-21T15:35:00Z",
            "edited": false
        }'
    ),
    (
        gen_random_uuid(),
        conv_current_laura_uuid,
        laura_uuid,
        '{
            "text": "Thank you! I''ve been exploring some new trails lately. Want to join me sometime?",
            "type": "text"
        }',
        '2024-01-21T16:00:00Z',
        '{
            "quality": "playful",
            "sentiment": "positive",
            "intent": "question",
            "requiresResponse": true,
            "urgency": "low",
            "drynessScore": 0.3
        }',
        '{
            "delivered": true,
            "read": false,
            "edited": false
        }'
    );

    -- Verify the data was inserted correctly
    RAISE NOTICE 'Data insertion completed successfully!';
    RAISE NOTICE 'Users inserted: %', (SELECT COUNT(*) FROM public.users WHERE id IN (laura_uuid, faiz_uuid, smith_uuid, wosly_uuid, current_user_uuid));
    RAISE NOTICE 'Conversations inserted: %', (SELECT COUNT(*) FROM public.conversations WHERE id IN (conv_laura_faiz_uuid, conv_smith_wosly_uuid, conv_current_laura_uuid));
    RAISE NOTICE 'Messages inserted: %', (SELECT COUNT(*) FROM public.messages WHERE conversation_id IN (conv_laura_faiz_uuid, conv_smith_wosly_uuid, conv_current_laura_uuid));

END $$;
