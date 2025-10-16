"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface WinnerCelebrationProps {
  giveawayTitle: string;
  winnerName?: string;
  prizeImage?: string | null;
  visible: boolean;
  userRole?: "admin" | "supervisor" | "activated" | "guest";
  onClose?: () => void;
}

export default function WinnerCelebration({
  giveawayTitle,
  winnerName,
  prizeImage,
  visible,
  userRole = "guest",
  onClose,
}: WinnerCelebrationProps) {
  const [confettiRunning, setConfettiRunning] = useState(false);

  useEffect(() => {
    if (visible && !confettiRunning) {
      setConfettiRunning(true);

      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          setConfettiRunning(false);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const maskedWinner =
    userRole === "guest" ? "Hidden (Activate to view)" : winnerName || "Winner";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-lg mx-3"
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-3">
              🎉 We Have a Winner!
            </h2>
            <p className="text-gray-700 text-lg mb-2">{giveawayTitle}</p>
            <p className="text-gray-600">
              <strong>Winner:</strong>{" "}
              <span className="text-indigo-600">{maskedWinner}</span>
            </p>
            {prizeImage && (
              <img
                src={prizeImage}
                alt="Prize"
                className="mt-4 rounded-2xl w-full max-h-56 object-cover shadow-md"
              />
            )}
            <button
              onClick={onClose}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
