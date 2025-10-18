"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";

type CelebrationData = {
  title: string;
  message: string;
  image_url?: string | null;
  target_user?: string | null;
  type?: string;
};

export default function GlobalCelebrationListener() {
  const supabase = createClientComponentClient();
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // 🎯 Load user info
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSessionUserId(user?.id || null);

      // Get user role from custom table or metadata
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      setUserRole(data?.role || "guest");
    };
    loadUser();
  }, [supabase]);

  // 🎊 Trigger confetti animation
  const triggerConfetti = useCallback(() => {
    const duration = 3500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // 🔔 Listen for new notifications (Supabase realtime)
  useEffect(() => {
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const newNotification = payload.new as CelebrationData;

          if (newNotification.type === "winner_announcement") {
            // Visibility rule enforcement
            let messageToShow = newNotification.message;
            if (
              userRole !== "admin" &&
              userRole !== "supervisor" &&
              userRole !== "activated"
            ) {
              messageToShow = "🎉 A winner has been selected! (Activate your account to view full details)";
            }

            setCelebration({
              title: newNotification.title,
              message: messageToShow,
              image_url: newNotification.image_url,
            });

            triggerConfetti();
            setTimeout(() => setCelebration(null), 7000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, triggerConfetti, userRole]);

  // 🎭 UI Celebration Popup
  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key="celebration-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-[90%] text-center p-6 border border-gray-300 dark:border-gray-700"
          >
            {celebration.image_url && (
              <div className="mb-4">
                <Image
                  src={celebration.image_url}
                  alt="Celebration"
                  width={160}
                  height={160}
                  className="mx-auto rounded-xl object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              {celebration.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {celebration.message}
            </p>
            <button
              onClick={() => setCelebration(null)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
