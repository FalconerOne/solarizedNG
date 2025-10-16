// File: components/ui/ProgressBar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProgressBarProps {
  isActive: boolean;
}

export default function ProgressBar({ isActive }: ProgressBarProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="progress-bar"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[9999]"
        />
      )}
    </AnimatePresence>
  );
}


// File: components/ui/ProgressBarProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProgressBar from "./ProgressBar";

/**
 * Tracks route changes or background activity (like sync, load, or navigation)
 * and displays a smooth progress bar at the top of the app.
 */
export default function ProgressBarProvider() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    setIsActive(true);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, 1800); // 1.8s fade-out after navigation

    return () => clearTimeout(timer);
  }, [pathname]);

  return <ProgressBar isActive={isActive} />;
}
