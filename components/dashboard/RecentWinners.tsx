"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function RecentWinners() {
  const [winners, setWinners] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch winners from Supabase
  async function fetchWinners() {
    const { data, error } = await supabase
      .from("winners")
      .select("*, giveaways(title, prize)")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) console.error("Error fetching winners:", error);
    else setWinners(data || []);
  }

  // Live updates & auto-refresh
  useEffect(() => {
    fetchWinners();

    // Realtime listener for new winners
    const channel = supabase
      .channel("winners_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "winners" },
        async (payload) => {
          const newWinner = payload.new;

          // Fetch giveaway info
          const { data: giveaway } = await supabase
            .from("giveaways")
            .select("title, prize")
            .eq("id", newWinner.giveaway_id)
            .single();

          toast({
            title: "🎉 New Winner!",
            description: `${newWinner.user_name} just won a ${giveaway?.prize || "prize"} in “${
              giveaway?.title || "Giveaway"
            }”!`,
          });

          fetchWinners(); // refresh list
        }
      )
      .subscribe();

    // Refresh every 60 seconds if tab visible
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

    // Handle tab visibility
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
