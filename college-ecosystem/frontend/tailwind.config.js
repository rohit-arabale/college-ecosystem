/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50: "#fdf2ff",
          100: "#fae5ff",
          200: "#f3ccff",
          300: "#e9a3ff",
          400: "#d965fe",
          500: "#c53ef7",
          600: "#a81cd4",
          700: "#8c17ad",
          800: "#74198d",
          900: "#5f1972",
        },
        accent: {
          yellow: "#FFD60A",
          cyan: "#00D2FF",
          orange: "#FF6B35",
          green: "#00C896",
        },
        dark: {
          900: "#0A0A0F",
          800: "#111118",
          700: "#1A1A24",
          600: "#22222E",
          500: "#2D2D3D",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
        pulse_slow: "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(-20px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
