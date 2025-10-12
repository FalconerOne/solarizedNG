"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, X } from "lucide-react";

export default function FloatingShareBar() {
  const [open, setOpen] = useState(false);
  const url = "https://solarizedng.vercel.app";
  const message = encodeURIComponent("Win with friends, Family & Others 🎉");
  const shareUrl = encodeURIComponent(url);

  const socials = [
    {
      name: "Facebook",
      color: "bg-blue-600 hover:bg-blue-700",
      link: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    },
    {
      name: "X (Twitter)",
      color: "bg-black hover:bg-gray-800",
      link: `https://twitter.com/intent/tweet?text=${message}&url=${shareUrl}`,
    },
    {
      name: "Instagram",
      color: "bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:opacity-90",
      link: `https://www.instagram.com/`,
    },
    {
      name: "WhatsApp",
      color: "bg-green-500 hover:bg-green-600",
      link: `https://api.whatsapp.com/send?text=${message}%20${shareUrl}`,
    },
    {
      name: "LinkedIn",
      color: "bg-blue-700 hover:bg-blue-800",
      link: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${message}`,
    },
    {
      name: "Telegram",
      color: "bg-sky-500 hover:bg-sky-600",
      link: `https://t.me/share/url?url=${shareUrl}&text=${message}`,
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 font-[Segoe UI]">
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 items-start"
        >
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg transition ${s.color}`}
            >
              {s.name}
            </a>
          ))}

          <button
            onClick={() => setOpen(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-full shadow-md mt-2"
          >
            <X size={18} />
          </button>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <Share2 size={22} />
        </motion.button>
      )}
    </div>
  );
}
