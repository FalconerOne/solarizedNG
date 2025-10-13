import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/admin/login");
        return;
      }
      setUser(data.user);
    };

    const fetchGiveaways = async () => {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setGiveaways(data || []);
    };

    fetchUser();
    fetchGiveaways();
  }, [router]);

  async function runDraw() {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await fetch(
        "https://yacftysswuumjbrfarmx.functions.supabase.co/auto_pick_winners",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      ).then((r) => r.json());

      if (error) throw error;
      setMessage("✅ Draw completed successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error running draw. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🎯 Admin Dashboard</h1>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">
            {message}
          </div>
        )}

        <button
          onClick={runDraw}
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Running Draw..." : "Run Draw Now"}
        </button>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-2">🎁 Active Giveaways</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {giveaways.map((g) => (
            <div key={g.id} className="border p-4 rounded shadow-sm">
              <h3 className="font-semibold text-lg">{g.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{g.description}</p>
              <div className="text-xs text-gray-500">
                🕒 {new Date(g.start_date).toLocaleString()} →{" "}
                {new Date(g.end_date).toLocaleString()}
              </div>
              <div
                className={`mt-2 inline-block px-2 py-1 text-xs rounded ${
                  g.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}
              >
                {g.is_active ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
