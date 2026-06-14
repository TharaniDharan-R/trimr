/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6366F1",
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        textMain: "#111827",
        textSub: "#6B7280",
        borderMain: "#E5E7EB",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.01)",
        premiumHover: "0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.02)",
      }
    },
  },
  plugins: [],
}
