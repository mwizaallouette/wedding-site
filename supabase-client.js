const SUPABASE_URL = "https://taaerpdrddbfoqmsongu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xvSZPrnlkxDHp8eXzWeOYw_dYmXiDOF";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client initialized!");