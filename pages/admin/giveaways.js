import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminGiveaways() {
  const [giveaways, setGiveaways] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("giveaways")
        .select("id, title, is_active, activation_fee, created_at")
        .order("created_at", { ascending: false });
      setGiveaways(data || []);
    }
    load();
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Giveaways</h1>
        <a
          href="/admin/create-giveaway"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-4"
        >
          + Create New Giveaway
        </a>
        <div className="space-y-3">
          {giveaways.map((g) => (
            <div
              key={g.id}
              className="p-3 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{g.title}</div>
                <div className="text-xs text-gray-500">
                  Fee: {g.activation_fee ?? 0} |{" "}
                  {g.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </div>
              </div>
              <a
                href={`/admin/giveaway/${g.id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                View / Edit
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
