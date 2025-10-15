"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

interface Props {
  giveawayId: string;
  onUploaded?: () => void;
}

export default function PrizeMediaUpload({ giveawayId, onUploaded }: Props) {
  const supabase = createClientComponentClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large! Limit is 50 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const isVideo = file.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const filePath = `${folder}/${giveawayId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("giveaway-media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      setError("Upload failed.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("giveaway-media").getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("giveaways")
      .update(isVideo ? { video_url: publicUrl } : { image_url: publicUrl })
      .eq("id", giveawayId);

    if (dbError) {
      console.error(dbError);
      setError("Database update failed.");
    }

    setUploading(false);
    if (onUploaded) onUploaded();
  };

  return (
    <div className="border border-gray-200 p-4 rounded-xl mt-4 bg-white shadow-sm">
      <p className="text-sm text-gray-600 mb-2">
        Upload prize media (image or video up to 50 MB)
      </p>

      <label className="flex items-center gap-2 cursor-pointer">
        <Upload className="w-4 h-4 text-indigo-600" />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <span className="text-indigo-700 font-medium hover:underline">
          Choose File
        </span>
      </label>

      {uploading && (
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <Loader2 className="animate-spin w-4 h-4 mr-2" />
          Uploading...
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
