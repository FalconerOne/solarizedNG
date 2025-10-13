import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("entries")
        .select("id, user_id, giveaway_id, is_activated, is_free_entry, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setEntries(data || []);
    }
    load();
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Entries</h1>
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Giveaway</th>
                <th className="px-3 py-2">Activated</th>
                <th className="px-3 py-2">Free Entry</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-3 py-2">{e.id}</td>
                  <td className="px-3 py-2">{e.user_id}</td>
                  <td className="px-3 py-2">{e.giveaway_id}</td>
                  <td className="px-3 py-2">{e.is_activated ? "✅" : "❌"}</td>
                  <td className="px-3 py-2">{e.is_free_entry ? "🎁" : "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
