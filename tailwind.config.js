const fs = require("fs");

// Safely read hugo_stats.json — only exists after first `hugo` run
let hugoStats = "";
try {
  hugoStats = fs.readFileSync("./hugo_stats.json", "utf8");
} catch (_) {}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.{html,md}",
    "./assets/**/*.js",
    ...(hugoStats ? [{ raw: hugoStats, extension: "html" }] : []),
  ],
  safelist: [
    // Neobrutalism hard-shadow arbitrary values
    "shadow-[4px_4px_0_0_#000]",
    "shadow-[6px_6px_0_0_#000]",
    "shadow-[2px_2px_0_0_#000]",
    "shadow-[3px_3px_0_0_#000]",
    "-translate-y-1",
    "-translate-y-0.5",
    "translate-x-[1px]",
    "translate-y-[1px]",
    "shadow-[1px_1px_0_0_#000]",
  ],
  theme: {
    extend: {
      colors: {
        "nb-yellow": "#FFE000",
        "nb-blue":   "#90e0ff",
        "nb-green":  "#98f0ab",
        "nb-pink":   "#ff99e6",
        "nb-purple": "#c4a1ff",
        "nb-black":  "#000000",
        "nb-white":  "#FFFCF0",
      },
      boxShadow: {
        nb:    "4px 4px 0 0 #000",
        "nb-lg": "6px 6px 0 0 #000",
        "nb-sm": "2px 2px 0 0 #000",
      },
      fontFamily: {
        heading: ["Syne", "system-ui", "sans-serif"],
        mono:    ['"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        "scroll-x": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "nb-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.35", transform: "scale(0.75)" },
        },
      },
      animation: {
        "scroll-x": "scroll-x 24s linear infinite",
        "nb-pulse": "nb-pulse 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          primary:           "#FFE000",
          "primary-content": "#000000",
          secondary:         "#c4a1ff",
          "secondary-content": "#000000",
          accent:            "#98f0ab",
          "accent-content":  "#000000",
          neutral:           "#000000",
          "neutral-content": "#FFFCF0",
          "base-100":        "#FFFCF0",
          "base-200":        "#f5f5e8",
          "base-300":        "#e8e8d8",
          "base-content":    "#000000",
          info:              "#90e0ff",
          success:           "#98f0ab",
          warning:           "#FFE000",
          error:             "#ff6b6b",
        },
      },
    ],
  },
};
