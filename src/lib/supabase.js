import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://siquyautjftrppskodyw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Order logging is a nice-to-have; WhatsApp is the real order channel.
// Missing credentials must never take the storefront down, so the client is
// created lazily and callers get null when it can't be built.
let client;

export function getSupabase() {
  if (client !== undefined) return client;
  client = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
  return client;
}
