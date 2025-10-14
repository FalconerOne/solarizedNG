// /app/admin/test-panel/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLeaderboardData } from "@/lib/supabase/useLeaderboardData";

export default function AdminTestPanelPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { viewerId, rows, fullRows, referrals, loading: hookLoading, refresh } = useLeaderboardData();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const id = data?.session?.user?.id ?? null;
        if (!id) {
          setIsAdmin(false);
          setProfile(null);
          return;
        }
        const { data: prof } = await supabase.from("profiles").select("id, role, activated").eq("id", id).maybeSingle();
        setProfile(prof);
        setIsAdmin((prof?.role ?? "").toLowerCase() === "admin");
      } catch (e) {
        console.error("AdminTestPanel load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function runChecks() {
    // call a simple summary view we created
    try {
      const { data } = await supabase.from("leaderboard_counts_summary").select("*").maybeSingle();
      setSummary(data);
    } catch (e) {
      console.error("runChecks error", e);
      setSummary(null);
    }
  }

  if (loading || hookLoading) {
    return <div className="p-6 bg-slate-900 rounded-2xl text-slate-400">Loading admin test panel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 bg-rose-900/5 rounded-2xl border border-rose-200 text-center">
        <h3 className="text-lg font-semibold text-rose-400">Admin access required</h3>
        <p className="text-rose-200 mt-2">This panel is for admins only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Test Panel</h1>

      <div className="bg-slate-900 p-4 rounded-md border border-slate-800">
        <h3 className="text-lg font-medium">Leaderboard Data (RPC)</h3>
        <p className="text-slate-400 text-sm">ViewerId: {viewerId ?? "guest"}</p>
        <p className="text-slate-300">Rows fetched: {rows.length}</p>
        <p className="text-slate-300">Full rows fetched: {fullRows.length}</p>
        <p className="text-slate-300">Referrals (for viewer): {referrals.length}</p>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 bg-cyan-600 rounded" onClick={() => refresh()}>Refresh</button>
          <button className="px-3 py-1 bg-amber-600 rounded" onClick={() => runChecks()}>Run DB Summary Check</button>
        </div>
        {summary && (
          <pre className="mt-3 p-3 bg-slate-800 rounded text-sm overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
        )}
      </div>

      <div className="bg-slate-900 p-4 rounded-md border border-slate-800">
        <h3 className="text-lg font-medium">Quick Tests</h3>
        <ol className="list-decimal list-inside text-slate-300">
          <li>Confirm admin sees actual participants (use AdminTrueCounts card)</li>
          <li>Confirm activated users see full leaderboard</li>
          <li>Confirm guests/unactivated see capped/randomized view (<=60)</li>
          <li>Confirm referrer (activated) sees their referred users under "Your Referred Participants"</li>
        </ol>
      </div>
    </div>
  );
}
