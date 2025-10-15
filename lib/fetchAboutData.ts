import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAboutData() {
  const { data: mission } = await supabase
    .from("about_content")
    .select("mission_text")
    .single();

  const { data: team } = await supabase
    .from("team_members")
    .select("id, name, role, bio, photo_url")
    .order("id", { ascending: true });

  const { data: milestones } = await supabase
    .from("milestones")
    .select("year, title, description")
    .order("year", { ascending: true });

  return { mission, team, milestones };
}
