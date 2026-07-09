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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        crystal: {
          ink: "#302b28",
          muted: "#766c66",
          blush: "#f7e7e1",
          rose: "#c8897d",
          gold: "#b9975b",
          champagne: "#efe3c8",
          sage: "#8ca192",
          moss: "#667d69",
          cream: "#fffaf6",
          pearl: "#f6f1ec",
          line: "#eadbd4"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(90, 65, 55, 0.11)",
        glow: "0 0 40px rgba(200, 137, 125, 0.22)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans TC", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"]
      },
      keyframes: {
        "shiny-text": {
          "0%, 90%, 100%": {
            backgroundPosition: "calc(-100% - var(--shiny-width)) 0"
          },
          "30%, 60%": {
            backgroundPosition: "calc(100% + var(--shiny-width)) 0"
          }
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)"
          }
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)"
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)"
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)"
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)"
          }
        }
      },
      animation: {
        "shiny-text": "shiny-text 8s infinite",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear"
      },
      ringWidth: {
        3: "3px"
      }
    }
  },
  plugins: []
};

export default config;
