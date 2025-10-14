"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Activity, Gift, Users, Trophy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface AnalyticsData {
  total_giveaways: number;
  active_giveaways: number;
  total_entries: number;
  total_prizes: number;
  total_winners: number;
}

const AdminAnalyticsPage: React.FC = () => {
  const supabase = createClientComponentClient();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    setLoading(true);

    try {
      // You can later replace this with a Supabase View or RPC
      const { data: giveaways } = await supabase.from("giveaways").select("*");
      const { data: prizes } = await supabase.from("prizes").select("*");
      const { data: entries } = await supabase.from("entries").select("*");
      const { data: winners } = await supabase.from("winners").select("*");

      const now = new Date();

      const active = giveaways?.filter(
        (g) =>
          new Date(g.start_date) <= now && new Date(g.end_date) >= now
      ).length;

      setData({
        total_giveaways: giveaways?.length || 0,
        active_giveaways: active || 0,
        total_entries: entries?.length || 0,
        total_prizes: prizes?.length || 0,
        total_winners: winners?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30s
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: number | string;
    color: string;
  }) => (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            {label}
          </h3>
          {loading ? (
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              {value}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full text-white ${color} bg-opacity-90`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            📊 Analytics Overview
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard
              icon={Gift}
              label="Total Giveaways"
              value={data?.total_giveaways || 0}
              color="bg-blue-500"
            />
            <StatCard
              icon={Activity}
              label="Active Giveaways"
              value={data?.active_giveaways || 0}
              color="bg-green-500"
            />
            <StatCard
              icon={Users}
              label="Total Entries"
              value={data?.total_entries || 0}
              color="bg-orange-500"
            />
            <StatCard
              icon={Trophy}
              label="Total Winners"
              value={data?.total_winners || 0}
              color="bg-purple-500"
            />
          </div>

          <div className="mt-10 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Stats auto-refresh every 30 seconds. Data pulled live from
              Supabase.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
