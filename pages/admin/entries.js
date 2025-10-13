// /pages/admin/entries.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [giveaways, setGiveaways] = useState([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState("all");

  // ✅ Load entries and giveaways
  useEffect(() => {
    async function fetchData() {
      const { data: giveawayData } = await supabase
        .from("giveaways")
        .select("id, title");
      setGiveaways(giveawayData || []);

      let query = supabase
        .from("entries")
        .select(
          `
          id,
          user_id,
          giveaway_id,
          is_activated,
          created_at,
          giveaways (title),
          profiles (full_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (selectedGiveaway !== "all") {
        query = query.eq("giveaway_id", selectedGiveaway);
      }

      const { data, error } = await query;
      if (error) console.error("Error loading entries:", error);
      else setEntries(data || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedGiveaway]);

  if (loading) return <div className="p-6 text-center">Loading entries...</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Entries Management</h1>

          {/* ✅ Filter Section */}
          <div className="flex items-center gap-4 mb-6">
            <select
              value={selectedGiveaway}
              onChange={(e) => setSelectedGiveaway(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Giveaways</option>
              {giveaways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Entries Table */}
          <div className="bg-white border rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Giveaway</th>
                  <th className="p-3 text-left">Activated</th>
                  <th className="p-3 text-left">Date Entered</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="odd:bg-white even:bg-gray-50 border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {entry.profiles?.full_name || "Unknown"}
                      </td>
                      <td className="p-3">{entry.profiles?.email || "N/A"}</td>
                      <td className="p-3">{entry.giveaways?.title || "N/A"}</td>
                      <td className="p-3">
                        {entry.is_activated ? (
                          <span className="text-green-700 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-700 font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
