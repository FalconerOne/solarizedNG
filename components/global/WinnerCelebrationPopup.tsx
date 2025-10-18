"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  role: "admin" | "supervisor" | "user";
  activated: boolean;
  user_name: string;
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

export default function WinnerCelebrationPopup() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [active, setActive] = useState<NotificationPayload | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initUser();
    subscribeToNotifications();
  }, []);

  async function initUser() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, activated, user_name")
        .eq("id", authUser.id)
        .single();

      setUser(profile);
    }
  }

  function subscribeToNotifications() {
    const channel = supabase
      .channel("winner_announcement_global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const note = payload.new as NotificationPayload;
          if (note.type === "winner_announcement") {
            setActive(note);
            launchConfetti();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function launchConfetti() {
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function maskWinnerName(fullMessage: string) {
    if (!user) return "🔒 Winner Hidden — Login to Reveal";

    // Admin/Supervisor → full
    if (user.role === "admin" || user.role === "supervisor") return fullMessage;

    // Activated user → masked name
    if (user.activated) {
      return fullMessage.replace(
        /([A-Za-z])([A-Za-z]+)([A-Za-z])/,
        (_, a, b, c) => `${a}${"*".repeat(b.length)}${c}`
      );
    }

    // Guest/unactivated
    return "🔒 Winner Hidden — Activate Your Account to See";
  }

  return (
    <AnimatePresence>
      {active && (
        <>
          <canvas
            ref={confettiRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9998 }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 text-center rounded-2xl p-6 max-w-sm shadow-2xl border border-gray-200"
            >
              <Trophy className="mx-auto text-yellow-400 w-12 h-12 mb-3" />
              <h2 className="text-2xl font-bold mb-2">
                {active.title || "🎉 Winner Finalized!"}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {maskWinnerName(active.message)}
              </p>
              <Button
                onClick={() => setActive(null)}
                variant="secondary"
                className="mt-2"
              >
                <X size={14} className="mr-1" /> Close
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
