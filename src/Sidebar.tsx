import React from "react";
import { NavLink } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Home, BarChart, Activity, Settings, Bell } from "lucide-react";

export default function Sidebar() {
  const { unreadCount } = useNotifications();

  const navItems = [
    { name: "Overview", icon: <Home className="w-5 h-5" />, path: "/" },
    { name: "Stats", icon: <BarChart className="w-5 h-5" />, path: "/stats" },
    { name: "Activity", icon: <Activity className="w-5 h-5" />, path: "/activity" },
    { name: "Notifications", icon: <Bell className="w-5 h-5" />, path: "/notifications" },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];

  return (
    <aside className="h-screen w-60 bg-gray-50 border-r flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-6">SolarizedNG</h2>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <div className="relative">
              {item.icon}
              {/* 🔴 Unread badge for Notifications */}
              {item.name === "Notifications" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2"></span>
              )}
            </div>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
