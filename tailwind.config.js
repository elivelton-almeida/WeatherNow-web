/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fall: 'fall 2s linear infinite',
        'fall-slow': 'fall-slow 8s linear infinite',
        cloud: 'cloud 60s linear infinite',
        pulse: 'pulse 4s ease-in-out infinite',
        flash: 'flash 0.3s ease-in-out infinite', // nova animação para relâmpago
      },
      keyframes: {
        fall: {
          '0%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'fall-slow': {
          '0%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        cloud: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(150%)' },
        },
        pulse: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        flash: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};