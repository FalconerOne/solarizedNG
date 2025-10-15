import { createClient } from "@supabase/supabase-js";

export const notifyAdminOnJoin = async (giveawayId: string, userId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get giveaway info
  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("title")
    .eq("id", giveawayId)
    .single();

  // Compose message
  const message = `A user just joined the giveaway: ${giveaway?.title || "Untitled"}`;

  // Notify admins
  await supabase.from("notifications").insert([
    {
      title: "New Participant Joined",
      message,
      type: "info",
      target_role: "admin",
      created_at: new Date().toISOString(),
    },
  ]);
};
