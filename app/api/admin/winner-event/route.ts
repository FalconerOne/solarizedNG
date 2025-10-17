// app/api/admin/winner-event/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Fetch winner events, optionally filtered by date or giveaway.
 * Query params accepted: ?limit=20&giveaway_id=...
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const giveaway_id = url.searchParams.get("giveaway_id");

    let q = admin.from("winner_events").select("*").order("created_at", { ascending: false }).limit(limit);
    if (giveaway_id) q = q.eq("giveaway_id", giveaway_id);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ success: true, events: data ?? [] });
  } catch (err: any) {
    console.error("winner-event GET error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
