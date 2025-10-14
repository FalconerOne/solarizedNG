"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { rpcGetVisibleLeaderboard, rpcGetReferralsForReferrer, fetchViewerProfile, LeaderboardRow } from "@/lib/supabase/leaderboard_rpc";
import ActivationGate from "@/components/dashboard/ActivationGate"; // existing gate we made earlier
import AdminTrueCounts from "@/components/dashboard/AdminTrueCounts";

export default function LeaderboardEnhanced() {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerProfile, setViewerProfile] = useState<any | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [referrals, setReferrals] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll(vId: string | null) {
    setLoading(true);
    try {
      const [boardRows, prof] = await Promise.all([
        rpcGetVisibleLeaderboard(vId, 60),
        vId ? fetchViewerProfile(vId) : Promise.resolve(null),
      ]);
      setRows(boardRows);
      setViewerProfile(prof);

      // if user is activated AND they have referred users (referred_by used on profiles),
      // fetch their referred users' leaderboard rows for bonus visibility
      if (prof?.activated && prof?.id) {
        const refRows = await rpcGetReferralsForReferrer(prof.id);
        setReferrals(refRows);
      } else {
        setReferrals([]);
      }
    } catch (e) {
      console.error("loadAll error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let unsub: any;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const id = data?.session?.user?.id ?? null;
      setViewerId(id);
      await loadAll(id);

      // realtime subscription: listen for activity_log inserts and profiles updates to refresh view
      const channel = supabase
        .channel("leaderboard-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, () => {
          loadAll(id);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
          loadAll(id);
        })
        .subscribe();

      unsub = () => supabase.removeChannel(channel);
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (loading) {
    return <div className="p-6 bg-slate-900 rounded-2xl text-slate-400">Loading leaderboard...</div>;
  }

  // If not logged in -> show teaser
  if (!viewerId) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl text-center">
        <h3 className="text-lg font-semibold text-slate-100">Leaderboard Preview</h3>
        <p className="text-slate-400 mt-2">Join and activate to view the full leaderboard.</p>
        <p className="text-slate-200 mt-3 text-sm">Active participants: up to 60</p>
      </div>
    );
  }

  // Use ActivationGate to handle unactivated/activated/admin UI and gating
  return (
    <ActivationGate showCounts>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Leaderboard</h2>
          <AdminTrueCounts />
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <ul className="space-y-2">
            {rows.map((r, idx) => (
              <li key={r.user_id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={r.avatar_url ?? `/api/avatars/${r.user_id}`} alt={r.username} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-medium text-slate-100">{r.username}</div>
                    <div className="text-xs text-slate-400">#{idx + 1}</div>
                  </div>
                </div>
                <div className="text-slate-200 font-medium">{r.total_points} pts</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Referrals panel for activated referrers */}
        {viewerProfile?.activated && referrals.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <h3 className="text-lg text-slate-200 mb-2">Your Referred Participants</h3>
            <p className="text-slate-400 text-sm mb-3">Only you can see the progress of users you referred.</p>
            <ul className="space-y-2">
              {referrals.map((r) => (
                <li key={r.user_id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar_url ?? `/api/avatars/${r.user_id}`} alt={r.username} className="w-7 h-7 rounded-full" />
                    <div>
                      <div className="text-slate-100 font-medium">{r.username}</div>
                      <div className="text-xs text-slate-400">Points: {r.total_points}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ActivationGate>
  );
}
