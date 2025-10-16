"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getDashboardData() {
  const supabase = createServerComponentClient({ cookies });

  // 1️⃣ Fetch total giveaways
  const { count: totalGiveaways } = await supabase
    .from("giveaways")
    .select("*", { count: "exact", head: true });

  // 2️⃣ Fetch total participants
  const { count: totalParticipants } = await supabase
    .from("giveaway_participants")
    .select("*", { count: "exact", head: true });

  // 3️⃣ Fetch total active giveaways
  const { count: activeGiveaways } = await supabase
    .from("giveaways")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 4️⃣ Fetch total registered users (non-guest)
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("role", "guest");

  // 5️⃣ Fetch total guest users
  const { count: totalGuests } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "guest");

  // 6️⃣ Fetch manual total donations (admin-managed)
  const { data: donations, error: donationError } = await supabase
    .from("charity_donations")
    .select("amount");

  const totalDonations = donations?.reduce(
    (sum: number, entry: any) => sum + (entry.amount || 0),
    0
  ) || 0;

  // 7️⃣ Fetch top users
  const { data: topUsers } = await supabase.rpc("get_top_users");

  // 8️⃣ Fetch recent activity
  const { data: recentActivity } = await supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

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
}
