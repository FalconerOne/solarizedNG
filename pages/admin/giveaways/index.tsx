"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AdminGiveaways() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [giveaways, setGiveaways] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    start_date: "",
    end_date: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);

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

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const isEditing = !!editing;
    const { error } = isEditing
      ? await supabase.from("giveaways").update(formData).eq("id", editing.id)
      : await supabase.from("giveaways").insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isEditing ? "Giveaway updated!" : "Giveaway added!",
        description: "Your changes have been saved successfully.",
      });
      resetForm();
      setEditing(null);
      fetchGiveaways();
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

  function handleEdit(item: any) {
    setEditing(item);
    setFormData(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteConfirmed() {
    if (!deleteId) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", deleteId);
    if (error) {
      toast({
        title: "Error deleting giveaway",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Giveaway removed successfully.",
      });
      fetchGiveaways();
    }
    setDeleteId(null);
  }

  async function toggleActive(item: any) {
    const { error } = await supabase
      .from("giveaways")
      .update({ active: !item.active })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `${item.title} is now ${item.active ? "inactive" : "active"}.`,
      });
      fetchGiveaways();
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎁 Manage Giveaways</h1>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 max-w-2xl"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
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

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Giveaway" : "Add Giveaway"}
          </Button>

          {editing && (
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setEditing(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          )}
        </div>
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
              {giveaways.map((g: any) => (
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
                      onClick={() => setDeleteId(g.id)}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Giveaway?</DialogTitle>
          </DialogHeader>
          <p>This action cannot be undone. Are you sure you want to continue?</p>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
