// Mirror of tailwind.config.js colors, for places where className can't be
// used (gradients, icon colors, shadows). Keep both files in sync.
export const colors = {
  ink: { 900: "#0E1524", 800: "#141D31", 700: "#1C2842", 600: "#2A3A5C" },
  sky: { 300: "#A9C8EE", 400: "#8FB8E8", 500: "#6FA0DB" },
  gold: { 300: "#F1DDA0", 400: "#E8CB7A", 500: "#D9B650" },
  mist: { 100: "#E8EEF8", 300: "#9AA9C4", 500: "#6B7A96" },
} as const;
