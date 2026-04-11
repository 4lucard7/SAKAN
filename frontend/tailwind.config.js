/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          500: '#0EA5E9',
          600: '#0284C7',
        },
        sakan: {
          DEFAULT: '#25D1F4',
          hover: '#1abddf',
        }
      }
    },
  },
  plugins: [],
}
