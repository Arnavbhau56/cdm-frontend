/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        bg:       '#0e0f11',
        surface:  '#16181c',
        surface2: '#1e2128',
        border:   '#2a2d35',
        accent:   '#f0c040',
      },
    },
  },
  plugins: [],
};
