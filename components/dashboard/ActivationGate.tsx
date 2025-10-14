"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { getViewerId, fetchViewerProfile, isActivated, isAdmin, subscribeToProfile, ViewerProfile } from "@/lib/supabase/eligibility";
import { fetchActualParticipantCount } from "@/lib/supabase/leaderboard";
import Link from "next/link";

interface ActivationGateProps {
  children: ReactNode;
  teaser?: ReactNode; // custom teaser for guests
  activateCtaHref?: string; // link to activation flow (e.g., /activate or /join)
  showCounts?: boolean; // whether to show participant counts in teasers
}

export default function ActivationGate({
  children,
  teaser,
  activateCtaHref = "/activate",
  showCounts = true,
}: ActivationGateProps) {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ViewerProfile | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(60);
  const [adminActualCount, setAdminActualCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      setLoading(true);
      const id = await getViewerId();
      setViewerId(id);
      const prof = id ? await fetchViewerProfile(id) : null;
      setProfile(prof ?? null);

      // read the display_count from leaderboard view via the helper view (best-effort)
      try {
        // call leaderboard view via REST is possible, but as a quick method, we rely on a capped constant
        // For a slightly more accurate value, fetch actual (admin will override)
        // keep default 60 if anything fails
      } catch (e) {
        // ignore
      }

      // if admin, fetch actual participant count to display in admin UI
      if (isAdmin(prof ?? null)) {
        const real = await fetchActualParticipantCount();
        setAdminActualCount(real);
      }

      // subscribe to profile changes (activation state updates) so UI updates live
      if (id) {
        unsub = subscribeToProfile(id, (p) => {
          setProfile(p);
        });
      }

      setLoading(false);
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl">
        <p className="text-slate-400">Loading access...</p>
      </div>
    );
  }

  // Guest / Not logged in -> show teaser
  if (!viewerId) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center">
        {teaser ?? (
          <>
            <h3 className="text-lg font-semibold text-slate-100">Leaderboard Preview</h3>
            <p className="text-slate-400 mt-2">Join and activate your entry to view the full leaderboard.</p>
            {showCounts && <p className="text-slate-200 mt-3 text-sm">Active participants: up to 60</p>}
            <div className="mt-4">
              <Link href="/signup" className="inline-block px-4 py-2 bg-cyan-600 rounded-md text-white">Sign up</Link>
            </div>
          </>
        )}
      </div>
    );
  }

  // Logged in but not activated -> activation prompt
  if (!isActivated(profile)) {
    return (
      <div className="p-6 bg-amber-900/5 rounded-2xl border border-amber-200 text-center">
        <h3 className="text-lg font-semibold text-amber-400">Activate to view the leaderboard</h3>
        <p className="text-amber-200 mt-2">Only activated participants can view the full leaderboard. Activate your entry to join the fun!</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={activateCtaHref} className="px-4 py-2 bg-amber-500 rounded-md text-white">Activate Now</Link>
          <Link href="/profile" className="px-4 py-2 bg-slate-700 rounded-md text-white">Profile</Link>
        </div>
        {showCounts && <p className="text-slate-200 mt-3 text-sm">Active participants: up to 60</p>}
      </div>
    );
  }

  // Admin override: if admin, optionally show admin actual count above children
  if (isAdmin(profile)) {
    return (
      <div>
        <div className="mb-4 p-3 bg-slate-800 rounded-md border border-slate-700 text-sm text-slate-200">
          Admin view — actual participants: {adminActualCount ?? "loading..."}
        </div>
        <div>{children}</div>
      </div>
    );
  }

  // Activated participant: render children (full access, but UI components should still use display_count helpers)
  return <div>{children}</div>;
}
