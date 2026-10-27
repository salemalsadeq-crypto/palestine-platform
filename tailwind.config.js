/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#061325',
          900: '#0a223e',
          800: '#123b68',
          700: '#1d5494',
        },
        palestine: {
          green: '#007A3D',
          red: '#E4312B',
          black: '#000000',
        },
        gold: '#d4af37',
      }
    },
  },
  plugins: [],
}
