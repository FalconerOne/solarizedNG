"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  username: string;
  points: number;
  activated: boolean;
  role: string;
}

export default function LeaderboardEnhanced() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Utility: shuffle for guest/limited views
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, username, points, activated, role")
        .eq("id", session.user.id)
        .single();

      if (data) setSessionUser(data);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, points, activated, role")
        .order("points", { ascending: false });

      // 🌞 Apply SolarizedNG Participation Visibility Rule
      if (!sessionUser) {
        query = query.limit(5); // Guest preview
      } else if (sessionUser.role !== "admin" && !sessionUser.activated) {
        query = query.limit(60); // Partial random subset
      }

      const { data, error } = await query;
      if (error) {
        console.error("Leaderboard fetch error:", error);
        setLoading(false);
        return;
      }

      const processed =
        !sessionUser || (!sessionUser.activated && sessionUser.role !== "admin")
          ? shuffle([...data])
          : data;

      setUsers(processed);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [sessionUser]);

  if (loading) return <div className="text-gray-500 p-4">Loading leaderboard...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md p-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2 mb-4">
        🏆 Leaderboard
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-orange-100 text-gray-700">
              <th className="text-left p-2 rounded-tl-lg">Rank</th>
              <th className="text-left p-2">Username</th>
              <th className="text-right p-2 rounded-tr-lg">Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b ${
                  idx % 2 === 0 ? "bg-orange-50/30" : "bg-white"
                } hover:bg-orange-100/60 transition`}
              >
                <td className="p-2 text-gray-700">{idx + 1}</td>
                <td className="p-2 font-medium text-gray-800">{user.username}</td>
                <td className="p-2 text-right font-semibold text-orange-700">
                  {user.points}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessionUser && !sessionUser.activated && (
        <p className="text-xs text-gray-500 italic mt-3 text-center">
          Activate your account to unlock full leaderboard visibility.
        </p>
      )}
    </motion.div>
  );
}
