import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface Entry {
  id: string;
  full_name: string;
  phone: string;
  points: number;
  giveaway_id: string;
  created_at: string;
  giveaways: { title: string };
}

export default function EntriesAdmin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from("entries")
      .select("*, giveaways(title)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setEntries(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-slate-700">🎫 Giveaway Entries</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-slate-800 text-white text-sm">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Giveaway</th>
                  <th className="p-2 text-center">Points</th>
                  <th className="p-2 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <motion.tr
                    key={e.id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="border-b text-sm"
                  >
                    <td className="p-2">{e.full_name}</td>
                    <td className="p-2">{e.phone}</td>
                    <td className="p-2">{e.giveaways?.title || "N/A"}</td>
                    <td className="p-2 text-center">{e.points}</td>
                    <td className="p-2 text-center">{new Date(e.created_at).toLocaleString()}</td>
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
