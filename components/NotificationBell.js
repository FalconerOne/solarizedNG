import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function NotificationBell() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe for realtime inserts
    const channel = supabase
      .channel("notifications-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setNotifications(data);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Bell className="w-6 h-6" />
        {notifications.some((n) => !n.is_read) && (
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-3 z-50">
          <h4 className="font-semibold text-gray-700 dark:text-gray-100 mb-2">Notifications</h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-2 rounded-lg ${n.is_read ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900"}`}
                >
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
