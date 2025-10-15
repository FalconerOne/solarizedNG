"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaTachometerAlt, FaBullhorn, FaTools, FaUserShield } from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { href: "/admin/ads", label: "Ad Manager", icon: FaBullhorn },
    { href: "/admin/maintenance", label: "Maintenance", icon: FaTools },
    { href: "/admin/test-panel", label: "Test Panel", icon: FaUserShield },
  ];

  return (
    <div className="flex min-h-screen bg-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-orange-100 shadow-sm p-5">
        <h2 className="text-xl font-bold text-orange-600 mb-6 text-center">
          Admin Panel
        </h2>

        <nav className="space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
