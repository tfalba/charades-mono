/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: { 800: "#0D4650" },
        brand: { primary: "#007469", accent: "#DCF940" },
        topic: {
          movies: "#F97316",
          books: "#8B5CF6",
          songs: "#0EA5E9",
          "tv-shows": "#FACC15",
          people: "#EC4899",
          places: "#22C55E",
          things: "#64748B"
        }
      },
      borderRadius: { "2xl": "1rem" }
    }
  },
  plugins: []
}
