"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface Winner {
  id: string;
  full_name: string;
  phone: string;
  prize: string;
  photo_url?: string;
  created_at: string;
}

export default function WinnerCarousel() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [index, setIndex] = useState(0);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mask phone numbers (hide middle 5 digits)
  const maskPhone = (phone: string) => {
    return phone.replace(/(\d{3})\d{5}(\d{3})/, "$1*****$2");
  };

  // Fetch winners from Supabase
  async function fetchWinners() {
    const { data, error } = await supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) {
      setWinners(data);
      setLastUpdated(new Date());
      if (data[0]?.id !== latestId) {
        setLatestId(data[0]?.id);
        confetti({
          particleCount: 140,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }

  // Auto-refresh every 30s
  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 30000);
    return () => clearInterval(interval);
  }, []);

  // Rotate through winners
  useEffect(() => {
    if (winners.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [winners]);

  const winner = winners[index];
  if (!winner) return null;

  return (
    <motion.div
      key={winner.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-12 max-w-md w-full bg-white/85 rounded-2xl shadow-lg p-6 text-center border border-orange-200"
    >
      <Image
        src={winner.photo_url || "/images/default-avatar.png"}
        alt={winner.full_name}
        width={100}
        height={100}
        className="rounded-full mx-auto shadow-md mb-4 border-4 border-orange-300"
      />
      <h3 className="text-xl font-semibold text-orange-700">{winner.full_name}</h3>
      <p className="text-gray-700 text-sm">{maskPhone(winner.phone)}</p>
      <p className="text-lg font-medium text-green-700 mt-2">🏆 {winner.prize}</p>
      <p className="text-xs text-gray-500 mt-1">
        Announced: {new Date(winner.created_at).toLocaleDateString()}
      </p>

      {/* New “Last Updated” timestamp */}
      <div className="mt-3 text-xs text-gray-400 italic">
        Last updated:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Loading..."}
      </div>
    </motion.div>
  );
}
