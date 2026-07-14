import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const isConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://supabase.co' && 
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project');

if (!isConfigured) {
  console.warn(
    'Supabase is not configured! The application is falling back to dummy values and local mock data. ' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local .env.local file or Vercel settings.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
