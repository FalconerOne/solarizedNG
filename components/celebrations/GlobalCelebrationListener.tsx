"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import WinnerCelebration from "./WinnerCelebration";

export default function GlobalCelebrationListener({
  userRole,
}: {
  userRole?: "admin" | "supervisor" | "activated" | "guest";
}) {
  const supabase = createClientComponentClient();
  const [celebrationData, setCelebrationData] = useState<{
    giveawayTitle: string;
    winnerName: string;
    prizeImage?: string | null;
  } | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("winner-announcements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "giveaway_winner_logs" },
        async (payload) => {
          const giveawayId = payload.new.giveaway_id;
          const { data: giveaway } = await supabase
            .from("giveaways")
            .select("title, prize_image")
            .eq("id", giveawayId)
            .single();
          const { data: winner } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", payload.new.user_id)
            .single();

          if (giveaway && winner) {
            setCelebrationData({
              giveawayTitle: giveaway.title,
              winnerName: winner.full_name,
              prizeImage: giveaway.prize_image,
            });
            setVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!celebrationData) return null;

  return (
    <WinnerCelebration
      giveawayTitle={celebrationData.giveawayTitle}
      winnerName={celebrationData.winnerName}
      prizeImage={celebrationData.prizeImage}
      visible={visible}
      userRole={userRole}
      onClose={() => setVisible(false)}
    />
  );
}
