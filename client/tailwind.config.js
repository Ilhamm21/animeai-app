/** @type {import('tailwindcss').Config} */

const path = require('path');

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Inter"', 'sans-serif']
    },
    extend: {
      backgroundImage: {
        'custom-light': `url('${path.resolve(__dirname, './src/assets/bg-light.png')}')`,
        'custom-dark': `url('${path.resolve(__dirname, './src/Assets/bg-dark.png')}')`,
      },
    },
  },
  plugins: [],
  important: '#root'
}