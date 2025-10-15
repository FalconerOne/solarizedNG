// src/components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  BarChart2,
  Settings,
  Activity,
  Bell,
  Users,
  Info, // 🆕 added icon
} from "lucide-react";

interface SidebarProps {
  role: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const router = useRouter();

  // 💡 Define sidebar links by role
  const linksByRole: Record<string, { name: string; path: string; icon: any }[]> = {
    admin: [
  { name: "Overview", path: "/dashboard", icon: Home },
  { name: "Stats", path: "/stats", icon: BarChart2 },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "About Management", path: "/admin/about", icon: Settings },
  { name: "Settings", path: "/settings", icon: Settings },
],
    supervisor: [
      { name: "Overview", path: "/dashboard", icon: Home },
      { name: "Activity", path: "/activity", icon: Activity },
      { name: "Notifications", path: "/notifications", icon: Bell },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
    user: [
      { name: "Overview", path: "/dashboard", icon: Home },
      { name: "Stats", path: "/stats", icon: BarChart2 },
      { name: "Notifications", path: "/notifications", icon: Bell },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
  };

  // 🧩 Fallback links if no role yet
  const links = linksByRole[role || "user"];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Menu
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {links.map(({ name, path, icon: Icon }) => {
            const active = router.pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-lg transition-colors ${
                    active
