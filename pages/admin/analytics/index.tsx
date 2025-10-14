"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const COLORS = ["#f97316", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];

const AnalyticsPage: React.FC = () => {
  const supabase = createClientComponentClient();
  const [entriesData, setEntriesData] = useState<any[]>([]);
  const [prizesData, setPrizesData] = useState<any[]>([]);
  const [giveawayStats, setGiveawayStats] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      try {
        // 1️⃣ Entries over time
        const { data: entries } = await supabase
          .from("entries")
          .select("created_at");
        const dailyEntries = (entries || []).reduce((acc: any, entry: any) => {
          const day = new Date(entry.created_at).toLocaleDateString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});
        setEntriesData(
          Object.entries(dailyEntries).map(([date, count]) => ({
            date,
            entries: count,
          }))
        );

        // 2️⃣ Prizes claimed vs unclaimed
        const { data: prizes } = await supabase
          .from("prizes")
          .select("id, claimed");
        const claimed = prizes?.filter((p) => p.claimed).length || 0;
        const unclaimed = prizes?.filter((p) => !p.claimed).length || 0;
        setPrizesData([
          { name: "Claimed", value: claimed },
          { name: "Unclaimed", value: unclaimed },
        ]);

        // 3️⃣ Top performing giveaways
        const { data: giveaways } = await supabase
          .from("giveaways")
          .select("id, title, entries_count");
        const sorted = giveaways
          ?.map((g) => ({
            name: g.title || "Untitled",
            entries: g.entries_count || 0,
          }))
          .sort((a, b) => b.entries - a.entries)
          .slice(0, 5);
        setGiveawayStats(sorted || []);

        // 4️⃣ Engagement overview (mock data, can be linked to analytics logs)
        setEngagementData([
          { name: "Mon", visits: 400, shares: 240, signups: 120 },
          { name: "Tue", visits: 300, shares: 139, signups: 200 },
          { name: "Wed", visits: 500, shares: 250, signups: 180 },
          { name: "Thu", visits: 450, shares: 210, signups: 260 },
          { name: "Fri", visits: 480, shares: 220, signups: 230 },
          { name: "Sat", visits: 600, shares: 280, signups: 320 },
          { name: "Sun", visits: 520, shares: 260, signups: 300 },
        ]);

        // 5️⃣ Referrals leaderboard (mock fallback)
        const { data: referrals } = await supabase
          .from("entries")
          .select("referred_by");
        const refMap = (referrals || []).reduce((acc: any, r: any) => {
          if (!r.referred_by) return acc;
          acc[r.referred_by] = (acc[r.referred_by] || 0) + 1;
          return acc;
        }, {});
        setLeaderboard(
          Object.entries(refMap)
            .map(([ref, count]) => ({ ref, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-semibold mb-6">📊 Giveaway Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Entries Over Time */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Entries Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={entriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="entries"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Prizes Claimed vs Unclaimed */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">
                Prizes Claimed vs. Unclaimed
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prizesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                    dataKey="value"
                  >
                    {prizesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Performing Giveaways */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Top Performing Giveaways</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={giveawayStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entries" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement Overview */}
            <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
              <h2 className="font-medium text-lg mb-3">Engagement Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    stackId="1"
                    stroke="#60a5fa"
                    fill="#60a5fa"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    stackId="1"
                    stroke="#34d399"
                    fill="#34d399"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Referrals Leaderboard */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Top Referrers</h2>
              <ul className="divide-y">
                {leaderboard.map((r, i) => (
                  <li
                    key={i}
                    className="flex justify-between py-2 text-sm text-gray-700"
                  >
                    <span>{r.ref}</span>
                    <span className="font-medium text-orange-500">
                      {r.count} referrals
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
