# Quick Supabase Setup for Chat Integration

## 🚀 **Setup Steps**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon key** from Settings → API

### 2. **Set Environment Variables**
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **Run Database Migration**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to create the tables

### 4. **Add Sample Data**
1. In **SQL Editor**, copy and paste the contents of `supabase/seed.sql`
2. Click **Run** to insert sample data

### 5. **Install Dependencies**
```bash
cd frontend
npm install @supabase/supabase-js
```

### 6. **Start the App**
```bash
npm run dev
```

## 🎯 **What You'll See**

- **Loading screen** while fetching data from Supabase
- **Real conversations** from your database
- **Send messages** that save to Supabase
- **Auto-refresh** after sending messages
- **Smart suggestions** based on user preferences

## 🔧 **Troubleshooting**

### **"Invalid API key" error**
- Check your environment variables are correct
- Make sure the URL starts with `https://` and key starts with `eyJ`

### **"Relation does not exist" error**
- Make sure you ran the migration script
- Check the table names in the SQL editor

### **No data showing**
- Make sure you ran the seed script
- Check the browser console for errors

## ✅ **Success Indicators**

- ✅ Loading screen appears briefly
- ✅ Conversations load from database
- ✅ Messages save when you send them
- ✅ Page refreshes with new data after sending
- ✅ Autofill suggestions appear

Your chat is now fully integrated with Supabase! 🚀
