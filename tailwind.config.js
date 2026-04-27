/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F3EEFB",
          100: "#E4DCF4",
          200: "#C3B6E1",
          300: "#9A88C3",
          400: "#6F5E9E",
          500: "#4B3F77",
          600: "#2E2650",
          700: "#1C1732",
          800: "#110E22",
          900: "#0A0815",
        },
        rose: {
          soft: "#F8C8D5",
          softer: "#FADCE3",
          deep: "#E8A6B6",
        },
        lilac: {
          soft: "#D7C6F5",
          softer: "#E6DAFB",
          deep: "#B89AEB",
        },
        mint: {
          soft: "#C8E9D9",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(184, 154, 235, 0.35)",
        glowRose: "0 10px 40px -10px rgba(232, 166, 182, 0.4)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        floatUp: {
          "0%": { opacity: 0, transform: "translateY(8px) scale(0.9)" },
          "20%": { opacity: 1, transform: "translateY(-6px) scale(1)" },
          "100%": { opacity: 0, transform: "translateY(-44px) scale(1)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        pop: "pop 450ms ease-out",
        floatUp: "floatUp 1300ms ease-out forwards",
        shake: "shake 350ms ease-in-out",
        fadeIn: "fadeIn 400ms ease-out both",
        scaleIn: "scaleIn 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
