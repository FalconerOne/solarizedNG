"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pencil, Trash2, ToggleLeft, ToggleRight, PlusCircle } from "lucide-react";

export default function AdminGiveaways() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    start_date: "",
    end_date: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);

  // Load giveaways
  useEffect(() => {
    fetchGiveaways();
  }, []);

  async function fetchGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setGiveaways(data);
    setLoading(false);
  }

  // Handle form input
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Save or update
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      const { error } = await supabase
        .from("giveaways")
        .update(formData)
        .eq("id", editing.id);
      if (!error) {
        setEditing(null);
        resetForm();
        fetchGiveaways();
      }
    } else {
      const { error } = await supabase.from("giveaways").insert([formData]);
      if (!error) {
        resetForm();
        fetchGiveaways();
      }
    }

    setLoading(false);
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      prize: "",
      start_date: "",
      end_date: "",
      active: true,
    });
  }

  // Edit
  function handleEdit(item) {
    setEditing(item);
    setFormData(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this giveaway?")) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (!error) fetchGiveaways();
  }

  // Toggle active
  async function toggleActive(item) {
    const { error } = await supabase
      .from("giveaways")
      .update({ active: !item.active })
      .eq("id", item.id);
    if (!error) fetchGiveaways();
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎁 Manage Giveaways</h1>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 max-w-2xl"
      >
        <h2 className="text-lg font-semibold">
          {editing ? "Edit Giveaway" : "Create New Giveaway"}
        </h2>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Giveaway title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows={3}
        />
        <input
          type="text"
          name="prize"
          value={formData.prize}
          onChange={handleChange}
          placeholder="Prize details"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-4">
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
          Active
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Saving..." : editing ? "Update Giveaway" : "Add Giveaway"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              resetForm();
            }}
            className="ml-2 px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Giveaways Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">All Giveaways</h2>
        {loading ? (
          <p>Loading...</p>
        ) : giveaways.length === 0 ? (
          <p>No giveaways yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Prize</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {giveaways.map((g) => (
                <tr key={g.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{g.title}</td>
                  <td className="p-2">{g.prize}</td>
                  <td className="p-2">
                    {g.active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(g)}
                      className="p-2 hover:bg-gray-200 rounded"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleActive(g)}
                      className="p-2 hover:bg-gray-200 rounded"
                      title="Toggle Active"
                    >
                      {g.active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-2 hover:bg-gray-200 rounded text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
