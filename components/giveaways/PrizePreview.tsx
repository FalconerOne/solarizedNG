"use client";

import { motion } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function PrizePreview({ mediaUrl, title }: { mediaUrl: string; title: string }) {
  if (!mediaUrl) return null;

  const isVideo = mediaUrl.endsWith(".mp4") || mediaUrl.includes("video");

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      {isVideo ? (
        <motion.video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-64 object-cover rounded-xl"
          whileHover={{ scale: 1.05 }}
        />
      ) : (
        <Zoom>
          <motion.img
            src={mediaUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-xl cursor-pointer"
            whileHover={{ scale: 1.03 }}
          />
        </Zoom>
      )}
      <div className="absolute bottom-2 right-3 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded-lg shadow">
        {isVideo ? "🎥 Video Preview" : "🖼️ Image Preview"}
      </div>
    </div>
  );
}
