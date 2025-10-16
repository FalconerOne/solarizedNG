"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface WinnerCelebrationProps {
  visible: boolean;
  onClose: () => void;
  giveawayTitle: string;
  winnerName: string;
  prizeImage?: string | null;
  isVisibleToUser: boolean;
}

export default function WinnerCelebration({
  visible,
  onClose,
  giveawayTitle,
  winnerName,
  prizeImage,
  isVisibleToUser,
}: WinnerCelebrationProps) {
  const hasCelebrated = useRef(false);

  // 🎊 Trigger confetti when popup becomes visible
  useEffect(() => {
    if (visible && !hasCelebrated.current) {
      hasCelebrated.current = true;
      const duration = 5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFA500", "#FFD700", "#FF4500"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFA500", "#FFD700", "#FF4500"],
        });
        requestAnimationFrame(frame);
      };
      frame();

      const timer = setTimeout(() => {
        onClose();
        hasCelebrated.current = false;
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              🎉 Winner Announced!
            </h2>
            <p className="text-gray-500 mb-4">{giveawayTitle}</p>

            {prizeImage && (
              <img
                src={prizeImage}
                alt="Prize"
                className="mx-auto mb-4 rounded-2xl shadow-lg w-40 h-40 object-cover"
              />
            )}

            <p className="text-lg font-semibold text-gray-800 mb-4">
              {isVisibleToUser
                ? `🏆 ${winnerName}`
                : "🎁 Winner Revealed — Activate any GiveAway to view!"}
            </p>

            <button
              onClick={onClose}
              className="mt-2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
