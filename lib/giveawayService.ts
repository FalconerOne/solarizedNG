// /lib/giveawayService.ts
import { supabase } from "@/lib/supabaseClient";
import { Giveaway } from "@/lib/types";

/**
 * Fetch all giveaways
 */
export async function getGiveaways(): Promise<Giveaway[]> {
  const { data, error } = await supabase
    .from("giveaways")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching giveaways:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Add a new giveaway
 */
export async function createGiveaway(giveaway: Giveaway) {
  const { data, error } = await supabase
    .from("giveaways")
    .insert([giveaway])
    .select();

  if (error) {
    console.error("Error creating giveaway:", error.message);
    throw error;
  }

  return data?.[0];
}

/**
 * Toggle giveaway active/inactive
 */
export async function toggleGiveawayStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("giveaways")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating status:", error.message);
    throw error;
  }
}

/**
 * Delete a giveaway
 */
export async function deleteGiveaway(id: string) {
  const { error } = await supabase.from("giveaways").delete().eq("id", id);

  if (error) {
    console.error("Error deleting giveaway:", error.message);
    throw error;
  }
}
