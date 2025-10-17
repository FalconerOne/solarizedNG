"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/config/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface WinnerEvent {
  id: string;
  giveaway_title: string;
  prize_name: string;
  prize_image?: string;
  winner_id: string;
  winner_name?: string;
  created_at: string;
}

export default function GlobalCelebrationListener({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const [activeEvent, setActiveEvent] = useState<WinnerEvent | null>(null);

  useEffect(() => {
    // 🎧 Subscribe to realtime winner_events insertions
    const channel = supabase
      .channel("global_winner_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "winner_events" },
        (payload) => {
          const event = payload.new as WinnerEvent;
          handleWinnerEvent(event);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleWinnerEvent = (event: WinnerEvent) => {
    // 🌈 Trigger confetti on all connected users
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });

    // 👀 Adjust message visibility by role
    let displayEvent = { ...event };

    if (userRole === "guest") {
      displayEvent.winner_name = undefined;
      displayEvent.giveaway_title = "A giveaway just ended!";
      displayEvent.prize_name = "A prize has been won 🎁";
    } else if (userRole === "user") {
      displayEvent.winner_name = undefined;
      displayEvent.giveaway_title = `${event.giveaway_title}`;
      displayEvent.prize_name = "A winner has been chosen 🎉";
    }

    setActiveEvent(displayEvent);

    // Auto-hide after 8 seconds
    setTimeout(() => setActiveEvent(null), 8000);
  };

  return (
    <AnimatePresence>
      {activeEvent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-0 right-0 flex justify-center z-[9999]"
        >
          <Card className="bg-white shadow-2xl rounded-2xl p-5 border border-gray-200 w-full max-w-md text-center">
            <img
              src={activeEvent.prize_image || "/placeholder.svg"}
              alt="Prize"
              className="w-24 h-24 object-cover rounded-xl mx-auto mb-3"
            />
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {activeEvent.giveaway_title}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{activeEvent.prize_name}</p>

            {activeEvent.winner_name && (
              <p className="text-green-600 font-semibold">
                🏆 Winner: {activeEvent.winner_name}
              </p>
            )}

            {!activeEvent.winner_name && (
              <p className="text-gray-500 italic">A winner has been selected!</p>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
