import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  // Get the session and maintenance flag
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  const maintenanceMode = setting?.value === true;

  // Allow access if admin or maintenance disabled
  const userRole = session?.user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';

  if (maintenanceMode && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  return res;
}

// Apply middleware globally
export const config = {
  matcher: [
    /*
      Apply to all routes except API and static assets
      (e.g. /_next, /favicon, /api, etc.)
    */
    '/((?!api|_next|favicon|maintenance).*)',
  ],
};
