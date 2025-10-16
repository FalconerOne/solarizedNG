"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function RecentWinners() {
  const [winners, setWinners] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch winners from the database
  async function fetchWinners() {
    const { data, error } = await supabase
      .from("winners")
      .select("*, giveaways(title, prize)")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) console.error("Error fetching winners:", error);
    else setWinners(data || []);
  }

  // Set up live polling and realtime updates
  useEffect(() => {
    fetchWinners(); // initial load

    // Setup realtime listener
    const channel = supabase
      .channel("winners_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "winners" },
        () => fetchWinners()
      )
      .subscribe();

    // Refresh every 60s if tab is active
    function startPolling() {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (document.visibilityState === "visible") {
            fetchWinners();
          }
        }, 60000);
      }
    }

    startPolling();

    // Stop polling if page hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (document.visibilityState === "visible") {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">🎉 Recent Winners</h2>

      <AnimatePresence>
        {winners.map((winner) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition">
              <CardContent className="flex justify-between items-center p-3">
                <div>
                  <p className="font-medium text-gray-900">{winner.user_name}</p>
                  <p className="text-sm text-gray-600">
                    Won <strong>{winner.giveaways?.prize}</strong> in{" "}
                    <span className="italic">{winner.giveaways?.title}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(winner.created_at).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {winners.length === 0 && (
        <p className="text-sm text-gray-500 italic">No winners yet — stay tuned!</p>
      )}
    </div>
  );
}
