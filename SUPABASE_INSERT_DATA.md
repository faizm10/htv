# Insert Mock Data into Supabase

This guide shows you how to insert the Laura & Faiz and Smith & Wosly conversations into your Supabase database.

## 🚀 Quick Setup

### Option 1: Run Complete Script (Recommended)
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `supabase/insert_mock_conversations.sql`
3. Click **Run** to execute all statements at once

### Option 2: Run Step by Step
If you encounter any issues, run the sections separately using `supabase/insert_mock_data_step_by_step.sql`:

1. **Step 1**: Run the "Insert Users" section
2. **Step 2**: Run the "Insert Conversations" section  
3. **Step 3**: Run the "Insert Messages" section
4. **Step 4**: Run the "Verify the data" section

## 📊 What Gets Inserted

### 👥 Users (4 total)
- **Laura** - Hiking and photography enthusiast 📸
- **Faiz** - Software engineer and coffee enthusiast ☕  
- **Smith** - Musician and dog lover 🎵🐕
- **Wosly** - Artist and yoga instructor 🧘‍♀️

### 💬 Conversations (3 total)
- **Laura & Faiz** - Weekend hiking plans
- **Smith & Wosly** - Music collaboration
- **Current User & Laura** - Photography tips

### 💭 Messages (8 total)
- **3 messages** in Laura & Faiz conversation
- **3 messages** in Smith & Wosly conversation  
- **2 messages** in Current User & Laura conversation

## ✅ Verification

After running the script, you should see:
```
table_name    | count
--------------+-------
Users         | 4
Conversations | 3
Messages      | 8
```

## 🔧 Troubleshooting

### "User already exists" error
```sql
-- Delete existing data first
DELETE FROM public.messages WHERE conversation_id IN ('conv_laura_faiz', 'conv_smith_wosly', 'conv_current_laura');
DELETE FROM public.conversations WHERE id IN ('conv_laura_faiz', 'conv_smith_wosly', 'conv_current_laura');
DELETE FROM public.users WHERE id IN ('laura_id', 'faiz_id', 'smith_id', 'wosly_id');
```

### "Foreign key constraint" error
Make sure you run the steps in order:
1. Users first
2. Conversations second
3. Messages last

### "current_user doesn't exist" error
If you get an error about `current_user`, you can:
1. Replace `current_user` with a real user ID, or
2. Skip the "Current User & Laura" conversation section

## 🎯 Next Steps

1. **Update your frontend environment** with real Supabase credentials
2. **Restart your dev server**: `npm run dev`
3. **Open your chat app** and see the new conversations!
4. **Test sending messages** - they'll now save to Supabase

## 🎉 Success!

Your chat app will now show:
- ✅ Laura & Faiz hiking conversation
- ✅ Smith & Wosly music collaboration
- ✅ Real-time message sending to Supabase
- ✅ Smart autofill suggestions
- ✅ Conversation health metrics
