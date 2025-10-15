"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RealTimeParticipantCounter({ giveawayId }: { giveawayId: string }) {
  const supabase = createClientComponentClient();
  const [count, setCount] = useState<number | null>(null);

  // Fetch initial count
  const fetchCount = async () => {
    const { count, error } = await supabase
      .from("giveaway_participants")
      .select("*", { count: "exact", head: true })
      .eq("giveaway_id", giveawayId);
    if (!error) setCount(count || 0);
  };

  useEffect(() => {
    fetchCount();

    // Subscribe to real-time updates for participant table
    const channel = supabase
      .channel(`giveaway_${giveawayId}_participants`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "giveaway_participants",
          filter: `giveaway_id=eq.${giveawayId}`,
        },
        (payload) => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [giveawayId]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      🎉 Participants:{" "}
      <span className="font-semibold text-indigo-600">{count ?? "…"}</span>
    </div>
  );
}
