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

    // 1. Initial fetch
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };
    fetchData();

    // 2. Subscribe for realtime changes
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        payload => {
          setNotifications(prev => {
            let next = [...prev];
            const newRow = payload.new;
            const existingIndex = next.findIndex(n => n.id === newRow.id);
            if (existingIndex > -1) next[existingIndex] = newRow;
            else next.unshift(newRow);
            setUnreadCount(next.filter(n => !n.is_read).length);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async id => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  return { notifications, unreadCount, markAsRead };
}
