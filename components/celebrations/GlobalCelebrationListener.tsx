"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/config/supabase";
import GlobalCelebrationPopup from "@/components/GlobalCelebrationPopup";

interface CelebrationEvent {
  id: string;
  title: string;
  message: string;
  prize_image?: string | null;
  type: string;
  created_at: string;
}

export default function GlobalCelebrationListener({
  userRole = "guest",
}: {
  userRole?: string;
}) {
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);

  useEffect(() => {
    const supabase = createClient();

    console.log("🎧 Global Celebration Listener active...");

    const channel = supabase
      .channel("global_winner_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "type=eq.winner_announcement",
        },
        (payload) => {
          console.log("🎉 Winner announcement received:", payload.new);

          const newEvent = payload.new as CelebrationEvent;

          // Set popup data
          setCelebration({
            id: newEvent.id,
            title: newEvent.title || "🎉 Winner Announced!",
            message:
              newEvent.message ||
              "A winner has been declared in one of the giveaways!",
            prize_image: (newEvent as any).prize_image || null,
            type: newEvent.type,
            created_at: newEvent.created_at,
          });

          // Auto clear after popup hides
          setTimeout(() => setCelebration(null), 10000);
        }
      )
      .subscribe();

    return () => {
      console.log("🧹 Cleaning up Global Celebration Listener...");
      supabase.removeChannel(channel);
    };
  }, []);

  // Render the popup only when a new celebration event arrives
  return (
    <>
      {celebration && (
        <GlobalCelebrationPopup
          key={celebration.id}
          title={celebration.title}
          message={celebration.message}
          prizeImage={celebration.prize_image}
          userRole={userRole}
        />
      )}
    </>
  );
}
