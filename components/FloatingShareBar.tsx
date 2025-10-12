"use client";
import { useState, useEffect, useRef } from "react";
import { Facebook, Twitter, Instagram, Linkedin, MessageCircle, Send, Share2 } from "lucide-react";

export default function FloatingShareBar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [reappearing, setReappearing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  const url = encodeURIComponent("https://solarizedng.vercel.app");
  const text = encodeURIComponent("Win with friends, Family & Others 🎉");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const shouldShow = docHeight > 0 && scrollPos / docHeight > 0.2;
      if (shouldShow && !visible) {
        setVisible(true); setInactive(false); setReappearing(true); setShowTooltip(true);
        setTimeout(() => setReappearing(false), 800);
        setTimeout(() => setShowTooltip(false), 4000);
      } else if (!shouldShow && visible) {
        setVisible(false); setOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const resetTimer = () => {
        setInactive(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setInactive(true), 10000);
      };
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("scroll", resetTimer);
      window.addEventListener("click", resetTimer);
      resetTimer();
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("scroll", resetTimer);
        window.removeEventListener("click", resetTimer);
      };
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !open) {
      tooltipTimer.current = setInterval(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }, 60000);
    }
    return () => { if (tooltipTimer.current) clearInterval(tooltipTimer.current); };
  }, [visible, open]);

  const platforms = [
    { name: "Facebook", icon: <Facebook className="w-5 h-5" />, link: `https://www.facebook.com/sharer/sharer.php?u=${url}`, color: "bg-[#1877F2]" },
    { name: "X", icon: <Twitter className="w-5 h-5" />, link: `https://twitter.com/intent/tweet?url=${url}&text=${text}`, color: "bg-black" },
    { name: "Instagram", icon: <Instagram className="w-5 h-5" />, link: `https://www.instagram.com/?url=${url}`, color: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
    { name: "WhatsApp", icon: <MessageCircle className="w-5 h-5" />, link: `https://wa.me/?text=${text}%20${url}`, color: "bg-[#25D366]" },
    { name: "Telegram", icon: <Send className="w-5 h-5" />, link: `https://t.me/share/url?url=${url}&text=${text}`, color: "bg-[#0088cc]" },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, link: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, color: "bg-[#0077B5]" },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-center transition-all duration-500 ease-in-out ${visible && !inactive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"} ${reappearing ? "animate-[bounce_0.8s_ease] drop-shadow-[0_0_12px_#f97316]" : ""}`} style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {open && platforms.map((p) => (
        <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex items-center justify-center shadow-md hover:scale-110 transition ${p.color}`} title={`Share on ${p.name}`}>
          {p.icon}
        </a>
      ))}

      <button onClick={() => setOpen(!open)} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition ${reappearing ? "animate-[pulse_1.5s_ease-in-out]" : "animate-[bounce_1.2s_ease-in-out]"}`} aria-label="Share">
        <Share2 className="w-6 h-6" />
      </button>

      {showTooltip && !open && <div className="absolute -top-10 text-xs bg-orange-600 text-white px-3 py-1 rounded-full shadow-md animate-fadeOut">🔗 Share Now!</div>}
    </div>
  );
}
