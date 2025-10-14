// /lib/supabase/rewards.ts
import { supabase } from "./client";

export interface PointsConfig {
  daily_cap: number;
  share_points: number;
  signup_points: number;
  referral_bonus: number;
}

export async function getPointsConfig(): Promise<PointsConfig> {
  const { data, error } = await supabase.from("points_config").select("value").eq("key", "global").single();
  if (error || !data) {
    // fallback defaults
    return { daily_cap: 500, share_points: 10, signup_points: 50, referral_bonus: 30 };
  }
  const v = data.value;
  return {
    daily_cap: parseInt(v.daily_cap) || 500,
    share_points: parseInt(v.share_points) || 10,
    signup_points: parseInt(v.signup_points) || 50,
    referral_bonus: parseInt(v.referral_bonus) || 30,
  };
}

/**
 * Attempt to award points using RPC award_points
 * Returns { success, reason }
 */
export async function awardPoints(userId: string, points: number, action: string, giveawayId?: string, meta?: object) {
  const { data, error } = await supabase.rpc("award_points", {
    target_user: userId,
    points_to_award: points,
    action_text: action,
    gw_id: giveawayId ?? null,
    meta: meta ?? {}
  });
  if (error) {
    console.error("awardPoints error", error);
    return { success: false, reason: error.message || "rpc_error" };
  }
  return { success: !!data, reason: null };
}

export async function getDailyPoints(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_daily_points", { target_user: userId });
  if (error) {
    console.error("getDailyPoints error", error);
    return 0;
  }
  return data ?? 0;
}

export async function getPointsBalance(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_user_points_balance", { target_user: userId });
  if (error) {
    console.error("getPointsBalance error", error);
    return 0;
  }
  return data ?? 0;
}
