// src/components/NotificationBell.js
"use client";
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getNotifications, markAsRead, subscribeToNotifications } from "@/lib/notifications";
import { useSession } from "@supabase/auth-helpers-react";

const NotificationBell = () => {
  const session = useSession();
  const user = session?.user;
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔄 Load notifications on mount
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const data = await getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    };
    load();

    // ⚡ Subscribe to live notifications
    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // ✅ Mark one as read
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => c - 1);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
              Notifications
            </h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-3 cursor-pointer transition ${
                    notif.read
                      ? "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                      : "bg-orange-50 dark:bg-gray-800"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
