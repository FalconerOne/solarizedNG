"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 400);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-700 ease-in-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
      <button onClick={scrollToTop} aria-label="Scroll to top" className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all duration-300 animate-[pulse_12s_ease-in-out_infinite]">
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}
