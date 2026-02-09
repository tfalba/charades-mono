/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          primary: "#FF3B30",
          secondary: "#00C2FF",
          accent: "#FEE440",
          bg: "#0B0D17",
          surface: "#141833",
          "surface-2": "#1B2145",
          text: "#F7F7FB",
          muted: "#B7BED6",
          border: "#262C4D"
        },
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
      borderRadius: { "2xl": "1rem" },
      fontFamily: {
        display: ["\"Bricolage Grotesque\"", "system-ui", "sans-serif"],
        body: ["\"Plus Jakarta Sans\"", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}
