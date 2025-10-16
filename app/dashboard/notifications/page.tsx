"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Bell } from "lucide-react";

export default function UserNotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user info
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_user.eq.${userId},target_user.eq.all`)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotifications(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNote = payload.new;
          if (
            newNote.target_user === userId ||
            newNote.target_user === "all"
          ) {
            setNotifications((prev) => [newNote, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      </div>
    );

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Bell className="w-5 h-5" /> My Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              You have no notifications yet.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border ${
                    note.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-indigo-50 border-indigo-200"
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600">{note.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
