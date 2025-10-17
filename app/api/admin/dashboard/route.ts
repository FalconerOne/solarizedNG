// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin Dashboard: Aggregated stats endpoint.
 * GET will return summary stats: total_giveaways, active_giveaways, participants_count, recent_winners
 *
 * Server-only: uses SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    // Total giveaways
    const [{ count: totalGiveaways }, { count: activeGiveaways }] = await Promise.all([
      admin.from("giveaways").select("id", { count: "exact", head: true }),
      admin
        .from("giveaways")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    // Total participants
    const { count: participantsCount } = await admin
      .from("participants")
      .select("id", { count: "exact", head: true });

    // Recent winners
    const { data: recentWinners } = await admin
      .from("winner_events")
      .select("id, giveaway_title, winner_name, prize_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Simple analytics aggregates (views, referrals)
    const { data: analytics } = await admin
      .from("admin_analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      stats: {
        totalGiveaways: totalGiveaways ?? 0,
        activeGiveaways: activeGiveaways ?? 0,
        participantsCount: participantsCount ?? 0,
        recentWinners: recentWinners ?? [],
        analytics: analytics ?? [],
      },
    });
  } catch (err: any) {
    console.error("dashboard route error", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
