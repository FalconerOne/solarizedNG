// /pages/admin/winners.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function WinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all winners with joined giveaway info
  useEffect(() => {
    async function fetchWinners() {
      const { data, error } = await supabase
        .from("winners")
        .select(`
          id,
          user_id,
          giveaway_id,
          prize,
          position,
          created_at,
          users(full_name, email),
          giveaways(title)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading winners:", error);
      } else {
        setWinners(data || []);
      }
      setLoading(false);
    }

    fetchWinners();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading winners...</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Giveaway Winners</h1>

          {winners.length === 0 ? (
            <p>No winners have been selected yet.</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Winner</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Giveaway</th>
                    <th className="p-3 text-left">Prize</th>
                    <th className="p-3 text-left">Position</th>
                    <th className="p-3 text-left">Date Won</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w, index) => (
                    <tr
                      key={w.id}
                      className="odd:bg-white even:bg-gray-100 border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{w.users?.full_name || "N/A"}</td>
                      <td className="p-3">{w.users?.email || "N/A"}</td>
                      <td className="p-3">{w.giveaways?.title || "N/A"}</td>
                      <td className="p-3 font-semibold text-green-700">{w.prize}</td>
                      <td className="p-3">
                        {w.position === 1
                          ? "Grand Winner"
                          : `Runner Up #${w.position - 1}`}
                      </td>
                      <td className="p-3">
                        {new Date(w.created_at).toLocaleString()}
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
