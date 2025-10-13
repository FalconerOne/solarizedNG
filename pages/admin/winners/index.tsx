import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface Giveaway {
  id: string;
  title: string;
}

interface Winner {
  id: string;
  full_name: string;
  phone: string;
  prize: string;
  giveaway_id: string;
  created_at: string;
  giveaways: { title: string };
}

export default function WinnersAdmin() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiveaways();
    fetchWinners();
  }, []);

  async function fetchGiveaways() {
    const { data, error } = await supabase.from("giveaways").select("id, title");
    if (error) console.error(error);
    else setGiveaways(data || []);
  }

  async function fetchWinners() {
    const { data, error } = await supabase
      .from("winners")
      .select("*, giveaways(title)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setWinners(data || []);
    setLoading(false);
  }

  async function pickWinner() {
    if (!selectedGiveaway) return alert("Select a giveaway first!");

    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("giveaway_id", selectedGiveaway);

    if (!entries || entries.length === 0) return alert("No entries found.");

    // Randomly pick a winner
    const winner = entries[Math.floor(Math.random() * entries.length)];

    const { error } = await supabase.from("winners").insert([
      {
        full_name: winner.full_name,
        phone: winner.phone,
        prize: "Gift Reward 🎁",
        giveaway_id: selectedGiveaway,
      },
    ]);

    if (error) return alert(error.message);
    alert(`🎉 Winner selected: ${winner.full_name}`);
    fetchWinners();
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-slate-700">🏆 Winners Management</h1>

        {/* Select Giveaway + Button */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 justify-center">
          <select
            className="border p-2 rounded w-full md:w-1/3"
            value={selectedGiveaway}
            onChange={(e) => setSelectedGiveaway(e.target.value)}
          >
            <option value="">Select Giveaway</option>
            {giveaways.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <button
            onClick={pickWinner}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            🎲 Pick Random Winner
          </button>
        </div>

        {/* Winners List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading winners...</p>
        ) : winners.length === 0 ? (
          <p className="text-center text-gray-500">No winners yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-slate-800 text-white text-sm">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Prize</th>
                  <th className="p-2 text-left">Giveaway</th>
                  <th className="p-2 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <motion.tr
                    key={w.id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="border-b text-sm"
                  >
                    <td className="p-2">{w.full_name}</td>
                    <td className="p-2">{w.phone}</td>
                    <td className="p-2">{w.prize}</td>
                    <td className="p-2">{w.giveaways?.title || "N/A"}</td>
                    <td className="p-2 text-center">{new Date(w.created_at).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
