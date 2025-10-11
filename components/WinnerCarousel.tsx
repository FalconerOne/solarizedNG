"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

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

  useEffect(() => {
    async function loadWinners() {
      const { data, error } = await supabase
        .from("winners")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (!error && data) setWinners(data);
    }
    loadWinners();
  }, []);

  if (!winners.length) return null;

  const maskPhone = (p: string) =>
    p?.length >= 10 ? p.slice(0, 3) + "*****" + p.slice(-2) : p;

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-pink-100 via-orange-50 to-green-100 py-6 mt-8">
      <motion.div
        className="flex gap-8 animate-scroll px-8"
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
      >
        {winners.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-4 bg-white rounded-2xl shadow px-6 py-4 min-w-[280px]"
          >
            <img
              src={w.photo_url || "/images/default-avatar.png"}
              alt={w.full_name}
              className="w-12 h-12 rounded-full border-2 border-pink-300"
            />
            <div>
              <p className="font-semibold text-gray-800">
                {w.full_name.split(" ")[0]} ({maskPhone(w.phone)})
              </p>
              <p className="text-sm text-green-700 font-medium">{w.prize}</p>
              <p className="text-xs text-gray-400">
                Won on {new Date(w.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
