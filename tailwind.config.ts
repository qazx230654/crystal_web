import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        crystal: {
          ink: "#302b28",
          muted: "#766c66",
          blush: "#f7e7e1",
          rose: "#c8897d",
          sage: "#8ca192",
          moss: "#667d69",
          cream: "#fffaf6",
          pearl: "#f6f1ec",
          line: "#eadbd4"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(90, 65, 55, 0.11)",
        glow: "0 0 40px rgba(200, 137, 125, 0.22)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans TC", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
