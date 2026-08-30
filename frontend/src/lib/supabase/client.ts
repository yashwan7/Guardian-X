import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

export function createClient() {
  const { url, key } = getSupabaseConfig();

  return createBrowserClient(url, key);
}

export const supabase = createClient();
