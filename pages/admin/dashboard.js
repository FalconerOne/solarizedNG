import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching stats:", error);
      } else {
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Failed to load stats.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">
        SolarizedNG Giveaway — Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Total Users</h2>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {stats.total_users}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Active Entries
          </h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.total_active_entries}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Active Giveaways
          </h2>
          <p className="text-3xl font-bold text-orange-500 mt-2">
            {stats.active_giveaways}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Total Winners
          </h2>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {stats.total_winners}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Total Shares
          </h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {stats.total_shares}
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-700 transition"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}
