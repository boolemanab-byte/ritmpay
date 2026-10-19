/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark slate backgrounds (never pure black)
        ink: { 900: "#0E1524", 800: "#141D31", 700: "#1C2842", 600: "#2A3A5C" },
        // Soft pastel blue
        sky: { 300: "#A9C8EE", 400: "#8FB8E8", 500: "#6FA0DB" },
        // Soft gold
        gold: { 300: "#F1DDA0", 400: "#E8CB7A", 500: "#D9B650" },
        // Text
        mist: { 100: "#E8EEF8", 300: "#9AA9C4", 500: "#6B7A96" },
      },
    },
  },
  plugins: [],
};