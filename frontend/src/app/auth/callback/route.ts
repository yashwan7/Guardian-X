import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedNext = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect');
  // Only allow local paths so an OAuth callback cannot become an open redirect.
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Detect canonical origin (handling Vercel/proxy headers)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let origin = requestUrl.origin;
  if (forwardedHost && !isLocalEnv) {
    origin = `https://${forwardedHost}`;
  }

  if (error) {
    console.error('OAuth error in callback:', error, errorDescription);
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase OAuth callback is missing NEXT_PUBLIC_SUPABASE_URL or a publishable key');
      return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
    }

    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          // exchangeCodeForSession() writes the access/refresh token cookies here.
          // They must be attached to the redirect response returned to the browser.
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return response;
    }

    console.error('Failed to exchange code for session:', exchangeError);
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
  }

  // If code is missing or invalid
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}
