import { createClient } from "@/config/supabase";

export async function fetchBanners(platform: "mygiveaway" | "skilllink") {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("banners")
    .select("message, url")
    .eq("platform", platform)
    .eq("active", true);

  if (error) {
    console.error("❌ Error fetching banners:", error);
    return [];
  }

  return data || [];
}
