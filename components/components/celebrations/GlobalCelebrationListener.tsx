"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [showTestButton, setShowTestButton] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 Load fanfare sound
  useEffect(() => {
    audioRef.current = new Audio("/sounds/fanfare.mp3");
    audioRef.current.volume = 0.85;
  }, []);

  // 🧭 Load user + role
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSessionUserId(user?.id || null);

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      setUserRole(data?.role || "guest");
    };
    loadUser();
  }, [supabase]);

  // 🎉 Confetti animation
  const triggerConfetti = useCallback(() => {
    const duration = 3500;
    const end = Date.now() + duration;

    (function frame() {
      const particleCount = window.innerWidth < 640 ? 2 : 4;
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  // 🔊 Fanfare trigger
  const playFanfare = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch(() => console.warn("Autoplay blocked (mobile)."));
    }
  }, []);

  // 🔔 Supabase realtime listener
  useEffect(() => {
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotification = payload.new as CelebrationData;
          if (newNotification.type === "winner_announcement") {
            let msg = newNotification.message;
            if (
              userRole !== "admin" &&
              userRole !== "supervisor" &&
              userRole !== "activated"
            ) {
              msg =
                "🎉 A winner has been selected! (Activate your account to view full details)";
            }
            setCelebration({
              title: newNotification.title,
              message: msg,
              image_url: newNotification.image_url,
            });
            triggerConfetti();
            playFanfare();
            setTimeout(() => setCelebration(null), 7000);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [supabase, triggerConfetti, playFanfare, userRole]);

  // 🧪 Admin test trigger
  const handleTestCelebration = () => {
    setCelebration({
      title: "🎊 Test Celebration",
      message: "Demo winner popup! Confetti + sound + fade-out verification.",
      image_url: "/icons/icon-512x512.png",
    });
    triggerConfetti();
    playFanfare();
    setTimeout(() => setCelebration(null), 7000);
  };

  // ⏱️ Auto-hide + reactivation logic
  useEffect(() => {
    if (userRole === "admin") {
      setShowTestButton(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setShowTestButton(false), 30000);
    }
  }, [userRole]);

  // ⌨️ Reactivate with Shift + C
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "c" && userRole === "admin") {
        setShowTestButton((prev) => !prev);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setShowTestButton(false), 30000);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [userRole]);

  // 🎭 Celebration popup UI
  return (
    <>
      <AnimatePresence>
        {celebration && (
          <motion.div
            key="celebration-modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full text-center p-4 sm:p-6 border border-gray-300 dark:border-gray-700"
            >
              {celebration.image_url && (
                <div className="mb-4 flex justify-center">
                  <Image
                    src={celebration.image_url}
                    alt="Celebration"
                    width={160}
                    height={160}
                    className="rounded-xl object-cover"
                  />
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                {celebration.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base px-1">
                {celebration.message}
              </p>
              <button
                onClick={() => setCelebration(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔊 Audio preload */}
      <audio ref={audioRef} preload="auto" src="/sounds/fanfare.mp3" />

      {/* 🧪 Admin floating test button */}
      {userRole === "admin" && showTestButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-5 right-5 z-[9999]"
        >
          <button
            onClick={handleTestCelebration}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full text-xs shadow-lg"
          >
            Test Celebration 🎉
          </button>
        </motion.div>
      )}
    </>
  );
}
