// /pages/admin/giveaways/index.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Edit, Trash2, Gift, Duplicate, RefreshCcw } from "lucide-react";

/**
 * Admin Giveaways page (upgraded)
 * - Search/filter
 * - Add / Edit Giveaway (modal)
 * - Delete with confirmation
 * - Duplicate giveaway (+ optional prize clone)
 * - Toggle active/inactive (updates both is_active and active to be safe)
 * - View Prizes modal (list, add/edit/delete, image upload to 'prize-images')
 * - Toasts & loading spinners
 *
 * Paste whole file to /pages/admin/giveaways/index.tsx
 */

type GiveawayType = {
  id: string;
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
  active?: boolean | null;
  created_at?: string;
};

type PrizeType = {
  id: string;
  giveaway_id: string;
  title: string;
  description?: string;
  value?: string | number;
  rank?: number;
  image_url?: string;
  created_at?: string;
};

const BUCKET = "prize-images";

export default function AdminGiveawaysPage() {
  const supabase = createClientComponentClient();

  // Giveaways list + UI state
  const [giveaways, setGiveaways] = useState<GiveawayType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search/filter
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Add/Edit giveaway modal
  const [showGiveawayModal, setShowGiveawayModal] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<GiveawayType | null>(null);
  const [giveawayForm, setGiveawayForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [savingGiveaway, setSavingGiveaway] = useState(false);

  // View prizes modal
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<GiveawayType | null>(null);
  const [prizes, setPrizes] = useState<PrizeType[]>([]);
  const [prizesLoading, setPrizesLoading] = useState(false);

  // Prize add/edit inside modal
  const [prizeForm, setPrizeForm] = useState({
    id: "" as string | "",
    title: "",
    description: "",
    value: "",
    rank: 1,
    imageFile: null as File | null,
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; msg: string; kind?: "success" | "error" }[]>([]);

  // loading spinner helper
  function withLoading<T>(setter: (v: boolean) => void, fn: () => Promise<T>) {
    return async () => {
      setter(true);
      try {
        return await fn();
      } finally {
        setter(false);
      }
    };
  }

  // Toast helpers
  function pushToast(msg: string, kind: "success" | "error" = "success") {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }

  // Fetch giveaways
  const fetchGiveaways = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<GiveawayType>("giveaways")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchGiveaways error", error);
      pushToast("Failed loading giveaways", "error");
    } else {
      setGiveaways(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  // Derived filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return giveaways.filter((g) => {
      if (statusFilter === "active" && !(g.is_active ?? g.active ?? false)) return false;
      if (statusFilter === "inactive" && (g.is_active ?? g.active ?? false)) return false;
      if (!q) return true;
      return (g.title || "").toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q);
    });
  }, [giveaways, query, statusFilter]);

  // Add / Edit Giveaway
  function openAddGiveaway() {
    setEditingGiveaway(null);
    setGiveawayForm({ title: "", description: "", start_date: "", end_date: "" });
    setShowGiveawayModal(true);
  }

  function openEditGiveaway(g: GiveawayType) {
    setEditingGiveaway(g);
    setGiveawayForm({
      title: g.title || "",
      description: g.description || "",
      start_date: g.start_date ? g.start_date.split("T")[0] : "",
      end_date: g.end_date ? g.end_date.split("T")[0] : "",
    });
    setShowGiveawayModal(true);
  }

  async function saveGiveaway() {
    const { title, description, start_date, end_date } = giveawayForm;
    if (!title || !description) {
      pushToast("Please fill title and description", "error");
      return;
    }
    setSavingGiveaway(true);

    // optimistic UI: if creating, add temporary item
    if (!editingGiveaway) {
      const temp: GiveawayType = {
        id: `tmp-${Date.now()}`,
        title,
        description,
        start_date: start_date || null,
        end_date: end_date || null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setGiveaways((prev) => [temp, ...prev]);
    }

    try {
      if (editingGiveaway) {
        const { error } = await supabase
          .from("giveaways")
          .update({ title, description, start_date: start_date || null, end_date: end_date || null })
          .eq("id", editingGiveaway.id);
        if (error) throw error;
        pushToast("Giveaway updated");
      } else {
        const { data, error } = await supabase
          .from("giveaways")
          .insert([{ title, description, start_date: start_date || null, end_date: end_date || null }])
          .select()
          .single();
        if (error) throw error;
        // replace the temp entry with real one
        if (data) {
          setGiveaways((prev) => {
            const withoutTmp = prev.filter((g) => !g.id?.toString().startsWith("tmp-"));
            return [data, ...withoutTmp];
          });
        }
        pushToast("Giveaway created");
      }
    } catch (err) {
      console.error("saveGiveaway err", err);
      pushToast("Failed saving giveaway", "error");
      // rollback optimistic create
      if (!editingGiveaway) {
        setGiveaways((prev) => prev.filter((g) => !g.id?.toString().startsWith("tmp-")));
      }
    } finally {
      setSavingGiveaway(false);
      setShowGiveawayModal(false);
      setEditingGiveaway(null);
      // refresh to ensure canonical state
      fetchGiveaways();
    }
  }

  // Delete
  async function deleteGiveaway(id: string) {
    if (!confirm("Delete this giveaway? This will also delete linked prizes.")) return;
    // optimistic UI remove
    const prev = giveaways;
    setGiveaways((g) => g.filter((x) => x.id !== id));
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (error) {
      console.error("deleteGiveaway error", error);
      setGiveaways(prev); // rollback
      pushToast("Failed to delete giveaway", "error");
    } else {
      pushToast("Giveaway deleted");
    }
  }

  // Duplicate giveaway (optionally clone prizes)
  async function duplicateGiveaway(g: GiveawayType) {
    const clonePrizes = confirm("Clone prizes from this giveaway to the new copy? OK = yes, Cancel = no");
    // optimistic UI: add a temp duplicated entry
    const temp: GiveawayType = {
      id: `tmp-${Date.now()}`,
      title: `${g.title} (Copy)`,
      description: g.description,
      start_date: g.start_date,
      end_date: g.end_date,
      is_active: false,
      created_at: new Date().toISOString(),
    };
    setGiveaways((prev) => [temp, ...prev]);

    try {
      const { data: newG, error: createErr } = await supabase
        .from("giveaways")
        .insert([{ title: temp.title, description: temp.description, start_date: temp.start_date, end_date: temp.end_date, is_active: false }])
        .select()
        .single();
      if (createErr) throw createErr;

      if (clonePrizes) {
        // fetch original prizes
        const { data: originalPrizes, error: pErr } = await supabase
          .from<PrizeType>("prizes")
          .select("*")
          .eq("giveaway_id", g.id);
        if (pErr) throw pErr;
        if (originalPrizes && originalPrizes.length) {
          // map and insert for new giveaway
          const inserts = originalPrizes.map((p) => ({
            giveaway_id: newG.id,
            title: p.title,
            description: p.description,
            value: p.value,
            rank: p.rank,
            image_url: p.image_url,
          }));
          const { error: insertPrizesErr } = await supabase.from("prizes").insert(inserts);
          if (insertPrizesErr) throw insertPrizesErr;
        }
      }

      pushToast("Giveaway duplicated");
      // replace temp with newG
      setGiveaways((prev) => [newG, ...prev.filter((x) => !x.id?.toString().startsWith("tmp-"))]);
    } catch (err) {
      console.error("duplicateGiveaway error", err);
      pushToast("Failed to duplicate", "error");
      // rollback optimistic
      setGiveaways((prev) => prev.filter((x) => !x.id?.toString().startsWith("tmp-")));
    } finally {
      fetchGiveaways();
    }
  }

  // Toggle active/inactive (update is_active and active)
  async function toggleActive(g: GiveawayType) {
    const newVal = !(g.is_active ?? g.active ?? false);
    // optimistic update
    setGiveaways((prev) => prev.map((x) => (x.id === g.id ? { ...x, is_active: newVal, active: newVal } : x)));
    const { error } = await supabase
      .from("giveaways")
      .update({ is_active: newVal, active: newVal })
      .eq("id", g.id);
    if (error) {
      console.error("toggleActive error", error);
      pushToast("Failed to update status", "error");
      // rollback by refetch
      fetchGiveaways();
    } else {
      pushToast(newVal ? "Activated" : "Deactivated");
    }
  }

  // Prizes: open modal, load prizes for selected giveaway
  async function openPrizesModal(g: GiveawayType) {
    setSelectedGiveaway(g);
    setShowPrizesModal(true);
    await loadPrizes(g.id);
  }

  async function loadPrizes(giveawayId: string) {
    setPrizesLoading(true);
    const { data, error } = await supabase
      .from<PrizeType>("prizes")
      .select("*")
      .eq("giveaway_id", giveawayId)
      .order("rank", { ascending: true });
    if (error) {
      console.error("loadPrizes error", error);
      pushToast("Failed loading prizes", "error");
    } else {
      setPrizes(data || []);
    }
    setPrizesLoading(false);
  }

  // Prize image upload helper
  async function uploadPrizeImage(file: File) {
    if (!file) return "";
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      return data?.publicUrl || "";
    } catch (err) {
      console.error("uploadPrizeImage error", err);
      pushToast("Image upload failed", "error");
      return "";
    } finally {
      setUploadingImage(false);
    }
  }

  // Add or update prize (inside prizes modal)
  async function savePrizeFromModal() {
    if (!selectedGiveaway) return;
    const { id, title, description, value, rank, imageFile } = prizeForm as any;
    if (!title) {
      pushToast("Prize title required", "error");
      return;
    }
    let image_url = prizeForm.image_url || "";

    // optimistic update: not adding optimistic prize to list for simplicity; we'll refresh after save
    try {
      if (imageFile) {
        const url = await uploadPrizeImage(imageFile);
        if (url) image_url = url;
      }

      if (id) {
        // update
        const { error } = await supabase
          .from("prizes")
          .update({ title, description, value, rank, image_url })
          .eq("id", id);
        if (error) throw error;
        pushToast("Prize updated");
      } else {
        // insert
        const { error } = await supabase
          .from("prizes")
          .insert([{ giveaway_id: selectedGiveaway.id, title, description, value, rank, image_url }]);
        if (error) throw error;
        pushToast("Prize added");
      }
      // refresh
      await loadPrizes(selectedGiveaway.id);
      // reset form
      setPrizeForm({ id: "", title: "", description: "", value: "", rank: 1, imageFile: null, image_url: "" });
    } catch (err) {
      console.error("savePrizeFromModal err", err);
      pushToast("Failed saving prize", "error");
    }
  }

  async function deletePrize(prizeId: string) {
    if (!confirm("Delete this prize?")) return;
    // optimistic UI
    const prev = prizes;
    setPrizes((p) => p.filter((x) => x.id !== prizeId));
    const { error } = await supabase.from("prizes").delete().eq("id", prizeId);
    if (error) {
      console.error("deletePrize error", error);
      setPrizes(prev);
      pushToast("Failed deleting prize", "error");
    } else {
      pushToast("Prize deleted");
    }
  }

  function openEditPrize(p: PrizeType) {
    setPrizeForm({
      id: p.id,
      title: p.title,
      description: p.description || "",
      value: p.value ? String(p.value) : "",
      rank: p.rank || 1,
      imageFile: null,
      image_url: p.image_url || "",
    });
  }

  // Lightbox preview
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Countdown helper
  function daysRemaining(g: GiveawayType) {
    if (!g.end_date) return null;
    try {
      const end = new Date(g.end_date);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return 0;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }

  // quick refresh
  async function refreshAll() {
    setRefreshing(true);
    await fetchGiveaways();
    setRefreshing(false);
    pushToast("Refreshed");
  }

  // UI: small spinner
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-3 justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Giveaways</h1>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-3 py-1 rounded-md border text-sm"
          >
            <RefreshCcw className="w-4 h-4" /> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            placeholder="Search title or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-64"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={openAddGiveaway} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Add Giveaway
          </button>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${t.kind === "error" ? "bg-red-600" : "bg-green-600"}`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-gray-500">Loading giveaways...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No giveaways match your filter.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const days = daysRemaining(g);
            const isActive = g.is_active ?? g.active ?? false;
            return (
              <div key={g.id} className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition relative">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{g.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{g.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {g.start_date ? new Date(g.start_date).toLocaleDateString() : "—"} {" → "} {g.end_date ? new Date(g.end_date).toLocaleDateString() : "—"}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      {days !== null && (
                        <span className="text-xs text-gray-500">• {days} day{days !== 1 ? "s" : ""} left</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEditGiveaway(g)} title="Edit" className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteGiveaway(g.id)} title="Delete" className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openPrizesModal(g)} title="View Prizes" className="px-3 py-1 rounded-md bg-blue-500 text-white text-sm">
                        <Gift className="w-4 h-4 inline-block mr-1" /> Prizes
                      </button>
                      <button onClick={() => duplicateGiveaway(g)} title="Duplicate" className="px-3 py-1 rounded-md bg-gray-100 text-sm">
                        <Duplicate className="w-4 h-4 inline-block mr-1" /> Duplicate
                      </button>
                      <button onClick={() => toggleActive(g)} title="Toggle Active" className="px-2 py-1 rounded-md border text-sm">
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Giveaway Modal */}
      {showGiveawayModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">{editingGiveaway ? "Edit Giveaway" : "Add Giveaway"}</h3>
            <div className="space-y-3">
              <input placeholder="Title" value={giveawayForm.title} onChange={(e) => setGiveawayForm((s) => ({ ...s, title: e.target.value }))} className="w-full border px-3 py-2 rounded-lg" />
              <textarea placeholder="Description" value={giveawayForm.description} onChange={(e) => setGiveawayForm((s) => ({ ...s, description: e.target.value }))} className="w-full border px-3 py-2 rounded-lg" />
              <div className="flex gap-2">
                <input type="date" value={giveawayForm.start_date} onChange={(e) => setGiveawayForm((s) => ({ ...s, start_date: e.target.value }))} className="w-1/2 border px-3 py-2 rounded-lg" />
                <input type="date" value={giveawayForm.end_date} onChange={(e) => setGiveawayForm((s) => ({ ...s, end_date: e.target.value }))} className="w-1/2 border px-3 py-2 rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowGiveawayModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveGiveaway} className="px-4 py-2 rounded-lg bg-orange-500 text-white">{savingGiveaway ? <Spinner /> : (editingGiveaway ? "Save" : "Create")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Prizes Modal */}
      {showPrizesModal && selectedGiveaway && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg p-6 relative">
            <button onClick={() => setShowPrizesModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">✖</button>
            <h3 className="text-xl font-semibold mb-3">Prizes — {selectedGiveaway.title}</h3>

            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">Manage prizes for this giveaway</div>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => { setPrizeForm({ id: "", title: "", description: "", value: "", rank: 1, imageFile: null, image_url: "" }); }} className="px-3 py-1 bg-green-600 text-white rounded-md">New Prize</button>
                </div>
              </div>
            </div>

            {prizesLoading ? <div>Loading prizes...</div> : (
              <div className="grid gap-3 mb-4">
                {prizes.length === 0 && <div className="text-gray-500">No prizes yet.</div>}
                {prizes.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {p.image_url ? <img src={p.image_url} alt={p.title} className="w-16 h-16 object-cover rounded-lg cursor-pointer" onClick={() => setLightboxUrl(p.image_url || null)} /> : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">🏆</div>}
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-sm text-gray-500">{p.description}</div>
                        <div className="text-xs text-gray-400">Rank: {p.rank ?? "—"} • Value: {p.value ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditPrize(p)} className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600">Edit</button>
                      <button onClick={() => deletePrize(p.id)} className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Prize form */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">{prizeForm.id ? "Edit Prize" : "Add Prize"}</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <input className="border px-3 py-2 rounded-lg md:col-span-2" placeholder="Title" value={prizeForm.title} onChange={(e) => setPrizeForm((s) => ({ ...s, title: e.target.value }))} />
                <input className="border px-3 py-2 rounded-lg" placeholder="Value" value={prizeForm.value} onChange={(e) => setPrizeForm((s) => ({ ...s, value: e.target.value }))} />

                <textarea className="border px-3 py-2 rounded-lg md:col-span-2" placeholder="Description" value={prizeForm.description} onChange={(e) => setPrizeForm((s) => ({ ...s, description: e.target.value }))} />
                <input type="number" className="border px-3 py-2 rounded-lg" placeholder="Rank" value={String(prizeForm.rank)} onChange={(e) => setPrizeForm((s) => ({ ...s, rank: Number(e.target.value) }))} />

                <div className="md:col-span-2 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <input type="file" accept="image/*" onChange={(e) => setPrizeForm((s) => ({ ...s, imageFile: e.target.files?.[0] || null }))} />
                    <span className="text-sm text-gray-600">{prizeForm.imageFile ? prizeForm.imageFile.name : "Upload image (optional)"}</span>
                  </label>

                  <button onClick={savePrizeFromModal} className="px-4 py-2 bg-orange-500 text-white rounded-lg">{uploadingImage ? <Spinner /> : (prizeForm.id ? "Save Prize" : "Add Prize")}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="preview" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}
