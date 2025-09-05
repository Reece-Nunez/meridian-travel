import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// During build time or when environment variables are missing, create a dummy client
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing - using dummy client for build')
    return createClient('https://dummy.supabase.co', 'dummy-key')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Server-side client with service role key (for admin operations)
// Only create this on the server side where the service role key is available
export const createSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side')
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey || !supabaseUrl) {
    const error = new Error(`Missing Supabase admin environment variables: URL=${!!supabaseUrl}, ServiceKey=${!!serviceRoleKey}`)
    console.error('createSupabaseAdmin error:', error.message)
    throw error
  }

  console.log('Creating Supabase admin client with URL:', supabaseUrl)
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}