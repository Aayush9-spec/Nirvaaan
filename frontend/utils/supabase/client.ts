import { createBrowserClient } from '@supabase/ssr'

// Fallback placeholders allow the build to succeed even when env vars
// are not set (e.g. during Vercel static prerendering).
// The real values are used at runtime in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
