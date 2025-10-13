import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const { data } = await supabase.from("dashboard_stats").select("*").single();
    setStats(data || {});
    setLoading(false);
  }

  // Run draw via Edge Function
  async function runDraw() {
    setRunning(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/run-draw", { method: "POST" });
      const json = await res.json();
      if (res.ok) setMessage("✅ Draw completed");
      else setMessage("❌ Draw failed: " + (json.message || "unknown"));
    } catch (err) {
      setMessage("❌ Error running draw");
    } finally {
      setRunning(false);
      fetchStats();
    }
  }

  // Export contacts (serverless API will return CSV)
  async function exportContacts() {
    setMessage("Preparing CSV, please wait...");
    const res = await fetch("/api/admin/export-contacts");
    if (!res.ok) {
      setMessage("❌ Export failed");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString()}.csv`;
    a.click();
    setMessage("✅ Export ready");
  }

  // Grant free entry for previous winners for a given giveaway
  async function grantFreeEntry(giveawayId) {
    if (!confirm("Grant free entry to previous winners for this giveaway?")) return;
    setGranting(true);
    const res = await fetch("/api/admin/grant-free-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giveawayId }),
    });
    if (res.ok) setMessage("✅ Free entries granted");
    else setMessage("❌ Failed to grant free entries");
    setGranting(false);
    fetchStats();
  }

  if (loading) return <div><AdminNavbar /><div className="p-6">Loading…</div></div>;

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {message && <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">{message}</div>}

        <div className="flex gap-3 mb-6">
          <button onClick={runDraw} disabled={running} className={`px-4 py-2 rounded ${running ? "bg-gray-400" : "bg-green-600 text-white"}`}>
            {running ? "Running draw…" : "Run Draw Now"}
          </button>

          <button onClick={exportContacts} className="px-4 py-2 rounded bg-indigo-600 text-white">Export Contacts</button>
        </div>

        <section className="mb-6">
          <h2 className="font-semibold mb-2">Active Giveaways</h2>
          <div className="grid gap-3">
            {/** fetch and render giveaways */}
            <GiveawayList onGrant={grantFreeEntry} granting={granting} />
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total users" value={stats?.total_users} />
            <StatCard title="Active entries" value={stats?.total_active_entries} />
            <StatCard title="Active giveaways" value={stats?.active_giveaways} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* small helper components below - paste into same file or move to components/ later */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? 0}</div>
    </div>
  );
}

function GiveawayList({ onGrant, granting }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("giveaways").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setList(data || []);
    }
    load();
  }, []);

  if (!list.length) return <div>No active giveaways</div>;

  return list.map((g) => (
    <div key={g.id} className="p-3 bg-white rounded shadow flex items-center justify-between">
      <div>
        <div className="font-semibold">{g.title}</div>
        <div className="text-xs text-gray-500">Fee: {g.is_free ? "Free" : `₦${g.activation_fee}`}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onGrant(g.id)} disabled={granting} className="px-3 py-1 bg-yellow-500 rounded text-white">{granting ? "Granting…" : "Grant free to past winners"}</button>
        <a className="px-3 py-1 bg-slate-200 rounded" href={`/admin/giveaway/${g.id}`}>Manage</a>
      </div>
    </div>
  ));
}
