"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface WinnerEvent {
  giveaway_id: string;
  winner_id: string | null;
  prize_name: string;
  image_url?: string | null;
  message?: string | null;
  visible_to?: string;
  created_at?: string;
}

export default function GlobalCelebrationListener() {
  const [event, setEvent] = useState<WinnerEvent | null>(null);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    // Subscribe to realtime winner events
    const channel = supabase
      .channel("winner_events_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "winner_events" },
        (payload) => {
          const data = payload.new as WinnerEvent;
          console.log("🎉 New winner event received:", data);
          setEvent(data);
          triggerConfetti();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Trigger light canvas-based confetti burst
  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        startVelocity: 25,
        spread: 90,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  // Automatically hide popup after a few seconds
  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(() => setEvent(null), 8000);
    return () => clearTimeout(timer);
  }, [event]);

  if (!event) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={event.giveaway_id}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-8 inset-x-0 flex justify-center z-[9999]"
      >
        <div className="bg-white/90 backdrop-blur-md border border-indigo-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 max-w-md w-full mx-3">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt="Prize"
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
              🎁
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-indigo-700">
              {event.prize_name || "New Giveaway Winner!"}
            </h3>
            <p className="text-sm text-gray-600">
              {event.message ||
                "A lucky participant has just won! Check the giveaways page to see details."}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
