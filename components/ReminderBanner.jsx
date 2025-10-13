"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ReminderBanner() {
  const [profile, setProfile] = useState(null);
  const [activeGiveaway, setActiveGiveaway] = useState(null);
  const [entriesCount, setEntriesCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      const userId = session.session.user.id;

      // get profile
      const { data: p } = await supabase.from("profiles").select("full_name, role").eq("id", userId).single();
      if (mounted) setProfile(p || null);

      // active giveaway
      const { data: g } = await supabase
        .from("giveaways")
        .select("id, title, activation_fee, is_paid, is_free, start_date, end_date")
        .eq("is_active", true)
        .limit(1)
        .single();
      if (mounted) setActiveGiveaway(g || null);

      // count user's activated entries for that giveaway
      if (g) {
        const { count } = await supabase
          .from("entries")
          .select("*", { count: "exact", head: true })
          .eq("giveaway_id", g.id)
          .eq("user_id", userId)
          .eq("is_activated", true);
        if (mounted) setEntriesCount(count || 0);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  if (!profile || !activeGiveaway) return null;

  const isActivated = entriesCount > 0;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-4">
      <div className="text-sm">
        {isActivated ? (
          <div>
            <div className="font-semibold">You’re active in the draw</div>
            <div className="text-xs">Giveaway: {activeGiveaway.title}</div>
          </div>
        ) : (
          <div>
            <div className="font-semibold">Activate to enter the draw</div>
            <div className="text-xs">Fee: {activeGiveaway.is_free ? "Free" : `₦${activeGiveaway.activation_fee}`}</div>
          </div>
        )}
      </div>

      {!isActivated && (
        <Link href={`/register`} className="bg-white text-orange-600 px-3 py-1 rounded font-semibold">Activate now</Link>
      )}
    </div>
  );
}
