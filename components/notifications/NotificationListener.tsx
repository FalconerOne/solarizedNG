"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationListener() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // 🔹 Fetch user profile to check activation
    const checkUserStatus = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_active, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("User status check failed:", error.message);
        return;
      }

      // Subscribe to realtime notifications only for active users or admins
      const channel = supabase
        .channel("realtime:notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            // Ignore for inactive or guest users
            if (
              data?.is_active === false &&
              data?.role !== "admin" &&
              data?.role !== "supervisor"
            ) {
              console.log("🔕 Inactive user — skipping live notification.");
              return;
            }

            // Ensure it's for this specific user
            if (payload.new.user_id !== user.id) return;

            // 🔔 Display real-time toast notification
            toast({
              title: "🔔 New Notification",
              description: payload.new.message,
              className: "bg-indigo-600 text-white",
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUserStatus();
  }, [user]);

  return null;
}
