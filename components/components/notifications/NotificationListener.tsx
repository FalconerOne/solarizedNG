"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/config/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

export default function NotificationListener() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState(false);

  // 🧠 Fetch recent notifications (for Admin + Supervisor dashboards)
  useEffect(() => {
    async function fetchRecent() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) setNotifications(data);
    }

    fetchRecent();
  }, []);

  // 🎧 Listen for realtime winner events
  useEffect(() => {
    const channel = supabase
      .channel("admin_notifications_sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "winner_events" },
        (payload) => {
          const event = payload.new;
          const newNotification: NotificationItem = {
            id: event.id,
            type: "winner",
            title: "🎉 Winner Announced!",
            message: `${event.winner_name || "A participant"} just won ${
              event.prize_name
            } in ${event.giveaway_title}.`,
            created_at: new Date().toISOString(),
          };

          // Save to local state
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
          triggerToast(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerToast = (n: NotificationItem) => {
    setVisible(true);
    setTimeout(() => setVisible(false), 6000);
  };

  return (
    <>
      {/* 🔔 Floating notification popup */}
      <AnimatePresence>
        {visible && notifications.length > 0 && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-5 right-5 z-[9999]"
          >
            <Card className="bg-white border border-gray-200 shadow-2xl p-4 rounded-xl flex items-center gap-3 w-80">
              <Trophy className="text-yellow-500" size={22} />
              <div>
                <p className="font-semibold text-gray-900">
                  {notifications[0].title}
                </p>
                <p className="text-sm text-gray-600">
                  {notifications[0].message}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 Small bell icon to view 10 latest */}
      <div className="fixed bottom-6 right-6 z-[9998]">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className={cn(
            "relative bg-indigo-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-indigo-700"
          )}
          onClick={() => setVisible(!visible)}
        >
          <Bell size={22} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </motion.div>
      </div>
    </>
  );
}
