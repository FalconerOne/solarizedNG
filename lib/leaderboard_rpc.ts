// /lib/supabase/leaderboard_rpc.ts
import { supabase } from "./client";

export interface LeaderboardRow {
  user_id: string;
  username: string;
  avatar_url?: string | null;
  activated: boolean;
  role?: string | null;
  total_points: number;
  display_participant_count: number;
}

/**
 * Call server-side RPC get_visible_leaderboard.
 * If viewerId is null -> passes null to RPC (treated as guest).
 */
export async function rpcGetVisibleLeaderboard(viewerId?: string | null, limit = 60): Promise<LeaderboardRow[]> {
  // Supabase rpc: send param name `target_user` that matches SQL function
  const params = { target_user: viewerId ?? null };
  const { data, error } = await supabase.rpc("get_visible_leaderboard", params);
  if (error) {
    console.error("rpcGetVisibleLeaderboard error:", error);
    return [];
  }
  // data will be array of rows matching leaderboard_view
  const rows = (data ?? []) as LeaderboardRow[];
  if (limit && rows.length > limit) return rows.slice(0, limit);
  return rows;
}

/**
 * Get referrals for a referrer (only returns people who were referred by the given id).
 */
export async function rpcGetReferralsForReferrer(referrerId: string): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc("get_referrals_for_referrer", { referrer: referrerId });
  if (error) {
    console.error("rpcGetReferralsForReferrer error:", error);
    return [];
  }
  return (data ?? []) as LeaderboardRow[];
}

/** Convenience: fetch viewer profile (from profiles) */
export async function fetchViewerProfile(viewerId?: string | null) {
  if (!viewerId) return null;
  const { data, error } = await supabase.from("profiles").select("id, username, avatar_url, activated, role, referred_by").eq("id", viewerId).maybeSingle();
  if (error) {
    console.error("fetchViewerProfile error", error);
    return null;
  }
  return data;
}
