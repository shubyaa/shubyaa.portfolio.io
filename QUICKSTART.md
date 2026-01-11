# Quick Start Guide

Get your Portfolio & Project Management Platform running in 5 minutes!

## Step 1: Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in:
   - Project name: "portfolio-platform"
   - Database password: (create a strong password)
   - Region: (choose closest to you)
3. Wait 2 minutes for setup to complete

## Step 2: Create Database (1 minute)

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy everything from `database-schema.sql` and paste it
4. Click "Run" or press Ctrl+Enter
5. You should see "Success. No rows returned"

## Step 3: Get Your API Keys (30 seconds)

1. Click "Settings" (gear icon) at the bottom left
2. Click "API" in the settings menu
3. Copy these two values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

## Step 4: Configure Your App (30 seconds)

1. In the project folder, copy `.env.example` to `.env`
2. Open `.env` in a text editor
3. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Install and Run (1 minute)

Open terminal in the project folder and run:

```bash
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The app will open at: http://localhost:3000

## Step 6: Create Your Admin Account (1 minute)

1. Click "Sign Up" on the website
2. Enter your details:
   - Full name
   - Email
   - Choose "Freelancer / Team Member" (we'll change this)
   - Password
3. Click "Create Account"

## Step 7: Make Yourself Admin (30 seconds)

1. Go back to Supabase dashboard
2. Click "SQL Editor"
3. Run this query (replace with YOUR email):
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
4. Refresh your app and you're now an admin!

## 🎉 You're Done!

You can now:
- ✅ Create projects
- ✅ Add team members
- ✅ Chat in real-time
- ✅ Track project progress
- ✅ Manage documents

## Next Steps

### Customize Your Portfolio

Edit `src/pages/Portfolio.jsx` to update:
- Your name and title
- Your projects
- Your skills
- Contact information

### Enable Google Login (Optional)

1. In Supabase: Authentication → Providers → Google
2. Follow the setup guide
3. Add credentials from Google Cloud Console

### Add Your First Project

1. Log in to your dashboard
2. Click "Create Project"
3. Fill in project details
4. Add team members
5. Start collaborating!

## Need Help?

Check the full README.md for:
- Detailed documentation
- Troubleshooting guide
- Feature explanations
- Deployment instructions

---

**Happy building! 🚀**
