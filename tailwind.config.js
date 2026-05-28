/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d5e0ff',
          300: '#b2c5ff',
          400: '#839eff',
          500: '#4d6eff',
          600: '#2c47ff',
          700: '#1727ff',
          800: '#0c15e0',
          900: '#060bb5',
        },
        dark: {
          50: '#f4f4f6',
          100: '#e3e3e7',
          200: '#c5c5cf',
          300: '#9d9db0',
          400: '#76768e',
          500: '#5a5a73',
          600: '#454559',
          700: '#30303e',
          800: '#1c1c24',
          900: '#0e0e12',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
