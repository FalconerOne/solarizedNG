// Example: /pages/admin/entries.js
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AdminEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("entries").select("*").limit(50);
      setEntries(data || []);
    }
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div>
        <AdminNavbar />
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Entries</h1>
          <p>Total entries: {entries.length}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
