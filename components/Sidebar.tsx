// components/Sidebar.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Home, BarChart, Settings, Activity, Bell, Shield } from "lucide-react";
import checkRoleAccess from "@/lib/checkRoleAccess";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Stats", href: "/stats", icon: BarChart },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Admin Panel", href: "/admin", icon: Shield, roles: ["admin"] },
];

export default function Sidebar() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [role, setRole] = useState("user");

  // Fetch role from Supabase or your session helper
  useEffect(() => {
    if (!user) return;

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!error && data?.role) {
        setRole(data.role);
      }
    };

    fetchRole();
  }, [user, supabase]);

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-4 h-screen flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-semibold mb-6 text-orange-600">
          SolarizedNG
        </h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const allowed =
              !item.roles || checkRoleAccess(item.roles, role); // Reuse your logic
            if (!allowed) return null;

            const active = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                  active
                    ? "bg-orange-100 text-orange-700 font-medium"
                    : "hover:bg-orange-50 text-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <footer className="text-xs text-gray-500 text-center">
        {role && <p className="capitalize mb-1">{role}</p>}
        © {new Date().getFullYear()} SolarizedNG
      </footer>
    </aside>
  );
}
