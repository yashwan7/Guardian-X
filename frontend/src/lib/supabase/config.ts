export interface SupabaseConfig {
  url: string;
  key: string;
}

// These are Supabase's public browser credentials for the current Guardian X
// deployment. Vercel environment variables still take precedence, but keeping
// the known-good public fallback lets the login page prerender when a Vercel
// environment has not been configured yet.
const DEFAULT_SUPABASE_URL = 'https://atnsdjitpviqlvyzhlxj.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_ukq7bxCDv-iyPxkl1BlcZA_yvjNWGEB';

function getEnvironmentValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return '';
}

/**
 * Keep every Supabase client (browser, server, and middleware) on the same
 * project. Environment variables can override the checked-in public defaults,
 * but all runtime clients still resolve the exact same values.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url =
    getEnvironmentValue('NEXT_PUBLIC_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
  const key =
    getEnvironmentValue(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ) || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  let isValidUrl = false;
  try {
    const parsedUrl = new URL(url);
    isValidUrl = parsedUrl.protocol === 'https:' && parsedUrl.hostname.endsWith('.supabase.co');
  } catch {
    isValidUrl = false;
  }

  if (!isValidUrl || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_')) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the deployment environment.'
    );
  }

  return { url, key };
}

export function tryGetSupabaseConfig() {
  try {
    return getSupabaseConfig();
  } catch {
    return null;
  }
}
