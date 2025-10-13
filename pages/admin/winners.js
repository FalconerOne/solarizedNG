// /pages/admin/winners.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function WinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [giveaways, setGiveaways] = useState([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const { data: giveawayData } = await supabase
        .from("giveaways")
        .select("id, title");
      setGiveaways(giveawayData || []);

      let query = supabase
        .from("winners")
        .select(
          `
          id,
          user_id,
          giveaway_id,
          prize,
          is_main_winner,
          created_at,
          eligible_next_draw,
          giveaways (title),
          profiles (full_name, email, phone)
        `
        )
        .order("created_at", { ascending: false });

      if (selectedGiveaway !== "all") {
        query = query.eq("giveaway_id", selectedGiveaway);
      }

      const { data, error } = await query;
      if (error) console.error("Error loading winners:", error);
      else setWinners(data || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedGiveaway]);

  // ✅ Toggle eligibility for next draw
  async function toggleEligibility(winnerId, currentStatus) {
    const { error } = await supabase
      .from("winners")
      .update({ eligible_next_draw: !currentStatus })
      .eq("id", winnerId);
    if (!error) {
      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId
            ? { ...w, eligible_next_draw: !currentStatus }
            : w
        )
      );
    } else console.error("Error updating eligibility:", error);
  }

  if (loading) return <div className="p-6 text-center">Loading winners...</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Winners Management</h1>

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

          {/* ✅ Winners Table */}
          <div className="bg-white border rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Giveaway</th>
                  <th className="p-3 text-left">Prize</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Eligible Next Draw</th>
                  <th className="p-3 text-left">Won On</th>
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6">
                      No winners found.
                    </td>
                  </tr>
                ) : (
                  winners.map((winner) => (
                    <tr
                      key={winner.id}
                      className="odd:bg-white even:bg-gray-50 border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {winner.profiles?.full_name || "Unknown"}
                      </td>
                      <td className="p-3">{winner.profiles?.email || "N/A"}</td>
                      <td className="p-3">{winner.profiles?.phone || "N/A"}</td>
                      <td className="p-3">{winner.giveaways?.title || "N/A"}</td>
                      <td className="p-3">{winner.prize || "N/A"}</td>
                      <td className="p-3">
                        {winner.is_main_winner ? (
                          <span className="text-yellow-700 font-semibold">
                            Grand Winner
                          </span>
                        ) : (
                          <span className="text-blue-700 font-semibold">
                            Runner Up
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            toggleEligibility(
                              winner.id,
                              winner.eligible_next_draw
                            )
                          }
                          className={`px-3 py-1 rounded text-sm ${
                            winner.eligible_next_draw
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {winner.eligible_next_draw ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="p-3">
                        {new Date(winner.created_at).toLocaleString()}
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
