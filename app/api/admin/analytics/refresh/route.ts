// app/api/admin/analytics/refresh/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Recompute and refresh admin analytics snapshot.
 * This endpoint aggregates key events and writes to admin_analytics table.
 * (Run on-demand from admin dashboard.)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function POST() {
  try {
    // Example aggregates: total signups, total entries, total donations
    const [{ count: totalSignups }, { count: totalEntries }, { data: donations }] = await Promise.all([
      admin.from("auth.users").select("id", { count: "exact", head: true }),
      admin.from("entries").select("id", { count: "exact", head: true }),
      admin.from("charity_donations").select("amount"),
    ]);

    const totalDonations = (donations || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);

    const row = {
      metric_date: new Date().toISOString(),
      total_signups: totalSignups ?? 0,
      total_entries: totalEntries ?? 0,
      total_donations: totalDonations,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await admin.from("admin_analytics").insert([row]).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, analytics: data });
  } catch (err: any) {
    console.error("analytics refresh error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
