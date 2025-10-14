import { supabase } from "./client";

export interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  created_at: string;
  status: "pending" | "converted";
}

export interface ReferralStats {
  totalReferrals: number;
  converted: number;
  pending: number;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId);

  if (error) {
    console.error("Referral fetch error:", error);
    return { totalReferrals: 0, converted: 0, pending: 0 };
  }

  const converted = data.filter((r) => r.status === "converted").length;
  const pending = data.filter((r) => r.status === "pending").length;

  return {
    totalReferrals: data.length,
    converted,
    pending,
  };
}

export async function logReferral(referrerId: string, referredUserId: string) {
  const { error } = await supabase.from("referrals").insert([
    { referrer_id: referrerId, referred_user_id: referredUserId },
  ]);
  if (error) console.error("Log referral error:", error);
}

export async function getLeaderboard() {
  const { data, error } = await supabase.rpc("get_referral_leaderboard");
  if (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
  return data;
}
