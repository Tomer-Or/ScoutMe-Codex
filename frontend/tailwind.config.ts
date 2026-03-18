import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F6A4A",
          secondary: "#1F2937",
          accent: "#2ECC71",
          background: "#F4F7F2",
          border: "#D8E2DC",
          text: "#0F172A",
          hover: "#F8FBF8"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "pitch-grid": "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
