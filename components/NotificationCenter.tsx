"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationCenter({ userId }: { userId: string }) {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    // Subscribe to live changes
    const channel = supabase
      .channel("live_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) setNotifications(data);
  };

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-full p-2"
      >
        <Bell className="w-5 h-5" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-gray-200 rounded-lg z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 hover:underline"
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-3 text-gray-500 text-sm text-center">
                No notifications yet.
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 border-b text-sm ${
                    n.read ? "bg-gray-50" : "bg-indigo-50"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
