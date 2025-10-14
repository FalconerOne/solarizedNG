// src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export function useNotifications() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // 1️⃣ Initial fetch
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read)?.length || 0);
    };

    fetchData();

    // 2️⃣ Realtime listener
    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => {
            let next = [...prev];
            const { eventType, new: newRow, old: oldRow } = payload;

            if (eventType === "INSERT") {
              next = [newRow, ...prev];
            } else if (eventType === "UPDATE") {
              next = prev.map((n) => (n.id === newRow.id ? newRow : n));
            } else if (eventType === "DELETE") {
              next = prev.filter((n) => n.id !== oldRow.id);
            }

            setUnreadCount(next.filter((n) => !n.is_read).length);
            return next;
          });
        }
      )
      .subscribe();

    // 3️⃣ Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // 4️⃣ Mark notification as read
  const markAsRead = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) console.error("Error marking notification as read:", error);
  };

  return { notifications, unreadCount, markAsRead };
}
