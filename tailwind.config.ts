import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0d9488", // teal-600 — the single accent color
          dark: "#0f766e", // teal-700
        },
        home: {
          ink: "#141311",
          "ink-soft": "#3A3832",
          muted: "#6B6860",
          paper: "#F6F3EC",
          "paper-2": "#EEEAE1",
          cream: "#E7E1D4",
          white: "#FFFcf7",
          pdf: "#C45C26",
          "pdf-soft": "#F3D7C4",
          md: "#0F6E56",
          "md-bright": "#1AA37A",
          "md-soft": "#D3EDE4",
          dark: "#0C0E0D",
          "dark-2": "#151917",
          "dark-3": "#1C221F",
          "dark-text": "#EDEAE3",
          "dark-muted": "#A8A59C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
        "home-sans": [
          "var(--font-home-sans)",
          "var(--font-home-sans-sc)",
          ...defaultTheme.fontFamily.sans,
        ],
        "home-serif": [
          "var(--font-home-serif)",
          "var(--font-home-serif-sc)",
          ...defaultTheme.fontFamily.serif,
        ],
        "home-mono": [
          "var(--font-home-mono)",
          ...defaultTheme.fontFamily.mono,
        ],
      },
      boxShadow: {
        home: "0 24px 60px rgba(20, 19, 17, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
