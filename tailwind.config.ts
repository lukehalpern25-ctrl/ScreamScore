import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        "card-bg": "#1A1A1A",
      },
      backgroundImage: {
        "gradient-orange": "linear-gradient(to right, #FF6B35, #FFA500)",
        "gradient-orange-hover": "linear-gradient(to right, #FF7B45, #FFB020)",
      },
    },
  },
  plugins: [],
};
export default config;
