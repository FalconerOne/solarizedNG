"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import StatusBadge from "@/components/ui/StatusBadge";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role, activated, points")
        .order("points", { ascending: false })
        .limit(60); // respect visibility cap rule

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-orange-700">
        Leaderboard
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading leaderboard...</p>
      ) : (
        <div className="space-y-3">
          {users.length === 0 && (
            <p className="text-gray-500">No participants yet.</p>
          )}

          {users.map((user, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 bg-white shadow-sm rounded-xl border border-gray-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">
                  @{user.username || "Anonymous"}
                </span>
                <StatusBadge activated={user.activated} role={user.role} />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {user.points || 0} pts
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
