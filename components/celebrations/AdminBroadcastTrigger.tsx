"use client";

import { useState } from "react";
import { createClient } from "@/config/supabase";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function AdminBroadcastTrigger({ userRole }: { userRole?: string }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("🎉 Global Test Celebration!");
  const [message, setMessage] = useState("This is a live test announcement for all users!");
  const supabase = createClient();

  if (userRole !== "admin") return null;

  const triggerBroadcast = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          type: "winner_announcement",
          title,
          message,
          is_global: true,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Broadcast error:", error);
        alert("❌ Failed to broadcast notification.");
      } else {
        triggerLocalConfetti();
        setShow(true);
        setTimeout(() => setShow(false), 7000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("⚠️ Broadcast failed unexpectedly.");
    } finally {
      setLoading(false);
    }
  };

  const triggerLocalConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    function frame() {
      confetti({
        ...defaults,
        particleCount: 3,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
  };

  return (
    <>
      {/* Broadcast Button */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2">
        <button
          onClick={triggerBroadcast}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {loading ? "Sending..." : "🚀 Broadcast Global Celebration"}
        </button>
      </div>

      {/* Success Popup */}
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
              🎉 Broadcast Sent!
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              All connected users should now see the global celebration.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
