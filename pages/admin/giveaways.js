// /pages/admin/giveaways.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGiveaway, setNewGiveaway] = useState({
    title: "",
    description: "",
    main_prize: "",
    runner_up1_prize: "",
    runner_up2_prize: "",
    runner_up3_prize: "",
    start_date: "",
    end_date: "",
    activation_fee: 0,
    is_free: false,
    is_paid: true,
    allow_multiple_entries: true,
    main_winner_count: 1,
    runner_up_count: 3,
    image_url: "",
  });

  // ✅ Load all giveaways
  useEffect(() => {
    async function fetchGiveaways() {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error("Error loading giveaways:", error);
      else setGiveaways(data || []);
      setLoading(false);
    }
    fetchGiveaways();
  }, []);

  // ✅ Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGiveaway((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Create new giveaway
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("giveaways").insert([newGiveaway]);
    if (error) {
      alert("Error creating giveaway: " + error.message);
    } else {
      alert("Giveaway created successfully!");
      window.location.reload();
    }
  };

  // ✅ Toggle giveaway active/inactive
  const toggleActive = async (id, isActive) => {
    await supabase
      .from("giveaways")
      .update({ is_active: !isActive })
      .eq("id", id);
    window.location.reload();
  };

  if (loading) return <div className="p-6 text-center">Loading giveaways...</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Manage Giveaways</h1>

          {/* ✅ Create Giveaway Form (Admin Only) */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 mb-8 border"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Giveaway</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="title"
                placeholder="Giveaway Title"
                value={newGiveaway.title}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="main_prize"
                placeholder="Main Prize"
                value={newGiveaway.main_prize}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="runner_up1_prize"
                placeholder="Runner-up #1 Prize"
                value={newGiveaway.runner_up1_prize}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="runner_up2_prize"
                placeholder="Runner-up #2 Prize"
                value={newGiveaway.runner_up2_prize}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="runner_up3_prize"
                placeholder="Runner-up #3 Prize"
                value={newGiveaway.runner_up3_prize}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="activation_fee"
                type="number"
                placeholder="Activation Fee (₦)"
                value={newGiveaway.activation_fee}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="image_url"
                placeholder="Image URL"
                value={newGiveaway.image_url}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newGiveaway.description}
                onChange={handleChange}
                className="border p-2 rounded col-span-2"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_free"
                  checked={newGiveaway.is_free}
                  onChange={handleChange}
                />
                Free Giveaway
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allow_multiple_entries"
                  checked={newGiveaway.allow_multiple_entries}
                  onChange={handleChange}
                />
                Allow Multiple Entries
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={newGiveaway.start_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                type="datetime-local"
                name="end_date"
                value={newGiveaway.end_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Giveaway
            </button>
          </form>

          {/* ✅ Giveaway List */}
          <div className="bg-white border rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Existing Giveaways</h2>
            {giveaways.length === 0 ? (
              <p>No giveaways created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">Title</th>
                      <th className="p-3 text-left">Active</th>
                      <th className="p-3 text-left">Start</th>
                      <th className="p-3 text-left">End</th>
                      <th className="p-3 text-left">Fee (₦)</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giveaways.map((g) => (
                      <tr
                        key={g.id}
                        className="odd:bg-white even:bg-gray-50 border-b hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">{g.title}</td>
                        <td className="p-3">
                          {g.is_active ? (
                            <span className="text-green-700 font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-700 font-semibold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {new Date(g.start_date).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {new Date(g.end_date).toLocaleString()}
                        </td>
                        <td className="p-3">{g.activation_fee}</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleActive(g.id, g.is_active)}
                            className={`px-3 py-1 rounded text-white ${
                              g.is_active ? "bg-red-600" : "bg-green-600"
                            }`}
                          >
                            {g.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
