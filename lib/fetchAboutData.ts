// lib/fetchAboutData.ts
import { createClient } from "@supabase/supabase-js";

export async function fetchAboutData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Try both naming variations for compatibility
    const [{ data: mission }, { data: team }, { data: milestones }] = await Promise.all([
      supabase
        .from("about_content")
        .select("*")
        .single()
        .then((res) => res.data || null),
      supabase
        .from("team_members")
        .select("*")
        .order("id", { ascending: true })
        .then((res) => res.data || []),
      supabase
        .from("milestones")
        .select("*")
        .order("year", { ascending: true })
        .then((res) => res.data || []),
    ]);

    return { mission, team, milestones };
  } catch (err) {
    console.error("⚠️ fetchAboutData error:", err);
    return { mission: null, team: [], milestones: [] };
  }
}
