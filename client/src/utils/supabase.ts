import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'; 

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key provided:', !!supabaseAnonKey);

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Supabase credentials missing! Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
