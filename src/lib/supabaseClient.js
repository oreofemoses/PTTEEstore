import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and Anon Key are required. Check your environment setup or supabaseClient.js");
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Recommended to persist session to localStorage for better UX
    persistSession: true,
    // Recommended to auto refresh token to prevent expired tokens
    autoRefreshToken: true,
    // Recommended to detect session in URL for OAuth and magic links
    detectSessionInUrl: true
  },
  // Global fetch options
  // fetch: (input, init) => {
  //   // You could add custom headers or logging here if needed
  //   // console.log('Supabase fetch:', input, init);
  //   return fetch(input, init);
  // }
});