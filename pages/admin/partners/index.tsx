"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/toast";
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const PartnersAdminPage: React.FC = () => {
  const supabase = createClientComponentClient();

  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", logo_url: "", is_active: true });

  // Load existing partners
  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    setLoading(true);
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load partners");
    else setPartners(data || []);
    setLoading(false);
  }

  async function savePartner() {
    if (!form.name.trim()) return toast.error("Partner name is required");

    const payload = { ...form };

    const { error } = editing
      ? await supabase.from("partners").update(payload).eq("id", editing.id)
      : await supabase.from("partners").insert([payload]);

    if (error) toast.error("Failed to save partner");
    else {
      toast.success(editing ? "Partner updated" : "Partner added");
      setForm({ name: "", logo_url: "", is_active: true });
      setEditing(null);
      fetchPartners();
    }
  }

  async function deletePartner(id: number) {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) toast.error("Failed to delete partner");
    else {
      toast.success("Partner deleted");
      fetchPartners();
    }
  }

  async function togglePartner(id: number, current: boolean) {
    const { error } = await supabase
      .from("partners")
      .update({ is_active: !current })
      .eq("id", id);
    if (error) toast.error("Failed to update status");
    else {
      toast.success("Partner status updated");
      fetchPartners();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Partners Management</h1>

      {/* Form Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-medium mb-3">
          {editing ? "Edit Partner" : "Add New Partner"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            placeholder="Partner name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <input
            type="text"
            placeholder="Logo URL (optional)"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-orange-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={savePartner}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            <PlusCircle size={18} />
            {editing ? "Update Partner" : "Add Partner"}
          </button>

          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ name: "", logo_url: "", is_active: true });
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-medium mb-4">Current Partners</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : partners.length === 0 ? (
          <p className="text-gray-500">No partners found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Logo</th>
                <th className="py-2">Name</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No Logo</span>
                    )}
                  </td>
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setEditing(p) || setForm(p)}
                      className="p-2 rounded hover:bg-blue-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => togglePartner(p.id, p.is_active)}
                      className="p-2 rounded hover:bg-yellow-100"
                    >
                      {p.is_active ? (
                        <ToggleRight size={16} />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => deletePartner(p.id)}
                      className="p-2 rounded hover:bg-red-100 text-red-600"
                    >
                      <Trash2 size={16} />
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
};

export default PartnersAdminPage;
