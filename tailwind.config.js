/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'media' crashes NativeWind's web runtime; on web the class is synced to the OS in src/app/_layout.tsx.
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
