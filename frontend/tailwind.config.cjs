/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f6ff",
          500: "#6366f1",
          600: "#4f46e5"
        }
      }
    },
  },
  plugins: [],
}
