# Supabase Setup Guide for HTV Chat Application

This guide will help you set up Supabase for your HTV chat application with the new database structure.

## Prerequisites

1. A Supabase account ([sign up here](https://supabase.com))
2. Node.js and npm installed
3. Your HTV project cloned locally

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `htv-chat-app` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp frontend/env.example frontend/.env.local
   ```

2. Edit `frontend/.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Install Supabase CLI (Optional but Recommended)

```bash
npm install -g supabase
```

## Step 5: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run the migration:
   ```bash
   supabase db push
   ```

### Option B: Using Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the migration

## Step 6: Seed Sample Data

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/seed.sql`
3. Paste it into the SQL editor
4. Click "Run" to insert sample data

## Step 7: Install Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
```

## Step 8: Update Your Code

Replace the in-memory database service with Supabase:

```typescript
// In your components, replace:
import { database } from '@/lib/database-service';

// With:
import { supabaseDatabase } from '@/lib/supabase-service';

// Update all database calls to use supabaseDatabase
```

## Step 9: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your chat page and verify:
   - Conversations load from Supabase
   - Users can send messages
   - Real-time updates work (if enabled)

## Database Schema Overview

Your Supabase database now includes:

### Tables
- **users**: User profiles, preferences, and analytics
- **conversations**: Chat metadata, context, and metrics
- **messages**: Individual messages with analysis

### Views
- **conversation_summaries**: Aggregated conversation data for quick access

### Functions
- **get_conversation_with_participants()**: Get conversation with user details
- **calculate_conversation_metrics()**: Calculate conversation analytics
- **update_conversation_health()**: Update ghost score and health status

### Features Enabled
- **Row Level Security (RLS)**: Users can only access their own data
- **Real-time subscriptions**: Live updates for messages and conversations
- **Full-text search**: Search users and conversations
- **Automatic triggers**: Update timestamps and conversation metrics

## Security Notes

1. **Row Level Security** is enabled - users can only access their own data
2. **API Keys** are safe to use in client-side code (anon key)
3. **Service Role Key** should only be used server-side and kept secret

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**:
   - Verify your environment variables are correct
   - Check that the API key starts with `eyJ`

2. **"Relation does not exist" error**:
   - Make sure you ran the migration script
   - Check the table names in your queries

3. **Permission denied errors**:
   - Verify RLS policies are set up correctly
   - Ensure users are authenticated before accessing data

4. **Real-time not working**:
   - Check if real-time is enabled for your tables in Supabase dashboard
   - Verify your subscription code is correct

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Join the [Supabase Discord](https://discord.supabase.com)
3. Review the generated TypeScript types in `supabase-types.ts`

## Next Steps

1. **Authentication**: Set up user authentication with Supabase Auth
2. **Real-time**: Enable real-time subscriptions for live chat
3. **Storage**: Add file upload capabilities for images/attachments
4. **AI Integration**: Connect with Gemini API for smart suggestions
5. **Analytics**: Set up custom analytics dashboards

## Production Deployment

When deploying to production:

1. Update environment variables in your hosting platform
2. Set up proper CORS policies
3. Configure backup strategies
4. Monitor performance and usage
5. Set up alerts for critical metrics

Your HTV chat application is now ready with a robust Supabase backend! 🚀
