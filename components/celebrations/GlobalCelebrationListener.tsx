"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/config/supabase";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface CelebrationEvent {
  id: string;
  giveaway_title: string;
  winner_name: string;
  winner_email: string;
  winner_phone: string;
  prize_name: string;
  created_at: string;
}

export default function GlobalCelebrationListener({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const [event, setEvent] = useState<CelebrationEvent | null>(null);
  const [visible, setVisible] = useState(false);

  // 🎉 Utility: mask sensitive data for guests
  const maskInfo = (text: string) => {
    if (!text) return "";
    return text.replace(/(?<=.{2}).(?=.*@)/g, "*");
  };
  const maskPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/\d(?=\d{2})/g, "*");
  };

  // 🚀 Launch confetti celebration
  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 20, spread: 360, ticks: 40, zIndex: 9999 };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 200);
  };

  // 📡 Listen for realtime global winner events
  useEffect(() => {
    const channel = supabase
      .channel("global_winner_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "winner_events" },
        (payload) => {
          const newEvent = payload.new as CelebrationEvent;
          setEvent(newEvent);
          setVisible(true);
          triggerConfetti();
          setTimeout(() => setVisible(false), 10000);
        }
      )
      .subscribe();

    // 🕓 On mount — replay last stored winner event
    async function fetchLastEvent() {
      const { data, error } = await supabase
        .from("winner_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setEvent(data);
        setTimeout(() => {
          setVisible(true);
          triggerConfetti();
          setTimeout(() => setVisible(false), 10000);
        }, 2500);
      }
    }

    fetchLastEvent();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!event) return null;

  const displayName =
    userRole === "admin" || userRole === "activated"
      ? event.winner_name
      : `${event.winner_name?.split(" ")[0]} (${maskInfo(event.winner_email)} / ${maskPhone(event.winner_phone)})`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <Card className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
            <div className="flex justify-center mb-3">
              <Trophy className="text-yellow-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Congratulations, {displayName}!
