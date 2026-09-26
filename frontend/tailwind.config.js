/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fbfaf7',
          100: '#f7f4ee',
          200: '#f1ebdF',
          300: '#e7ddce',
          400: '#d7c7b2',
        },
        clay: {
          50: '#fbf3f0',
          100: '#f6e4de',
          200: '#edc8bc',
          300: '#dfa390',
          400: '#d37d64',
          500: '#d36d4e', // Primary terracotta
          600: '#c25838',
          700: '#a24429',
        },
        sage: {
          50: '#f2f7f4',
          100: '#e3ece6',
          200: '#c5d9cd',
          300: '#9dbfa9',
          400: '#6fa081',
          500: '#3e6b5c', // Primary sage green
          600: '#2f5549',
          700: '#26453c',
        },
        ochre: {
          50: '#fdf9f2',
          100: '#fbf1e2',
          200: '#f5dfbe',
          300: '#edc994',
          400: '#e4b16c',
          500: '#df9e52', // Warm sun ochre
          600: '#c58139',
        },
        ink: {
          50: '#f6f7f8',
          100: '#eceff1',
          200: '#d5dbdf',
          300: '#b1bcc4',
          400: '#8797a3',
          500: '#647482',
          600: '#4e5b67',
          700: '#3f4a54',
          800: '#2a333b',
          900: '#182026', // Charcoal black
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(80, 60, 40, 0.04), 0 1px 3px -1px rgba(80, 60, 40, 0.02)',
        'soft-md': '0 4px 16px -2px rgba(80, 60, 40, 0.06), 0 2px 6px -1px rgba(80, 60, 40, 0.03)',
        'soft-lg': '0 10px 25px -4px rgba(80, 60, 40, 0.08), 0 4px 10px -2px rgba(80, 60, 40, 0.04)',
      }
    },
  },
  plugins: [],
}
