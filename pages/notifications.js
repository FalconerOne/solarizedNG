import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    setRole(profile?.role || "participant");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotifications(data);

    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );

  const filtered = notifications.filter((n) => {
    if (role === "admin" || role === "supervisor") return true;
    return n.target_role === "participant" || n.created_by === null;
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <li
              key={n.id}
              className={`p-4 rounded-lg border ${
                n.is_read
                  ? "bg-gray-100 dark:bg-gray-800 border-gray-300"
                  : "bg-blue-50 dark:bg-blue-900 border-blue-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm">{n.message}</p>
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                {n.is_read && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
