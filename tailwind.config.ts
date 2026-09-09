import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6f8",
          100: "#e6ebf0",
          200: "#c5d0db",
          300: "#90a4b8",
          400: "#5c7690",
          500: "#3d5670",
          600: "#2c4056",
          700: "#1e2f42",
          800: "#152433",
          900: "#0e1a26",
          950: "#081018",
        },
        crimson: {
          50: "#fdf4f4",
          100: "#fbe8e8",
          500: "#9b2335",
          600: "#821d2c",
          700: "#6a1824",
        },
        paper: "#f7f4ef",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "46rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
