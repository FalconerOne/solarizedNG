"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/config/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface Banner {
  id: string;
  platform: "mygiveaway" | "skilllink";
  message: string;
  url: string;
  active: boolean;
  created_at: string;
}

export default function AdminBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({
    platform: "mygiveaway",
    message: "",
    url: "",
  });

  // 🔹 Fetch banners
  async function loadBanners() {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Error loading banners", description: error.message });
      return;
    }

    setBanners(data || []);
    setLoading(false);
  }

  // 🔹 Realtime updates
  useEffect(() => {
    loadBanners();

    const channel = supabase
      .channel("banners-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, loadBanners)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔹 Add banner
  async function addBanner() {
    if (!newBanner.message || !newBanner.url) {
      toast({ title: "Message and URL required" });
      return;
    }

    const { error } = await supabase.from("banners").insert({
      platform: newBanner.platform,
      message: newBanner.message,
      url: newBanner.url,
      active: true,
    });

    if (error) {
      toast({ title: "Error adding banner", description: error.message });
      return;
    }

    toast({ title: "✅ Banner added successfully" });
    setNewBanner({ platform: "mygiveaway", message: "", url: "" });
  }

  // 🔹 Toggle banner active state
  async function toggleActive(bannerId: string, active: boolean) {
    const { error } = await supabase
      .from("banners")
      .update({ active })
      .eq("id", bannerId);

    if (error) toast({ title: "Error updating banner", description: error.message });
  }

  // 🔹 Delete banner
  async function deleteBanner(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting banner", description: error.message });
    } else {
      toast({ title: "Banner deleted successfully" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-700">🪧 Add New Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <select
              value={newBanner.platform}
              onChange={(e) =>
                setNewBanner({ ...newBanner, platform: e.target.value as "mygiveaway" | "skilllink" })
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="mygiveaway">MyGiveAway.ng</option>
              <option value="skilllink">SkillLinkAfrica.ng</option>
            </select>

            <Input
              placeholder="Banner message..."
              value={newBanner.message}
              onChange={(e) => setNewBanner({ ...newBanner, message: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="Target URL..."
              value={newBanner.url}
              onChange={(e) => setNewBanner({ ...newBanner, url: e.target.value })}
              className="flex-1"
            />

            <Button onClick={addBanner} className="bg-indigo-600 text-white">
              Add Banner
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Active Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Loading banners...</p>
          ) : banners.length === 0 ? (
            <p className="text-gray-500">No banners available</p>
          ) : (
            banners.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{b.message}</p>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm">
                    {b.url}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    {b.platform === "mygiveaway" ? "🎁 MyGiveAway" : "🚀 SkillLinkAfrica"} •{" "}
                    {new Date(b.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <Switch
                    checked={b.active}
                    onCheckedChange={(checked) => toggleActive(b.id, checked)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBanner(b.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
