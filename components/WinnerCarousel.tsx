"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Winner = {
  id: string;
  full_name: string;
  phone: string;
  prize: string;
  photo_url?: string;
  created_at?: string;
};

export default function WinnerCarousel() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [index, setIndex] = useState(0);

  // 🔹 Fetch Winners from Supabase
  const fetchWinners = async () => {
    const { data, error } = await supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWinners(data);
    } else {
      console.error("Error fetching winners:", error);
    }
  };

  useEffect(() => {
    fetchWinners();

    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % (winners.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <div className="bg-white/80 p-6 rounded-xl shadow text-center text-gray-600">
        Loading winners...
      </div>
    );
  }

  const current = winners[index];

  // Mask phone number middle digits
  const maskedPhone =
    current.phone?.length >= 11
      ? `${current.phone.slice(0, 3)}*****${current.phone.slice(-3)}`
      : current.phone;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        Recent Winners 🎉
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
        >
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={current.photo_url || "/images/default-avatar.png"}
              alt={current.full_name}
              fill
              className="rounded-full object-cover border-4 border-orange-400 shadow-md"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-800">
            {current.full_name}
          </h3>
          <p className="text-gray-600 text-sm">{maskedPhone}</p>

          <p className="mt-3 text-orange-600 font-medium">
            🏆 {current.prize}
          </p>

          <p className="text-gray-400 text-xs mt-1">
            {new Date(current.created_at || "").toLocaleDateString()}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
