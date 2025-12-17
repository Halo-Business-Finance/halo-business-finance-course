import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kagwfntxlgzrcngysmlt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ3dmbnR4bGd6cmNuZ3lzbWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjEyNzQsImV4cCI6MjA3MDc5NzI3NH0.7AIVzxor5cgykV7X5Yh-nd3XGAksvzzeqApL-kEVl-g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Use sessionStorage for improved security - clears on browser close
// This prevents auth tokens from persisting and reduces XSS attack surface
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for improved security
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // Reduced rate limit per user
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});