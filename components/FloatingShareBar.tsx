"use client";
import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";

export default function FloatingShareBar() {
  const [open, setOpen] = useState(false);
  const url = encodeURIComponent("https://solarizedng.vercel.app");
  const text = encodeURIComponent("Win with friends, Family & Others 🎉");

  const platforms = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      link: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      color: "bg-[#1877F2]",
    },
    {
      name: "X",
      icon: <Twitter className="w-5 h-5" />,
      link: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      color: "bg-black",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      link: `https://www.instagram.com/?url=${url}`,
      color: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      link: `https://wa.me/?text=${text}%20${url}`,
      color: "bg-[#25D366]",
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      link: `https://t.me/share/url?url=${url}&text=${text}`,
      color: "bg-[#0088cc]",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      color: "bg-[#0077B5]",
    },
  ];

  return (
    <div
      className={`floating-share-btn fixed bottom-6 right-6 z-50 flex flex-col items-center ${
        open ? "gap-3" : ""
      } animate-[bounce_1.2s_ease-in-out]`}
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* Social icons */}
      {open &&
        platforms.map((p) => (
          <a
            key={p.name}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex items-center justify-center shadow-md hover:scale-110 transition ${p.color}`}
            title={`Share on ${p.name}`}
          >
            {p.icon}
          </a>
        ))}

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="floating-share-btn w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition"
        aria-label="Share"
      >
        <Share2 className="w-6 h-6" />
      </button>

      {/* Tooltip */}
      {!open && (
        <div className="absolute -top-10 text-xs bg-orange-600 text-white px-3 py-1 rounded-full shadow-md animate-pulse">
          🔗 Share Now!
        </div>
      )}
    </div>
  );
}
