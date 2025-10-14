import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ActivityItem {
  id: string;
  user_id: string;
  role: string;
  action: string;
  details: string;
  created_at: string;
}

export default function ActivityFeed() {
  const supabase = createClientComponentClient();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and subscribe
  useEffect(() => {
    async function fetchActivity() {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) setActivities(data);
      setLoading(false);
    }

    fetchActivity();

    // Realtime subscription
    const channel = supabase
      .channel("activity_log_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          setActivities((prev) => [payload.new, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md max-h-96 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity.</p>
      ) : (
        <ul className="space-y-2">
          {activities.map((a) => (
            <li
              key={a.id}
              className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong className="text-orange-600 dark:text-orange-400">
                  {a.action}
                </strong>{" "}
                — {a.details || "No details provided"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
