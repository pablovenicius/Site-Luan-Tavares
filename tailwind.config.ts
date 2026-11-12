import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1013",
        "ink-alt": "#13161A",
        "ink-card": "#171A1F",
        "ink-deep": "#0A0B0D",
        lime: { DEFAULT: "#A8FF1F", dark: "#5FE31B", soft: "#C8FF6B" },
        onlime: "#0E1209",
        fg: { DEFAULT: "#F4F6F7", muted: "#B9BEC4", subtle: "#8B9199", faint: "#646A72" },
        danger: "#FF6B6B",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "word-up": {
          from: { opacity: "0", transform: "translateY(60%) rotate(2deg)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "none" },
        },
        "wa-pulse": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(95,227,27,.35)" },
          "50%": { boxShadow: "0 0 0 14px rgba(95,227,27,0)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
        "word-up": "word-up .9s cubic-bezier(.2,.8,.2,1) both",
        "fade-up": "fade-up .9s cubic-bezier(.2,.8,.2,1) both",
        "wa-pulse": "wa-pulse 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
