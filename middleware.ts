import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/charities', '/how-it-works', '/pricing'];
const ADMIN_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/dashboard', '/subscribe'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Allow Stripe webhooks without auth
  if (pathname.startsWith('/api/webhooks')) return response;

  // Allow public charity sub-paths
  if (pathname.startsWith('/charities')) return response;

  // Auth check for protected routes
  if (!user) {
    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
    const isProtectedApi =
      pathname.startsWith('/api/') &&
      !pathname.startsWith('/api/auth') &&
      !pathname.startsWith('/api/charities') &&
      !pathname.startsWith('/api/webhooks');

    if (isProtected || isAdmin || isProtectedApi) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Admin route protection
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) || pathname.startsWith('/api/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
