import { createClient } from "@supabase/supabase-js";

// Protect against missing envs during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Composite Fetcher (for admin page preload) ===
export async function getAboutData() {
  try {
    const { data: mission } = await supabase
      .from("about_content")
      .select("*")
      .single();

    const { data: team } = await supabase
      .from("team_members")
      .select("*")
      .order("id");

    const { data: milestones } = await supabase
      .from("milestones")
      .select("*")
      .order("year");

    return { mission, team, milestones };
  } catch (err) {
    console.error("Error fetching about data:", err);
    return { mission: null, team: [], milestones: [] };
  }
}

// --- Mission ---
export async function getMission() {
  const { data, error } = await supabase
    .from("about_content")
    .select("*")
    .single();
  if (error) console.error("getMission error:", error);
  return data;
}

export async function updateMission(mission_text: string) {
  const { error } = await supabase
    .from("about_content")
    .update({ mission_text })
    .eq("id", 1);
  if (error) console.error("updateMission error:", error);
  return !error;
}

// --- Team ---
export async function getTeam() {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("id");
  if (error) console.error("getTeam error:", error);
  return data || [];
}

export async function addTeamMember(member: {
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
}) {
  const { error } = await supabase.from("team_members").insert(member);
  if (err
