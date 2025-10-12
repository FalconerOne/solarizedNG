import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Smooth scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-40 rounded-full bg-orange-500 text-white shadow-lg transition-all duration-300 flex items-center justify-center 
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"} 
        hover:bg-orange-600 active:scale-95
        bottom-6 right-6 md:bottom-8 md:right-8
        w-12 h-12 md:w-14 md:h-14
        font-[Segoe_UI]
      `}
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} />
    </button>
  );
}
