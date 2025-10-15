"use client";

import { useEffect, useState, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import { FileDown, Bell, FileText, User, Award, Gift, Users, Activity } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Link from "next/link";

export default function AdminActivityPage() {
  const supabase = createClientComponentClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  // 🎨 Chart Colors
  const COLORS = ["#F97316", "#FB923C", "#FDBA74", "#FCD34D", "#A3E635", "#34D399"];

  // 🧠 Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setLogs(data);
    };
    fetchLogs();

    // 🔔 Realtime notifications
    const channel = supabase
      .channel("realtime-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🧩 Filtered logs
  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((log) => log.action?.toLowerCase().includes(filter.toLowerCase()));
  }, [logs, filter]);

  // 📊 Compute Action Breakdown for Pie Chart
  const actionStats = useMemo(() => {
    const countMap: Record<string, number> = {};
    logs.forEach((log) => {
      const action = log.action || "unknown";
      countMap[action] = (countMap[action] || 0) + 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  }, [logs]);

  // 📈 Trend Data (Bar Chart)
  const dateGrouped = useMemo(() => {
    const grouped: Record<string, number> = {};
    logs.forEach((log) => {
      const d = new Date(log.created_at).toLocaleDateString();
      grouped[d] = (grouped[d] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }, [logs]);

  // 📊 Summary Counts
  const summary = useMemo(() => {
    const uniqueUsers = new Set(logs.map((log) => log.username)).size;
    const totalActivities = logs.length;
    const prizes = logs.filter((log) => log.action?.toLowerCase().includes("prize")).length;
    const giveaways = logs.filter((log) => log.action?.toLowerCase().includes("giveaway")).length;
    return { uniqueUsers, totalActivities, prizes, giveaways };
  }, [logs]);

  // 🧾 Export XLSX
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
    XLSX.writeFile(workbook, "AdminActivityLogs.xlsx");
  };

  // 🧾 Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("SolarizedNG Admin Activity Report", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["User", "Action", "Timestamp"]],
      body: filteredLogs.map((log) => [log.username || "-", log.action || "-", new Date(log.created_at).toLocaleString()]),
    });
    doc.save("AdminActivityReport.pdf");
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-orange-600 mb-6 flex items-center gap-2"
      >
        🧭 Admin Activity Dashboard
      </motion.h1>

      {/* 🧮 Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-500">Total Activities</p>
            <h3 className="text-2xl font-bold text-orange-600">{summary.totalActivities}</h3>
          </div>
          <Activity size={28} className="text-orange-400" />
        </div>

        <div className="bg-orange-50 p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-500">Unique Users</p>
            <h3 className="text-2xl font-bold text-orange-600">{summary.uniqueUsers}</h3>
          </div>
          <Users size={28} className="text-orange-400" />
        </div>

        <div className="bg-orange-50 p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-500">Giveaways Created</p>
            <h3 className="text-2xl font-bold text-orange-600">{summary.giveaways}</h3>
          </div>
          <Award size={28} className="text-orange-400" />
        </div>

        <div className="bg-orange-50 p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <p className="text-sm text-gray-500">Prizes Claimed</p>
            <h3 className="text-2xl font-bold text-orange-600">{summary.prizes}</h3>
          </div>
          <Gift size={28} className="text-orange-400" />
        </div>
      </div>

      {/* 🔧 Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="login">Login</option>
          <option value="claim">Claim</option>
          <option value="share">Share</option>
          <option value="referral">Referral</option>
          <option value="prize">Prize</option>
          <option value="giveaway">Giveaway</option>
        </select>

        <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md shadow hover:bg-green-600 transition">
          <FileDown size={16} /> Export XLSX
        </button>

        <button onClick={exportToPDF} className="flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-md shadow hover:bg-orange-600 transition">
          <FileText size={16} /> Export PDF
        </button>

        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className="ml-auto flex items-center gap-2 border px-3 py-2 rounded-md text-orange-600 hover:bg-orange-50 transition"
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 rounded-full">{notifications.length}</span>
          )}
        </button>
      </div>

      {/* 📈 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-orange-50 rounded-xl p-4 shadow">
          <h2 className="font-semibold text-orange-700 mb-3">Activity Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dateGrouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 shadow">
          <h2 className="font-semibold text-orange-700 mb-3">Action Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={actionStats} dataKey="value" nameKey="name" outerRadius={80} label>
                {actionStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 Logs Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-orange-100 text-left text-sm font-semibold">
              <th className="p-3 border-b">User</th>
              <th className="p-3 border-b">Action</th>
              <th className="p-3 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, i) => (
              <tr key={i} className="hover:bg-orange-50 transition">
                <td className="p-3 border-b">
                  {log.username ? (
                    <Link href={`/admin/users/${log.username}`} className="text-orange-600 flex items-center gap-1">
                      <User size={14} /> {log.username}
                    </Link>
                  ) : (
                    <span className="text-gray-500 italic">Unknown</span>
                  )}
                </td>
                <td className="p-3 border-b text-gray-800">{log.action}</td>
                <td className="p-3 border-b text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔔 Notifications Drawer */}
      {showDrawer && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 border-l z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-orange-600">Realtime Notifications</h3>
            <button onClick={() => setShowDrawer(false)} className="text-gray-500">✕</button>
          </div>
          <ul className="space-y-3 overflow-y-auto max-h-[80vh]">
            {notifications.map((n, i) => (
              <li key={i} className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded shadow-sm">
                <p className="font-medium text-gray-800">{n.username || "Unknown user"}</p>
                <p className="text-sm text-gray-600">{n.action}</p>
                <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </main>
  );
}
