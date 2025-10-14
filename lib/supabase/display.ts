// /lib/supabase/display.ts
import { supabase } from "./client";

/**
 * Returns the display_count for a giveaway given the viewer's role/status.
 * Admins -> actual_count
 * Activated participants -> min(actual, 60)
 * Guests/unactivated -> min(actual + random(0..8), 60)  (keeps it lively without exposing real numbers)
 */
export async function getDisplayParticipantCount(giveawayId: string, viewerUserId?: string | null): Promise<number> {
  // fetch actual count
  const { data: countRes, error } = await supabase
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("giveaway_id", giveawayId);

  const actual = (countRes && (countRes as any).count) ? Number((countRes as any).count) : 0;

  // admin check
  if (viewerUserId) {
    const { data: profile } = await supabase.from("profiles").select("role, activated").eq("id", viewerUserId).single();
    if (profile?.role === "admin") return actual;
    if (profile?.activated) {
      return Math.min(actual, 60);
    }
    // unactivated/activated false
    const bump = Math.floor(Math.random() * 6); // 0..5
    return Math.min(actual + bump, 60);
  } else {
    // public guest
    const bump = Math.floor(Math.random() * 8); // 0..7
    return Math.min(actual + bump, 60);
  }
}
