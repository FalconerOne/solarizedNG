"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newPartner, setNewPartner] = useState({
    name: "",
    website_url: "",
    logoFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all partners
  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    const { data, error } = await supabase
      .from("partners")
      .select("id, name, logo_url, website_url")
      .order("created_at", { ascending: true });

    if (error) console.error("Fetch error:", error);
    else setPartners(data || []);
  }

  // Upload logo and add new partner
  async function addPartner() {
    try {
      if (!newPartner.name || !newPartner.logoFile)
        return alert("Please add a name and select a logo");

      setLoading(true);

      // Upload to Supabase storage
      const filePath = `partners/${Date.now()}-${newPartner.logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("partners")
        .upload(filePath, newPartner.logoFile);

      if (uploadError) throw uploadError;

      const { data: publicURL } = supabase.storage
        .from("partners")
        .getPublicUrl(filePath);

      // Insert into DB
      const { error: insertError } = await supabase.from("partners").insert([
        {
          name: newPartner.name,
          website_url: newPartner.website_url,
          logo_url: publicURL.publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      setNewPartner({ name: "", website_url: "", logoFile: null });
      fetchPartners();
      alert("Partner added successfully!");
    } catch (err: any) {
      console.error(err.message);
      alert("Error adding partner: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Delete a partner
  async function deletePartner(id: string) {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) console.error("Delete error:", error);
    else {
      alert("Partner deleted");
      fetchPartners();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Dashboard – Partners Management
        </h1>

        {/* Add Partner Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Add New Partner</h2>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="Partner Name"
              value={newPartner.name}
              onChange={(e) =>
                setNewPartner({ ...newPartner, name: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-2 flex-1"
            />
            <input
              type="text"
              placeholder="Website URL"
              value={newPartner.website_url}
              onChange={(e) =>
                setNewPartner({ ...newPartner, website_url: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-2 flex-1"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewPartner({
                  ...newPartner,
                  logoFile: e.target.files?.[0] || null,
                })
              }
              className="border border-gray-300 rounded-lg p-2"
            />
            <Button
              onClick={addPartner}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Saving..." : "Add Partner"}
            </Button>
          </div>
        </div>

        {/* Partners List */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Existing Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {partners.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-lg p-3 flex flex-col items-center shadow-sm"
              >
                <div className="relative w-[100px] h-[60px] mb-2">
                  <Image
                    src={p.logo_url}
                    alt={p.name}
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
                <p className="text-sm font-medium">{p.name}</p>
                <a
                  href={p.website_url}
                  target="_blank"
                  className="text-xs text-blue-500 hover:underline"
                >
                  {p.website_url || "No URL"}
                </a>
                <button
                  onClick={() => deletePartner(p.id)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
