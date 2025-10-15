import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// === Composite Fetcher (for admin page preload) ===
export async function getAboutData() {
  const { data: mission } = await supabase.from("about_content").select("*").single();
  const { data: team } = await supabase.from("team_members").select("*").order("id");
  const { data: milestones } = await supabase.from("milestones").select("*").order("year");
  return { mission, team, milestones };
}

// --- Mission ---
export async function getMission() {
  const { data } = await supabase.from("about_content").select("*").single();
  return data;
}

export async function updateMission(mission_text: string) {
  return await supabase.from("about_content").update({ mission_text }).eq("id", 1);
}

// --- Team ---
export async function getTeam() {
  const { data } = await supabase.from("team_members").select("*").order("id");
  return data || [];
}

export async function addTeamMember(member: {
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
}) {
  return await supabase.from("team_members").insert(member);
}

export async function updateTeamMember(
  id: number,
  updates: Record<string, any>
) {
  return await supabase.from("team_members").update(updates).eq("id", id);
}

export async function deleteTeamMember(id: number) {
  return await supabase.from("team_members").delete().eq("id", id);
}

// --- Milestones ---
export async function getMilestones() {
  const { data } = await supabase.from("milestones").select("*").order("year");
  return data || [];
}

export async function addMilestone(ms: {
  year: number;
  title: string;
  description: string;
}) {
  return await supabase.from("milestones").insert(ms);
}

export async function updateMilestone(id: number, updates: Record<string, any>) {
  return await supabase.from("milestones").update(updates).eq("id", id);
}

export async function deleteMilestone(id: number) {
  return await supabase.from("milestones").delete().eq("id", id);
}
