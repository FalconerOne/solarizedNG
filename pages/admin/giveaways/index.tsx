import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function GiveawaysAdmin() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    prize: "",
    start_date: "",
    end_date: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchGiveaways();
  }, []);

  async function fetchGiveaways() {
    const { data, error } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    else setGiveaways(data || []);
    setLoading(false);
  }

  async function createGiveaway(e: any) {
    e.preventDefault();
    const { error } = await supabase.from("giveaways").insert([form]);
    if (error) return alert(error.message);
    alert("✅ Giveaway created!");
    setForm({ title: "", description: "", prize: "", start_date: "", end_date: "" });
    fetchGiveaways();
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("giveaways").update({ status }).eq("id", id);
    if (error) alert(error.message);
    else fetchGiveaways();
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-slate-700">🎁 Giveaway Management</h1>

        {/* CREATE FORM */}
        <form onSubmit={createGiveaway} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Giveaway Title"
            className="border p-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Prize (e.g., 10K Airtime)"
            className="border p-2 rounded"
            value={form.prize}
            onChange={(e) => setForm({ ...form, prize: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded col-span-1 md:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="text-sm text-gray-600">
            Start Date:
            <input
              type="datetime-local"
              className="border p-2 rounded w-full"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            End Date:
            <input
              type="datetime-local"
              className="border p-2 rounded w-full"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </label>
          <button className="bg-slate-800 text-white py-2 rounded col-span-1 md:col-span-2">
            ➕ Create Giveaway
          </button>
        </form>

        {/* GIVEAWAYS LIST */}
        {loading ? (
          <p className="text-center text-gray-500">Loading giveaways...</p>
        ) : giveaways.length === 0 ? (
          <p className="text-center text-gray-500">No giveaways yet.</p>
        ) : (
          <div className="space-y-4">
            {giveaways.map((g) => (
              <motion.div
                key={g.id}
                whileHover={{ scale: 1.02 }}
                className="border p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <h2 className="text-lg font-bold text-slate-700">{g.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{g.description}</p>
                <div className="flex flex-wrap justify-between text-sm text-gray-500">
                  <p>🎁 {g.prize}</p>
                  <p>
                    🕒 {format(new Date(g.start_date), "PPpp")} → {format(new Date(g.end_date), "PPpp")}
                  </p>
                </div>
                <div className="mt-3 flex gap-3 items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      g.status === "active"
                        ? "bg-green-100 text-green-700"
                        : g.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {g.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => updateStatus(g.id, "active")}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => updateStatus(g.id, "ended")}
                    className="text-xs px-3 py-1 bg-gray-600 text-white rounded"
                  >
                    End
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
