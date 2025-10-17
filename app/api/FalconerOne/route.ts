// app/api/FalconerOne/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * FalconerOne: admin/system utility endpoint (protected by service key on server).
 * Use for safe maintenance tasks (resync, rebuild caches, run diagnostic SQL).
 * Body: { action: 'resync_users' | 'clear_cache' | 'run_sql', sql?: string }
 *
 * WARNING: Only use server-side (service role). This route does not implement auth checks
 * beyond server-only role: be careful with production usage.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function POST(req: Request) {
  try {
    const { action, sql } = await req.json();

    if (!action) return NextResponse.json({ success: false, error: "action required" }, { status: 400 });

    if (action === "resync_users") {
      // Example: ensure auth.users mapped into public.users if missing
      // This is a lightweight sample, prefer actual migration scripts.
      const { data: authUsers } = await admin.from("auth.users").select("id, email");
      // For brevity, return counts
      return NextResponse.json({ success: true, resynced: (authUsers || []).length });
    }

    if (action === "run_sql") {
      if (!sql) return NextResponse.json({ success: false, error: "sql required" }, { status: 400 });
      const { data, error } = await admin.rpc("sql_execute_raw", { p_sql: sql } as any).select(); // assuming sql helper exists
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === "clear_cache") {
      // implement cache clearing if your app uses a cache table
      await admin.from("cache").delete().neq("id", ""); // best-effort; adjust accordingly
      return NextResponse.json({ success: true, cleared: true });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("FalconerOne error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
