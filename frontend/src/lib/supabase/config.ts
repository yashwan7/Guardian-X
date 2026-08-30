export interface SupabaseConfig {
  url: string;
  key: string;
}

function getEnvironmentValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return '';
}

/**
 * Keep every Supabase client (browser, server, and middleware) on the same
 * project. Never silently fall back to a different project in production:
 * that makes OAuth callbacks fail with an apparently valid but wrong session.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = getEnvironmentValue('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvironmentValue(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );

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
