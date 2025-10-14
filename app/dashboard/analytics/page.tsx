"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import ExportButtons from "@/components/analytics/ExportButtons";
import AnimatedCard from "@/components/ui/AnimatedCard";
import Shimmer from "@/components/ui/Shimmer";

interface DailyStat {
  date: string;
  actions: number;
  points: number;
}

interface TopUser {
  username: string;
  total_points: number;
}

export default function AnalyticsPage() {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // 🧮 Group by date
      const { data: daily, error: err1 } = await supabase.rpc("get_daily_activity_stats");
      const { data: users, error: err2 } = await supabase
        .from("profiles")
        .select("username, points")
        .order("points", { ascending: false })
        .limit(10);

      if (!err1 && daily) setDailyStats(daily);
      if (!err2 && users)
        setTopUsers(users.map((u) => ({ username: u.username, total_points: u.points })));

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="p-6">
        <Shimmer />
      </div>
    );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.h1
        className="text-2xl font-bold text-orange-600"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Engagement Analytics
      </motion.h1>

      {/* 📈 Daily Activity Trends */}
      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-3">Daily Activity Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="actions" stroke="#f97316" strokeWidth={2} />
            <Line type="monotone" dataKey="points" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <ExportButtons data={dailyStats} filename="daily_activity_stats" />
      </AnimatedCard>

      {/* 🏅 Top Users */}
      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-3">Top 10 Users</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topUsers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_points" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
        <ExportButtons data={topUsers} filename="top_users" />
      </AnimatedCard>
    </div>
  );
}
