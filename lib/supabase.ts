import { createClient } from "@supabase/supabase-js"

// Get environment variables - now using the provided credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ooccqixmkvcqwluypwyl.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vY2NxaXhta3ZjcXdsdXlwd3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTc0NzMsImV4cCI6MjA2MzY5MzQ3M30.cZMChDqzy1ZPXXo5oRxtiWxky0j__3f070ctGMK2sBQ"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vY2NxaXhta3ZjcXdsdXlwd3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODExNzQ3MywiZXhwIjoyMDYzNjkzNDczfQ.IPmLI-Wr0VIZi_5LIWtihS_4hwh0RgOkX4z_r82AR8c"

// Validate required environment variables
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create client - now should always work with the provided credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper to get configuration status
export const getSupabaseStatus = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl,
  }
}
