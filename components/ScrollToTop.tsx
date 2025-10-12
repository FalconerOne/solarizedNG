"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed z-40 rounded-full bg-orange-500 text-white shadow-lg transition-all duration-300 flex items-center justify-center 
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"} 
        hover:bg-orange-600 active:scale-95
        right-6 md:right-8
        bottom-24 sm:bottom-28  /* 👈 pushes it above the share bar */
        w-10 h-10 sm:w-12 sm:h-12
        font-[Segoe_UI]
      `}
    >
      <ArrowUp size={22} />
    </button>
  );
}
