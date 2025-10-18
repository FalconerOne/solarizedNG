"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

interface CelebrationPopupProps {
  title: string;
  message: string;
  prizeImage?: string | null;
  userRole?: string;
  visibleDuration?: number;
}

/**
 * GlobalCelebrationPopup
 * - Shows when a giveaway winner is announced.
 * - Includes confetti animation and winner masking based on user role.
 */
export default function GlobalCelebrationPopup({
  title,
  message,
  prizeImage,
  userRole = "guest",
  visibleDuration = 8000,
}: CelebrationPopupProps) {
  const [visible, setVisible] = useState(true);

  // 🧨 Trigger confetti once when the popup appears
  useEffect(() => {
    if (!visible) return;

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        startVelocity: 20,
        spread: 80,
        origin: { y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-hide after visibleDuration
    const timer = setTimeout(() => setVisible(false), visibleDuration);
    return () => clearTimeout(timer);
  }, [visible, visibleDuration]);

  // 🕵️‍♂️ Mask winner info for guests
  const maskedMessage =
    userRole === "guest" || userRole === "inactive"
      ? "🎉 A winner has been announced! Activate your account to see full details."
      : message;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-6 right-6 z-[9999] flex flex-col bg-white shadow-xl rounded-2xl border border-gray-200 p-4 w-80"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-indigo-700 text-sm">{title}</h3>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>

          {prizeImage && (
            <div className="mt-2">
              <img
                src={prizeImage}
                alt="Prize"
                className="w-full h-32 object-cover rounded-xl border"
              />
            </div>
          )}

          <p className="mt-3 text-gray-700 text-sm leading-snug">{maskedMessage}</p>

          <div className="mt-3 flex justify-end">
            <motion.button
              onClick={() => setVisible(false)}
              className="text-indigo-600 text-xs font-semibold hover:underline"
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
