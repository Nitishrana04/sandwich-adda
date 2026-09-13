/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Original Vibrant Sandwich Adda Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sandwich: {
          crust: '#8B4513',
          warm: '#F59E0B',
          orange: '#F97316',
          bg: '#FAFAF9',
        }
      },
    },
  },
  plugins: [],
}
