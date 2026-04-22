import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["DM Mono", "JetBrains Mono", "monospace"],
      },
      colors: {
        dark: {
          900: "#030712",
          800: "#060b18",
          700: "#0a1020",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
