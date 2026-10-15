/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '20%': { transform: 'translate(-2px, 2px) rotate(-1deg)' },
          '40%': { transform: 'translate(-2px, -2px) rotate(1deg)' },
          '60%': { transform: 'translate(2px, 2px) rotate(0deg)' },
          '80%': { transform: 'translate(2px, -2px) rotate(1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.8))' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(56, 189, 248, 1))' },
        }
      },
      animation: {
        'vibe-intense': 'vibrate 0.15s linear infinite',
        'vibe-subtle': 'vibrate 0.4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}