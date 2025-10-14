// /lib/supabase/useLeaderboardData.ts
import { useEffect, useState, useCallback } from "react";
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

async function rpcGetVisibleLeaderboard(viewerId?: string | null): Promise<LeaderboardRow[]> {
  try {
    const { data, error } = await supabase.rpc("get_visible_leaderboard", { target_user: viewerId ?? null });
    if (error) {
      console.error("rpcGetVisibleLeaderboard error", error);
      return [];
    }
    return (data ?? []) as LeaderboardRow[];
  } catch (e) {
    console.error("rpcGetVisibleLeaderboard unexpected", e);
    return [];
  }
}

async function rpcGetReferralsForReferrer(referrerId: string): Promise<LeaderboardRow[]> {
  try {
    const { data, error } = await supabase.rpc("get_referrals_for_referrer", { referrer: referrerId });
    if (error) {
      console.error("rpcGetReferralsForReferrer error", error);
      return [];
    }
    return (data ?? []) as LeaderboardRow[];
  } catch (e) {
    console.error("rpcGetReferralsForReferrer unexpected", e);
    return [];
  }
}

export function useLeaderboardData() {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [fullRows, setFullRows] = useState<LeaderboardRow[]>([]);
  const [referrals, setReferrals] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (id: string | null) => {
    setLoading(true);
    try {
      const visible = await rpcGetVisibleLeaderboard(id);
      setRows(visible.slice(0, 60));
      setFullRows(visible); // fullRows may be used by admin/activated reveal toggle
      // fetch referrals if activated (we'll decide activation on consumer side)
      if (id) {
        const { data: profile } = await supabase.from("profiles").select("activated, role").eq("id", id).maybeSingle();
        if (profile?.activated) {
          const refRows = await rpcGetReferralsForReferrer(id);
          setReferrals(refRows);
        } else {
          setReferrals([]);
        }
      } else {
        setReferrals([]);
      }
    } catch (e) {
      console.error("useLeaderboardData load error", e);
      setRows([]);
      setFullRows([]);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsub: () => void;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const id = data?.session?.user?.id ?? null;
      setViewerId(id);
      await load(id);

      // subscribe to activity_log inserts & profile updates to refresh the board
      const channel = supabase
        .channel("leaderboard-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, () => load(id))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => load(id))
        .subscribe();

      unsub = () => supabase.removeChannel(channel);
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [load]);

  return { viewerId, rows, fullRows, referrals, loading, refresh: () => load(viewerId) };
}
