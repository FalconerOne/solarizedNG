// src/components/ActivityFeed.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Activity {
  id: string;
  message: string;
  created_at: string;
  user_id?: string;
}

export default function ActivityFeed({ role, userId }: { role: string; userId: string }) {
  const supabase = createClientComponentClient();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();

    // 🔔 Realtime updates
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchActivities() {
    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15);

    // 🔒 Role filter: normal users see only their own activity
    if (role === "user") query = query.eq("user_id", userId);

    const { data, error } = await query;
    if (!error && data) setActivities(data);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((a) => (
            <li key={a.id} className="py-2">
              <p className="text-sm text-gray-700 dark:text-gray-200">{a.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
