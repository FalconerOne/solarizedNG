"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast"; // ✅ Added

const Topbar: React.FC = () => {
  const supabase = createClientComponentClient();
  const user = useUser();
  const { toast } = useToast(); // ✅ Added

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notifications and subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setNotifications((prev) => [payload.new, ...prev]);

            // ✅ Show toast popup instantly for new notification
            toast({
              title: "🔔 New Notification",
              description: payload.new.message,
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);

    if (!error && data) setNotifications(data);
  }

  async function markAllAsRead() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setLoading(false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex items-center justify-between bg-white shadow px-6 py-3 border-b">
      <h1 className="text-lg font-semibold text-gray-800">SolarizedNG Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2 animate-pulse"></span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-xl z-50 border border-gray-200">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-semibold text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-orange-600 hover:underline disabled:opacity-50"
                >
                  {loading ? "Clearing..." : "Mark all as read"}
                </button>
              )}
            </div>

            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <li className="p-4 text-sm text-gray-500 text-center">
                  No notifications yet.
                </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 text-sm ${
                      n.is_read
                        ? "bg-gray-50 text-gray-600"
                        : "bg-orange-50 text-gray-800 font-medium"
                    }`}
                  >
                    {n.message}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
