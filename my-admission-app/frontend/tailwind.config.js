/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // New, uplifting base colors
        cream: "#FDFCF9",
        "cream-2": "#F7F5F0",
        "cream-3": "#F0ECE3",
        ink: "#1A1D1F",
        "ink-2": "#3B3F42",
        "ink-3": "#6C7278",
        "ink-4": "#B1B6BC",
        white: "#FFFFFF",

        // Brighter, more vibrant accents
        clay: "#FF8C5A",      // warm, energetic orange
        "clay-l": "#FFE4D6",
        "clay-d": "#D45A2A",
        mint: "#47D7AC",      // fresh, success green
        "mint-l": "#E0F9F0",
        "mint-d": "#1F8A6B",
        lav: "#B194F0",       // soft, uplifting purple
        "lav-l": "#F0E9FF",
        "lav-d": "#7557C6",
        yell: "#FFD966",      // warm yellow (moments)
        "yell-l": "#FFF4DF",
        "yell-d": "#CC9C28",
        blue: "#5BA3F5",      // clear, confident blue
        "blue-l": "#E1F0FF",
        "blue-d": "#2E6DC4",

        // Section accents (still distinct but happier)
        colHome: "#B194F0",
        colRoadmap: "#5BA3F5",
        colChat: "#FFA5C0",
        colCompass: "#47D7AC",
        colProfile: "#FFD966",
      },
      fontFamily: {
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        pill: "100px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        md: "0 8px 24px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.02)",
        lg: "0 16px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.02)",
        xl: "0 24px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.04)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 20px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) both",
        "slide-in": "slideIn 0.3s ease both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow": "spin 1.2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};