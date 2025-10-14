// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // Allow static assets and admin panel to bypass
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load maintenance setting
  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .eq("key", "maintenance_mode")
    .single();

  if (settings?.value) {
    // Check if user is admin (bypass)
    const accessToken = req.cookies.get("sb-access-token")?.value;
    if (accessToken) {
      const { data: { user } = { user: null } } = await supabase.auth.getUser(accessToken);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") {
          return NextResponse.next(); // Admin allowed
        }
      }
    }

    // Non-admin users see maintenance screen
    const maintenanceUrl = req.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.rewrite(maintenanceUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|admin|static|favicon.ico).*)", // apply to all except admin/API/static
  ],
};
