// Natures Treasure - Supabase Configuration
// ===========================================
// Uses the Supabase CDN global (window.supabase)

const SUPABASE_URL = "https://kzdzrplfkkyggnttviws.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_93tzgmLg0wTk5uu-s3A_YQ_JUFJcu8G";

let supabaseClient;

try {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully.');
  } else {
    console.error('Supabase CDN not loaded. window.supabase =', window.supabase);
  }
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
}
