/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13b6ec",
        "background-light": "#f6f8f8",
        "background-dark": "#101d22",
        "surface-dark": "#192d33",
        "border-dark": "#325a67",
        "text-primary-dark": "#ffffff",
        "text-secondary-dark": "#92bbc9",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [],
}
