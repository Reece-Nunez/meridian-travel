import { createClient } from '@supabase/supabase-js'

// Hardcoded values for testing - NEVER commit this to production
const supabaseUrl = 'https://sgcxjlpcqsbiusugslnf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnY3hqbHBjcXNiaXVzdWdzbG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjAxODQsImV4cCI6MjA3MjI5NjE4NH0.m7-9F5x9zUzgBbMEpQ9G1ZE8zoN4XTaFVXNWjUkGksc'

export const supabaseTest = createClient(supabaseUrl, supabaseAnonKey)