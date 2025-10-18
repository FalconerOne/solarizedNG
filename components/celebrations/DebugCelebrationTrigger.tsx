"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function DebugCelebrationTrigger({
  userRole,
}: {
  userRole?: string;
}) {
  const [show, setShow] = useState(false);

  if (userRole !== "admin") return null;

  const simulateCelebration = () => {
    const title = "🎉 Test Celebration!";
    const message =
      "This is a simulated winner announcement. Confetti test successful!";

    // Trigger confetti
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

    setShow(true);
    setTimeout(() => setShow(false), 8000);
  };

  return (
    <>
      <button
        onClick={simulateCelebration}
        className="fixed bottom-6 left-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 z-[9999]"
      >
        🎯 Test Global Celebration
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-20 left-6 bg-white border border-indigo-200 rounded-2xl shadow-2xl p-4 z-[9999] max-w-sm"
          >
            <h3 className="text-lg font-semibold text-indigo-700">
              🎉 {`Global Celebration Test`}
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              This is a safe, admin-only simulation of the global confetti event.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
