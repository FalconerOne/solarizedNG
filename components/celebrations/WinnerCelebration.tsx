"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import confetti from "canvas-confetti";

interface WinnerInfo {
  winnerName: string;
  maskedEmail: string;
  maskedPhone: string;
  prizeName: string;
  giveawayTitle: string;
  imageUrl?: string;
}

export default function WinnerCelebrationModal({
  winner,
  onClose,
}: {
  winner: WinnerInfo | null;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (winner) {
      setShow(true);
      // 🎉 Launch confetti when new winner appears
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        scalar: 1.2,
      });
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-center relative"
          >
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-6 px-4">
              <h2 className="text-2xl font-bold mb-1">🎉 We Have a Winner!</h2>
              <p className="text-sm opacity-90">{winner.giveawayTitle}</p>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center">
              {winner.imageUrl && (
                <img
                  src={winner.imageUrl}
                  alt="Prize"
                  className="w-32 h-32 rounded-xl object-cover shadow-md mb-3"
                />
              )}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {winner.winnerName}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{winner.maskedEmail}</p>
              <p className="text-sm text-gray-500">{winner.maskedPhone}</p>

              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-indigo-700 text-sm font-medium">
                Prize: {winner.prizeName}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
              >
                Celebrate & Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
