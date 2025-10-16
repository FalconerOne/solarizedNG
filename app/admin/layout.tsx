"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import NotificationCenter from "@/components/NotificationCenter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-orange-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-md p-5 space-y-4 border-r border-orange-100 z-40 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-orange-600">Admin Panel</h2>
          <button
            className="md:hidden text-orange-600"
            onClick={() => setMenuOpen(false)}
          >
            <FaTimes size={22} />
          </button>
        </div>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block p-2 rounded hover:bg-orange-100">
            Dashboard
          </Link>
          <Link href="/admin/ads" className="block p-2 rounded hover:bg-orange-100">
            Ad Manager
          </Link>
          <Link href="/admin/test-panel" className="block p-2 rounded hover:bg-orange-100">
            Test Panel
          </Link>
          <Link href="/admin/maintenance" className="block p-2 rounded hover:bg-orange-100">
            Maintenance
          </Link>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full bg-white border-b border-orange-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-orange-600"
              onClick={() => setMenuOpen(true)}
            >
              <FaBars size={22} />
            </button>
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-orange-600"
            >
              SolarizedNG Admin
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-700 truncate max-w-[120px] md:max-w-[160px]">
                {user.email || "Admin"}
              </span>
            )}
            <img
              src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-orange-200"
            />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-full text-sm shadow transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
