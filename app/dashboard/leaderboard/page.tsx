"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  username: string;
  points: number;
  activated: boolean;
  role: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, points, activated, role")
        .order("points", { ascending: false })
        .limit(60);

      if (!error && data) setUsers(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-500">Loading leaderboard...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">Leaderboard</h1>
      <table className="w-full border-collapse bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-orange-100 text-left text-gray-800">
            <th className="p-3">Rank</th>
            <th className="p-3">Username</th>
            <th className="p-3">Points</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              className="border-b hover:bg-orange-50 transition text-gray-700"
            >
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{user.username}</td>
              <td className="p-3 font-semibold text-orange-700">{user.points}</td>
              <td className="p-3">
                {user.activated ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-gray-400">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
