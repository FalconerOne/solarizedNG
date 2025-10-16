"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getDashboardData() {
  const supabase = createServerComponentClient({ cookies });

  try {
    // 1️⃣ Total giveaways
    const { count: totalGiveaways } = await supabase
      .from("giveaways")
      .select("*", { count: "exact", head: true });

    // 2️⃣ Total participants
    const { count: totalParticipants } = await supabase
      .from("giveaway_participants")
      .select("*", { count: "exact", head: true });

    // 3️⃣ Active giveaways
    const { count: activeGiveaways } = await supabase
      .from("giveaways")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // 4️⃣ Registered users (non-guest)
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("role", "guest");

    // 5️⃣ Guest users
    const { count: totalGuests } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "guest");

    // 6️⃣ Donations (manual tracking table)
    const { data: donations, error: donationError } = await supabase
      .from("charity_donations")
      .select("amount");

    const totalDonations =
      donations?.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0) || 0;

    if (donationError) {
      console.warn("Donation data fetch issue:", donationError.message);
    }

    // 7️⃣ Top users (via RPC or view)
    const { data: topUsers, error: topUsersError } = await supabase.rpc("get_top_users");
    if (topUsersError) {
      console.warn("Top user RPC issue:", topUsersError.message);
    }

    // 8️⃣ Recent activity (last 10 entries)
    const { data: recentActivity, error: activityError } = await supabase
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (activityError) {
      console.warn("Activity log fetch issue:", activityError.message);
    }

    // ✅ Return unified structure
    return {
      totalGiveaways: totalGiveaways || 0,
      totalParticipants: totalParticipants || 0,
      activeGiveaways: activeGiveaways || 0,
      totalUsers: totalUsers || 0,
      totalGuests: totalGuests || 0,
      totalDonations,
      topUsers: topUsers || [],
      recentActivity: recentActivity || [],
    };
  } catch (error) {
    console.error("Dashboard data load error:", error);
    return {
      totalGiveaways: 0,
      totalParticipants: 0,
      activeGiveaways: 0,
      totalUsers: 0,
      totalGuests: 0,
      totalDonations: 0,
      topUsers: [],
      recentActivity: [],
    };
  }
}
