// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cream': '#F4F1E9',
        'sidebar': '#E4DED3',
        'terracotta': '#A0522D',
        'terracotta-hover': '#8B4513',
        'ink': '#3D352E',
        'muted-ink': '#857E75',
        'border-color': '#D1C7BC',
      },
      fontFamily: {
        'figtree': ['"Figtree"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}