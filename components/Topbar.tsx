// components/Topbar.tsx
import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import NotificationBell from "./NotificationBell";

export default function Topbar() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setRole(data.role || "user");
        setDisplayName(data.full_name || user.email || "User");
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const getPageTitle = () => {
    const path = router.pathname;
    if (path === "/dashboard") return "Overview";
    if (path === "/notifications") return "Notifications";
    if (path === "/stats") return "Statistics";
    if (path === "/activity") return "Activity Feed";
    if (path === "/settings") return "Settings";
    return "SolarizedNG";
  };

  return (
    <header className="w-full flex items-center justify-between bg-white/70 backdrop-blur-md shadow p-4 rounded-2xl mb-6 animate-fadeSlideIn">
      <div>
        <h2 className="text-xl font-semibold text-orange-600">
          {getPageTitle()}
        </h2>
        {role && (
          <span className="text-xs text-gray-500 ml-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-100 animate-fadeIn">
            {role}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{displayName}</span>
          <button
            onClick={() => router.push("/profile")}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition"
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
}
