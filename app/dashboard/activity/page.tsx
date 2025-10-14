"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Clock, Gift, Share2, UserPlus } from "lucide-react";

interface Activity {
  id: string;
  user_id: string;
  username?: string;
  activity_type: string;
  points: number;
  created_at: string;
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch activity log with usernames joined from profiles
  const fetchActivityLog = async () => {
    const { data, error } = await supabase
      .from("activity_log")
      .select(
        `
        id,
        user_id,
        activity_type,
        points,
        created_at,
        profiles: user_id ( username )
        `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        username: item.profiles?.username || "Unknown",
        activity_type: item.activity_type,
        points: item.points,
        created_at: item.created_at,
      }));
      setActivities(mapped);
    }
    setLoading(false);
  };

  // 🟢 On mount + live updates
  useEffect(() => {
    fetchActivityLog();

    const subscription = supabase
      .channel("realtime:activity_log")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => fetchActivityLog()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading)
    return <div className="p-6 text-gray-500">Loading recent activity…</div>;

  // 🎨 Icon selector
  const getIcon = (type: string) => {
    switch (type) {
      case "share":
        return <Share2 className="text-blue-500" size={18} />;
      case "signup":
        return <UserPlus className="text-green-500" size={18} />;
      case "reward":
        return <Gift className="text-yellow-500" size={18} />;
      default:
        return <Clock className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">Activity Log</h1>

      <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
        {activities.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">
            No activity recorded yet.
          </p>
        ) : (
          activities.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-4 hover:bg-orange-50 transition"
            >
              {getIcon(a.activity_type)}
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-orange-700">
                    {a.username}
                  </span>{" "}
                  performed <span className="italic">{a.activity_type}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-orange-600">
                +{a.points} pts
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
