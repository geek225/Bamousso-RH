import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ntqbwmvwhtmovdcmwyrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cWJ3bXZ3aHRtb3ZkY213eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDc2MjksImV4cCI6MjA5Mjg4MzYyOX0.IrnBYXI6rv2pHqgUMdRwrQA5ziAmkFvd0QNQUWBtAsw'; 

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing from ENV, using hardcoded fallbacks.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
