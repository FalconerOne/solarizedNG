import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  // 1️⃣ Allow ?preview=true to bypass maintenance
  const previewBypass = req.nextUrl.searchParams.get('preview') === 'true';
  if (previewBypass) {
    return res; // let through immediately
  }

  // 2️⃣ Get user session + maintenance mode
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  const maintenanceMode = setting?.value === true;
  const userRole = session?.user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';

  // 3️⃣ If maintenance is on and user is not admin, redirect
  if (maintenanceMode && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  return res;
}

// Apply globally except static + API
export const config = {
  matcher: [
    '/((?!api|_next|favicon|maintenance).*)',
  ],
};
