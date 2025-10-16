"use client";

import { useEffect, useState } from "react";
import WinnerCelebration from "./WinnerCelebration";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GlobalCelebrationListener() {
  const supabase = createClientComponentClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<any>(null);

  useEffect(() => {
    const channel = supabase
      .channel("global-winner-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "giveaways",
          filter: "status=eq.finalized",
        },
        (payload) => {
          console.log("🎉 Winner finalized event:", payload);
          setWinnerInfo(payload.new);
          setShowConfetti(true);

          // Auto hide confetti after 10 seconds
          setTimeout(() => setShowConfetti(false), 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!showConfetti) return null;

  return (
    <>
      <WinnerCelebration />
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-50">
        <h1 className="text-4xl font-bold mb-4 animate-bounce">🎉 We Have a Winner! 🎉</h1>
        {winnerInfo && (
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold">{winnerInfo.title}</p>
            <p className="text-md opacity-90">
              {winnerInfo.winner_name
                ? `Winner: ${winnerInfo.winner_name}`
                : "Winner details are hidden for guests."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
