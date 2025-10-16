"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotifications(data || []);

    setLoading(false);
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time updates
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNote = payload.new;
          setNotifications((prev) => [newNote, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Bell className="w-5 h-5" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No notifications yet.
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {note.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!note.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(note.id)}
                        className="text-indigo-600 border-indigo-300"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
