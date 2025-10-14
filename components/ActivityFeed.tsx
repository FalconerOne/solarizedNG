"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";

interface Log {
  id: string;
  action_type: string;
  description: string;
  source: string;
  created_at: string;
}

const ActivityFeed: React.FC = () => {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial logs
  useEffect(() => {
    if (!user) return;

    async function fetchLogs() {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) setLogs(data);
      setLoading(false);
    }

    fetchLogs();

    // Subscribe for realtime inserts
    const channel = supabase
      .channel("activity-log-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          const newLog = payload.new as Log;
          if (newLog.user_id === user?.id) {
            setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return <p className="text-gray-500">Login to view activity feed.</p>;
  }

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Recent Activity
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <li key={log.id} className="py-2">
              <p className="text-sm text-gray-700">{log.description}</p>
              <p className="text-xs text-gray-400">
                {log.source} • {new Date(log.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
