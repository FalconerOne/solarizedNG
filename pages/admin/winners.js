import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("winners")
        .select("id, user_id, giveaway_id, is_free_entry, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setWinners(data || []);
    }
    load();
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Winners</h1>
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Giveaway</th>
                <th className="px-3 py-2">Free Entry?</th>
                <th className="px-3 py-2">Won on</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-3 py-2">{w.id}</td>
                  <td className="px-3 py-2">{w.user_id}</td>
                  <td className="px-3 py-2">{w.giveaway_id}</td>
                  <td className="px-3 py-2">{w.is_free_entry ? "🎁" : "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(w.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
