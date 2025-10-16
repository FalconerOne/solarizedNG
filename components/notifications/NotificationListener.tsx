"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationListener() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Listen for new notifications in realtime
    const channel = supabase
      .channel("live-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const notif = payload.new;
          if (notif.user_id === user.id) {
            // Trigger toast based on notification type
            let variant: "success" | "error" | "info" | "warning" = "info";

            if (notif.type === "join") variant = "success";
            else if (notif.type === "like") variant = "info";
            else if (notif.type === "referral") variant = "success";
            else if (notif.type === "warning") variant = "warning";
            else if (notif.type === "error") variant = "error";

            showToast(notif.message || "New activity update!", variant);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
}
