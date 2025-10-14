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
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Optional: shuffle visible results for guests/unactivated
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  // 🟠 Step 1: Get current session user
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

  // 🟢 Step 2: Fetch leaderboard + apply visibility rule
  useEffect(() => {
    const fetchLeaderboard = async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, points, activated, role")
        .order("points", { ascending: false });

      if (!sessionUser) {
        // Guest view — capped + randomized
        query = query.limit(60);
      } else if (sessionUser.role !== "admin" && !sessionUser.activated) {
        // Unactivated user — capped + randomized
        query = query.limit(60);
      }

      const { data, error } = await query;
      if (!error && data) {
        const randomized =
          !sessionUser || (!sessionUser.activated && sessionUser.role !== "admin")
            ? shuffle([...data])
            : data;
        setUsers(randomized);
      }
      setLoading(false);
    };

    fetchLeaderboard();

    // 🟣 Step 3: Real-time subscription (optional)
    const subscription = supabase
      .channel("realtime:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionUser]);

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
              <td className="p-3 font-semibold text-orange-700">
                {user.points}
              </td>
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

      {/* 🧩 Limited-view hint */}
      {sessionUser && !sessionUser.activated && (
        <p className="mt-4 text-sm text-gray-500 text-center italic">
          You’re viewing a limited leaderboard. Activate your account to see all
          participants.
        </p>
      )}
    </div>
  );
}
