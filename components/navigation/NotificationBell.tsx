"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function NotificationBell() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`target_user.eq.${userId},target_user.eq.all`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    // Realtime listener
    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNote = payload.new;
          if (
            newNote.target_user === userId ||
            newNote.target_user === "all"
          ) {
            setNotifications((prev) => [newNote, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative focus:outline-none">
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1"
            variant="secondary"
          >
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-sm text-gray-500">
            No new notifications.
          </DropdownMenuItem>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start text-sm"
            >
              <span className="font-medium text-gray-800">{n.title}</span>
              <span className="text-gray-600">{n.message}</span>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
