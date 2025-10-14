"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Activity {
  id: string;
  role: string;
  action_type: string;
  description: string;
  created_at: string;
  source?: string;
}

const ActivityFeed: React.FC = () => {
  const supabase = createClientComponentClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch logs
  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("activity-log-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchActivities() {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setActivities(data);
    setLoading(false);
  }

  if (loading)
    return (
      <div className="p-6 bg-white shadow rounded-xl">
        <p className="text-gray-500">Loading recent activity...</p>
      </div>
    );

  if (activities.length === 0)
    return (
      <div className="p-6 bg-white shadow rounded-xl">
        <p className="text-gray-500">No recent activity yet.</p>
      </div>
    );

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Recent Activity</h2>
      <ul className="divide-y divide-gray-200">
        {activities.map((a) => (
          <li key={a.id} className="py-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-orange-600">{a.role}</span>{" "}
              {a.description}
            </p>
            <div className="text-xs text-gray-400 mt-1 flex justify-between">
              <span>{a.action_type}</span>
              <span>{new Date(a.created_at).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
