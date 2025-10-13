// /pages/admin/entries.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all entries from Supabase
  useEffect(() => {
    async function fetchEntries() {
      const { data, error } = await supabase
        .from("entries")
        .select(`
          id,
          user_id,
          giveaway_id,
          is_activated,
          points,
          created_at,
          users(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching entries:", error);
      else setEntries(data || []);

      setLoading(false);
    }
    fetchEntries();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading entries...</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">All Entries</h1>

          {entries.length === 0 ? (
            <p>No entries found.</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Giveaway ID</th>
                    <th className="p-3 text-left">Points</th>
                    <th className="p-3 text-left">Activated</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="odd:bg-white even:bg-gray-100 border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{entry.users?.full_name || "N/A"}</td>
                      <td className="p-3">{entry.users?.email || "N/A"}</td>
                      <td className="p-3">{entry.giveaway_id}</td>
                      <td className="p-3">{entry.points}</td>
                      <td className="p-3">
                        {entry.is_activated ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="p-3">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
