import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://siquyautjftrppskodyw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Missing credentials must never take the storefront down (browsing still
// works), so the client is created lazily and callers get null when it can't
// be built. Checkout treats null as a failed order and says so.
let client;

export function getSupabase() {
  if (client !== undefined) return client;
  client = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
  return client;
}
