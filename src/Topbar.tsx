import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      {/* Left section — app title */}
      <h1 className="text-xl font-semibold text-gray-800">SolarizedNG</h1>

      {/* Right section — notification bell */}
      <div className="relative cursor-pointer" onClick={() => navigate("/notifications")}>
        <Bell className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />

        {/* 🔴 Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </header>
  );
}
