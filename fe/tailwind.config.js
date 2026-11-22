/** Tema SIBER EVIDENCE — disalin dari prototipe (index.html / ui-components.html). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f3f6fb', 100: '#e4eaf4', 200: '#c5d3e8', 300: '#9db3d4', 400: '#6f8cbb',
          500: '#4c6ba3', 600: '#375388', 700: '#2c436e', 800: '#172B4D', 900: '#122138', 950: '#0c1626',
        },
      },
      fontFamily: { sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px 0 rgb(23 43 77 / 0.05), 0 1px 3px 0 rgb(23 43 77 / 0.06)' },
    },
  },
  plugins: [],
};
