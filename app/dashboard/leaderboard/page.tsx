"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, ShieldAlert, User, Lock } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  points: number;
  activated: boolean;
  role: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🌀 Randomize visible users for unactivated or guest views
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  // 🟠 1️⃣ Fetch current session user
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

  // 🟠 2️⃣ Fetch leaderboard with visibility + participation rules
  useEffect(() => {
    const fetchLeaderboard = async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, points, activated, role")
        .order("points", { ascending: false });

      // ⚙️ Apply Participation Visibility Rule
      if (!sessionUser) {
        // Guest — capped and randomized
        query = query.limit(60);
      } else if (sessionUser.role !== "admin" && !sessionUser.activated) {
        // Unactivated user — capped and randomized
        query = query.limit(60);
      }

      const { data, error } = await query;
      if (!error && data) {
        const visible =
          !sessionUser || (!sessionUser.activated && sessionUser.role !== "admin")
            ? shuffle([...data])
            : data;
        setUsers(visible);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [sessionUser]);

  if (loading)
    return <div className="p-6 text-gray-500">Loading leaderboard...</div>;

  // 🧩 Small helper to render status badge
  const StatusBadge = ({ user }: { user: UserProfile }) => {
    if (user.role === "admin")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
          <ShieldCheck size={14} /> Admin
        </span>
      );
    if (user.activated)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <User size={14} /> Active
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
        <Lock size={14} /> Pending
      </span>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl fo
