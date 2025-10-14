"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";

interface Activity {
  id: string;
  role: string;
  action_type: string;
  description: string;
  created_at: string;
  source?: string;
  user_id?: string;
}

const ActivityFeed: React.FC = () => {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("user");

  // Fetch role first
  useEffect(() => {
    if (!user) return;
    fetchRoleAndActivities();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("activity-log-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          const newEntry = payload.new as Activity;
          if (role === "admin" || newEntry.user_id === user.id) {
            setActivities((prev) => [newEntry, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  async function fetchRoleAndActivities() {
    if (!user) return;

    // 1️⃣ Get user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const currentRole = profile?.role || "user";
    setRole(currentRole);

    // 2️⃣ Fetch logs based on role
    let query = supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (currentRole !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
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
