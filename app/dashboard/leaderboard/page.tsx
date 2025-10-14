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

  // 🔁 Randomize visible results (guest/unactivated)
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  // 🟠 Step 1: Fetch current user
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
        query = query.limit(60);
      } else if (sessionUser.role !== "admin" && !sessionUser.activated) {
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

    // 🟣 Step 3: Real-time updates
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

  // 🎯 Helper: badge color logic
  const getStatusBadge = (user: User) => {
    if (user.role === "admin")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-300">
          Admin
        </span>
      );
    if (user.role === "moderator")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-300">
          Moderator
        </span>
      );
    if (!user.activated)
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-300">
          Pending
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-300">
        Active
      </span>
    );
  };

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
          {users.m
