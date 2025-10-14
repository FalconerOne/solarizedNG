"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";

const Topbar: React.FC = () => {
  const supabase = createClientComponentClient();
  const user = useUser();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Realtime listener for new logs
    const channel = supabase
      .channel("activity-log-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          const log = payload.new;
          if (log.user_id === user.id) {
            setUnreadCount((prev) => prev + 1);
            setRecentLogs((prev) => [log, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    setUnreadCount(0);
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">SolarizedNG</h1>

      <div className="relative">
        {/* 🔔 Bell Icon */}
        <button
          onClick={toggleDropdown}
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 🔽 Dropdown Panel */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border border-gray-100 z-50">
            <div className="p-3 border-b border-gray-100 font-medium text-gray-700">
              Recent Activity
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <li className="p-3 text-gray-400 text-sm">No recent activity</li>
              ) : (
                recentLogs.map((log) => (
                  <li key={log.id} className="p-3 hover:bg-gray-50 text-sm">
                    <p className="text-gray-700">{log.description}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
