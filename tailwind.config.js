/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        renfe: {
          purple: '#6B2D5C',
          lightPurple: '#8E3F7D',
          darkPurple: '#4A1D3F',
          red: '#E20613',
          blue: '#005CA9',
          navy: '#1A2952',
          c4: '#005CA9', // C4 official blue
          c4dark: '#003D73'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
