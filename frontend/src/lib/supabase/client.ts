import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://atnsdjitpviqlvyzhlxj.supabase.co';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_ukq7bxCDv-iyPxkl1BlcZA_yvjNWGEB';

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = createClient();
