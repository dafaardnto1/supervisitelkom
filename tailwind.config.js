/** @type {import('tailwindcss').Config} */
export default {
  // Pastikan pakai 'class', bukan 'media'
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}