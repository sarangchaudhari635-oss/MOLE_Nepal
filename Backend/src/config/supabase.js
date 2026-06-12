const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn(
    '⚠  Supabase credentials missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}

/**
 * Supabase admin client (uses service role key — bypasses RLS).
 * Use this ONLY on the server. Never expose to the frontend.
 * Returns a no-op stub when credentials are missing (avoids crash at import).
 */
let supabase;
let supabasePublic;

if (SUPABASE_URL && SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else {
  // Stub that returns error responses — prevents crashes during syntax checks
  const stub = new Proxy({}, {
    get: () => () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  });
  supabase = stub;
}

if (SUPABASE_URL && ANON_KEY) {
  supabasePublic = createClient(SUPABASE_URL, ANON_KEY);
} else {
  supabasePublic = new Proxy({}, {
    get: () => () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  });
}

module.exports = { supabase, supabasePublic };

