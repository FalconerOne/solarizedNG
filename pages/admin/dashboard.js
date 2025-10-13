const { data: stats } = await supabase.from("dashboard_stats").select("*").single();
const { data: winners } = await supabase.rpc("get_recent_winners", { limit_count: 5 });
