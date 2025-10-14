"use client";

import React, { useState } from "react";
import { useLeaderboardData } from "@/lib/supabase/useLeaderboardData";
import ActivationGate from "@/components/dashboard/ActivationGate";
import AdminTrueCounts from "@/components/dashboard/AdminTrueCounts";

export default function LeaderboardGate() {
  const { viewerId, rows, fullRows, referrals, loading, refresh } = useLeaderboardData();
  const [reveal, setReveal] = useState(false);

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl">
        <p className="text-slate-400">Loading leaderboard...</p>
      </div>
    );
  }

  // Top-level UI uses ActivationGate to decide who sees children
  return (
    <ActivationGate showCounts>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Leaderboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refresh(); }}
              className="px-3 py-1 text-sm bg-slate-800 rounded-md"
            >
              Refresh
            </button>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={reveal} onChange={() => setReveal((r) => !r)} />
              <span className="text-slate-300">Reveal full view</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <ul className="space-y-2">
            {(reveal ? fullRows : rows).map((r, idx) => (
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

        {/* referrals shown only when present */}
        {referrals && referrals.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <h3 className="text-lg text-slate-200 mb-2">Your Referred Participants</h3>
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

        <AdminTrueCounts />
      </div>
    </ActivationGate>
  );
}
