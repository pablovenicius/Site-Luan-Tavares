import type { Config } from "tailwindcss";

// Paleta extraída 1:1 do design original (Luan Tavares – Personal Trainer).
// Mantida como tokens nomeados para facilitar reuso e futura customização.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171C", // fundo base
        "ink-alt": "#171B21", // fundo de seções alternadas
        "ink-card": "#1B1F26", // fundo de cards
        "ink-deep": "#101318", // fundo do rodapé
        lime: {
          DEFAULT: "#A8FF1F",
          dark: "#5FE31B",
          soft: "#C8FF6B",
        },
        onlime: "#11140F", // texto sobre fundo lima
        fg: {
          DEFAULT: "#F2F4F5",
          muted: "#B8BDC2",
          subtle: "#8A9099",
          faint: "#6E747C",
        },
        danger: "#FF6B6B",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "wa-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(95,227,27,.35)" },
          "50%": { boxShadow: "0 0 0 14px rgba(95,227,27,0)" },
        },
      },
      animation: {
        "wa-pulse": "wa-pulse 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
