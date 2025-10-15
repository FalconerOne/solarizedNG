"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";
import { motion } from "framer-motion";
import { Download, Users, Gift, Trophy, Share2 } from "lucide-react";

interface ActivityLog {
  id: string;
  user_name: string | null;
  action: string;
  details: string | null;
  created_at: string;
}

export default function AdminActivityPage() {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [filteredActivity, setFilteredActivity] = useState<ActivityLog[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrizes: 0,
    activeGiveaways: 0,
    referrals: 0,
  });

  // Fetch metrics + activity logs
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch KPIs
      const [{ count: usersCount }, { count: prizesCount }, { count: giveawaysCount }, { count: referralsCount }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("prizes").select("*", { count: "exact", head: true }),
          supabase.from("giveaways").select("id", { count: "exact", head: true }),
          supabase.from("referrals").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        totalUsers: usersCount || 0,
        totalPrizes: prizesCount || 0,
        activeGiveaways: giveawaysCount || 0,
        referrals: referralsCount || 0,
      });

      // Fetch initial activity log
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setActivity(data);
        setFilteredActivity(data);
      }
    };

    fetchInitialData();

    // Real-time listener for live events
    const subscription = supabase
      .channel("activity_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          setActivity((prev) => [payload.new as ActivityLog, ...prev.slice(0, 49)]);
          setFilteredActivity((prev) => [payload.new as ActivityLog, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredActivity(activity);
      return;
    }
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    const filtered = activity.filter((log) => {
      const date = new Date(log.created_at);
      return date >= start && date <= end;
    });
    setFilteredActivity(filtered);
  }, [startDate, endDate, activity]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-orange-600 mb-8 flex items-center gap-3"
      >
        <Trophy className="text-orange-500" />
        Admin Activity & Insights
      </motion.h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 p-4 rounded-xl text-center shadow">
          <Users className="mx-auto text-orange-500 mb-2" />
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalUsers}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl text-center shadow">
          <Gift className="mx-auto text-orange-500 mb-2" />
          <h3 className="text-sm text-gray-500">Prizes Claimed</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalPrizes}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl text-center shadow">
          <Trophy className="mx-auto text-orange-500 mb-2" />
          <h3 className="text-sm text-gray-500">Active Giveaways</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.activeGiveaways}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl text-center shadow">
          <Share2 className="mx-auto text-orange-500 mb-2" />
          <h3 className="text-sm text-gray-500">Referrals</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.referrals}</p>
        </div>
      </div>

      {/* FILTER + EXPORT */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          />
          <label className="text-sm text-gray-600">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          />
        </div>

        <CSVLink
          data={filteredActivity}
          filename="solarizedNG_activity_log.csv"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm transition shadow"
        >
          <Download size={16} /> Export CSV
        </CSVLink>
      </div>

      {/* LIVE ACTIVITY FEED */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-3 font-semibold text-lg">
          Live Activity Feed
        </div>
        <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((log) => (
              <motion.li
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 hover:bg-orange-50 transition"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold text-orange-600">{log.user_name || "Anonymous"}</span>{" "}
                    {log.action} {log.details && <span className="text-gray-500">({log.details})</span>}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </motion.li>
            ))
          ) : (
            <li className="p-6 text-center text-gray-500 italic">No activity logs found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
