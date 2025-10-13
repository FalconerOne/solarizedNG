import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from("dashboard_stats")
          .select("*")
          .single();
        if (error) throw error;
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-slate-800 text-white p-4 shadow">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🎛️ Admin Dashboard</h1>
          <Link
            href="/admin/notifications"
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
          >
            📢 Send Notification
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        {/* NAVIGATION */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Link href="/admin/dashboard" className="nav-btn">
            🏠 Overview
          </Link>
          <Link href="/admin/giveaways" className="nav-btn">
            🎁 Giveaways
          </Link>
          <Link href="/admin/entries" className="nav-btn">
            🧾 Entries
          </Link>
          <Link href="/admin/winners" className="nav-btn">
            🏆 Winners
          </Link>
          <Link href="/admin/notifications" className="nav-btn">
            📢 Notifications
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="nav-btn bg-red-600 hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </nav>

        {/* DASHBOARD STATS */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Platform Statistics
          </h2>

          {loading ? (
            <p>Loading stats...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <Stat label="Users" value={stats?.total_users || 0} />
              <Stat label="Active Entries" value={stats?.total_active_entries || 0} />
              <Stat label="Active Giveaways" value={stats?.active_giveaways || 0} />
              <Stat label="Winners" value={stats?.total_winners || 0} />
              <Stat label="Shares" value={stats?.total_shares || 0} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 border rounded-lg p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

// Tailwind utility for buttons
// Add this in your globals.css (optional for cleaner buttons):
// .nav-btn {
//   @apply bg-slate-700 text-white text-center py-2 rounded hover:bg-slate-800 transition;
// }
