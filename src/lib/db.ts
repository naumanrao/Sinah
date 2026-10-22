import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key (bypasses RLS)
// This is used in API routes only — never exposed to the browser
let serverClient: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serverClient;
}

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'admission-documents';
