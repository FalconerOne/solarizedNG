"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/config/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalCelebrationListenerProps {
  userRole?: string;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  target_user: string | null;
  created_at: string;
  is_global?: boolean;
}

export default function GlobalCelebrationListener({
  userRole = "guest",
}: GlobalCelebrationListenerProps) {
  const supabase = createClient();
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const confettiInterval = useRef<NodeJS.Timeout | null>(null);

  // 🎉 Confetti effect
  const triggerConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    function frame() {
      confetti({
        ...defaults,
        particleCount: 3,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  };

  // 🧠 Auto-hide celebration
  const startAutoCleanup = () => {
    if (confettiInterval.current) clearTimeout(confettiInterval.current);
    confettiInterval.current = setTimeout(() => {
      setShowCelebration(false);
      setMessage("");
      setTitle("");
    }, 10000); // hide after 10s
  };

  useEffect(() => {
    const channel = supabase
      .channel("global-winner-celebrations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as NotificationPayload;
          if (newNotif.type === "winner_announcement") {
            // Role-based masking
            const visible =
              userRole === "admin" ||
              userRole === "activated_user" ||
              userRole === "supervisor";

            const safeTitle = newNotif.title || "🎉 New Winner!";
            const safeMessage = visible
              ? newNotif.message
              : "🎉 A new giveaway winner has been announced! Activate your account to see the details.";

            setTitle(safeTitle);
            setMessage(safeMessage);
            setShowCelebration(true);
            triggerConfetti();
            startAutoCleanup();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (confettiInterval.current) clearTimeout(confettiInterval.current);
    };
  }, [userRole]);

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          key="global-celebration-popup"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 right-6 bg-white shadow-2xl border border-indigo-200 rounded-2xl p-5 z-[9999] max-w-sm w-full flex flex-col gap-2"
        >
          <h3 className="text-lg font-semibold text-indigo-700">{title}</h3>
          <p className="text-gray-700 text-sm">{message}</p>
          <div className="text-xs text-gray-400 pt-2">
            (Auto-closing in a few seconds)
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
