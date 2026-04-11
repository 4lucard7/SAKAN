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
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          700: '#1d4ed8',
        },
        sky: {
          500: '#0EA5E9',
          600: '#0284C7',
        },
        sakan: {
          DEFAULT: '#25D1F4',
          blue: '#25D1F4',
          hover: '#1abddf',
        },
      },
      boxShadow: {
        hover: '0 24px 48px rgba(15, 23, 42, 0.08)',
        card: '0 20px 54px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
