import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export const TABLES = {
  PROFILES: 'profiles',
  PROJECTS: 'projects',
  PROJECT_MEMBERS: 'project_members',
  PROJECT_PHASES: 'project_phases',
  DOCUMENTS: 'documents',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  SHOWCASE_PROJECTS: 'showcase_projects'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  FREELANCER: 'freelancer',
  CLIENT: 'client'
}

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold'
}
