import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase.from("dashboard_stats").select("*").single();
      setStats(data);
    }
    loadStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div>
        <AdminNavbar />
        <div className="max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-sm text-gray-500">Total Users</h2>
                <p className="text-2xl font-bold">{stats.total_users}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-sm text-gray-500">Active Entries</h2>
                <p className="text-2xl font-bold">{stats.total_active_entries}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-sm text-gray-500">Active Giveaways</h2>
                <p className="text-2xl font-bold">{stats.active_giveaways}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-sm text-gray-500">Total Winners</h2>
                <p className="text-2xl font-bold">{stats.total_winners}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-sm text-gray-500">Total Shares</h2>
                <p className="text-2xl font-bold">{stats.total_shares}</p>
              </div>
            </div>
          ) : (
            <p>Loading stats...</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
