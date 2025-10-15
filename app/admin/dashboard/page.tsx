"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function AdminDashboardPage() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [topGiveaways, setTopGiveaways] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch all dashboard data
  async function fetchDashboardData() {
    setLoading(true);

    try {
      // Top 10 users by total engagement (likes + referrals)
      const { data: users } = await supabase.rpc("get_top_users");
      setTopUsers(users || []);

      // Top 5 giveaways by total participation
      const { data: giveaways } = await supabase
        .from("giveaways")
        .select("id, title")
        .limit(5);

      const topGiveawaysWithCounts = await Promise.all(
        (giveaways || []).map(async (g) => {
          const { count } = await supabase
            .from("giveaway_participants")
            .select("*", { count: "exact", head: true })
            .eq("giveaway_id", g.id);
          return { ...g, participants: count || 0 };
        })
      );

      setTopGiveaways(topGiveawaysWithCounts);

      // Engagement trends (last 7 days)
      const { data: trendData } = await supabase.rpc("get_engagement_trends");
      setTrends(trendData || []);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  // Auto-refresh every 30s
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🏆 Admin Live Dashboard
      </h1>

      {/* Top Users */}
      <Card className="p-4 bg-white shadow-md">
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Top 10 Participants (Referrals + Likes)
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {topUsers.length === 0 && <li>No active participants yet.</li>}
            {topUsers.map((user, i) => (
              <li key={i} className="flex justify-between border-b py-1">
                <span>
                  {i + 1}. {user.name || "Anonymous"} ({user.state})
                </span>
                <span className="font-medium text-indigo-600">
                  {user.engagement_score} pts
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Top Giveaways */}
      <Card className="p-4 bg-white shadow-md">
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Most Active Giveaways
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {topGiveaways.length === 0 && <li>No giveaways found.</li>}
            {topGiveaways.map((g, i) => (
              <li key={i} className="flex justify-between border-b py-1">
                <span>
                  {i + 1}. {g.title}
                </span>
                <span className="font-medium text-indigo-600">
                  {g.participants} participants
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card className="p-4 bg-white shadow-md">
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Weekly Engagement Trend
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="referrals" stroke="#4f46e5" name="Referrals" />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" name="Likes" />
              <Line type="monotone" dataKey="participants" stroke="#10b981" name="Participants" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
