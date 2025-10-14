"use client";

import React, { useEffect, useState } from "react";
import { fetchActualParticipantCount } from "@/lib/supabase/leaderboard";
import { getViewerId, fetchViewerProfile, isAdmin } from "@/lib/supabase/eligibility";

export default function AdminTrueCounts() {
  const [actual, setActual] = useState<number | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    (async () => {
      const viewerId = await getViewerId();
      if (!viewerId) return;
      const p = await fetchViewerProfile(viewerId);
      if (!isAdmin(p)) return;
      setIsAdminUser(true);
      const cnt = await fetchActualParticipantCount();
      setActual(cnt);
    })();
  }, []);

  if (!isAdminUser) return null;

  return (
    <div className="p-3 bg-slate-900 rounded-md border border-slate-800 text-sm text-slate-200">
      <strong>Actual participants:</strong> {actual ?? "loading..."}
    </div>
  );
}
