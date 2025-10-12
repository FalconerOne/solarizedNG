"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Copy,
} from "lucide-react";

export default function FloatingShareBar() {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const message = encodeURIComponent("🎉 Check out this giveaway!");

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${message}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      icon: Twitter,
      color: "bg-gray-900 hover:bg-gray-800",
      url: `https://x.com/intent/tweet?text=${message}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${message}`,
    },
  ];

  return (
    <motion.div
      className="fixed bottom-5 left-5 flex flex-col gap-3 z-50"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {shareLinks.map((link) => {
        const Icon = link.icon;
        return (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full shadow-md text-white transition ${link.color}`}
            title={`Share on ${link.name}`}
          >
            <Icon className="w-5 h-5" />
          </motion.a>
        );
      })}
      <motion.button
        onClick={() => navigator.clipboard.writeText(shareUrl)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="p-3 rounded-full shadow-md bg-gray-500 hover:bg-gray-600 text-white transition"
        title="Copy link"
      >
        <Copy className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
