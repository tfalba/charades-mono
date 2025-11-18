/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: { 800: "#0D4650" },
        brand: { primary: "#007469", accent: "#DCF940" }
      },
      borderRadius: { "2xl": "1rem" }
    }
  },
  plugins: []
}
