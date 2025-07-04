/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        soyuz: ['"Soyuz Grotesk"', 'sans-serif'],
      },
      colors: {
        gold: '#FFD700',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
      },
      transitionDuration: {
        '4000': '4000ms',
        '6000': '6000ms',
        '10000': '10000ms',
      }
    },
  },
  plugins: [],
  darkMode: 'class', // можно убрать, если не используешь
};