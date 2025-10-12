/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "orange-brand": {
          DEFAULT: "#ff6600",
          light: "#ffa366",
          dark: "#cc5200",
        },
      },
      keyframes: {
        fadeSlideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeSlideDown: "fadeSlideDown 0.7s ease-in-out",
      },
      fontFamily: {
        segoe: ["'Segoe UI'", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(255, 102, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
