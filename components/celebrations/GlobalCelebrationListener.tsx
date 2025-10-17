"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/config/supabase";
import WinnerCelebrationModal from "@/components/celebrations/WinnerCelebrationModal";
import confetti from "canvas-confetti";

interface GlobalCelebrationListenerProps {
  userRole: "admin" | "supervisor" | "user" | "guest";
}

interface WinnerPayload {
  winner_name: string;
  winner_email: string;
  winner_phone: string;
  prize_name: string;
  giveaway_title: string;
  prize_image?: string;
}

export default function GlobalCelebrationListener({
  userRole,
}: GlobalCelebrationListenerProps) {
  const [currentWinner, setCurrentWinner] = useState<WinnerPayload | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("winner-celebrations-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "winner_events",
        },
        (payload) => {
          const newWinner = payload.new as any;

          const maskedEmail =
            userRole === "guest"
              ? maskEmail(newWinner.winner_email)
              : newWinner.winner_email;
          const maskedPhone =
            userRole === "guest"
              ? maskPhone(newWinner.winner_phone)
              : newWinner.winner_phone;

          // 🎉 Trigger celebration modal + confetti
          setCurrentWinner({
            winner_name: newWinner.winner_name || "Anonymous Winner",
            winner_email: maskedEmail,
            winner_phone: maskedPhone,
            prize_name: newWinner.prize_name || "Special Prize",
            giveaway_title: newWinner.giveaway_title || "Giveaway Event",
            prize_image: newWinner.prize_image || null,
          });

          confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  const maskEmail = (email: string) => {
    if (!email) return "hidden@example.com";
    const [name, domain] = email.split("@");
    const masked = name.slice(0, 2) + "***@" + domain;
    return masked;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "**********";
    return phone.slice(0, 2) + "*****" + phone.slice(-2);
    return "**********";
  };

  return (
    <>
      {currentWinner && (
        <WinnerCelebrationModal
          winner={{
            winnerName: currentWinner.winner_name,
            maskedEmail: currentWinner.winner_email,
            maskedPhone: currentWinner.winner_phone,
            prizeName: currentWinner.prize_name,
            giveawayTitle: currentWinner.giveaway_title,
            imageUrl: currentWinner.prize_image,
          }}
          onClose={() => setCurrentWinner(null)}
        />
      )}
    </>
  );
}
