/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
],
  ],
  theme: {
    extend: {
      colors: {
        // 🧡 SolarizedNG Brand Palette
        "orange-brand": {
          DEFAULT: "#ff6600",   // primary orange
          light: "#ffa366",     // hover / accent tone
          dark: "#cc5200",      // deep variant
        },
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
