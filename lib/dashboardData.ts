import { createClient } from "@supabase/supabase-js";

export async function getDashboardData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1️⃣ Fetch totals
  const [{ count: totalGiveaways }, { count: totalParticipants }] = await Promise.all([
    supabase.from("giveaways").select("*", { count: "exact", head: true }),
    supabase.from("giveaway_participants").select("*", { count: "exact", head: true }),
  ]);

  // 2️⃣ Fetch top users via the function
  const { data: topUsers } = await supabase.rpc("get_top_users");

  // 3️⃣ Fetch recent activity
  const { data: recentActivity } = await supabase
    .from("activity_log")
    .select("details, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalGiveaways: totalGiveaways || 0,
    totalParticipants: totalParticipants || 0,
    topUsers: topUsers || [],
    recentActivity: recentActivity || [],
  };
}
